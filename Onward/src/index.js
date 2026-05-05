import minimist from 'minimist';
import {
  appendListingEventEntries,
  appendProductionLogEntries,
  appendWorkflowAuditEntries,
  getPropertyRows
} from './sheets.js';
import { getPropertyMediaAssets, uploadRenderedImageToDrive } from './drive.js';
import { buildContext, renderHtml, buildCarouselMeta } from './template.js';
import { renderHtmlToPng, renderHtmlToVideo } from './renderer.js';
import { createPdfFromImages } from './pdf.js';
import { fetchIncomeTiersForCoordinates } from './census.js';
import { FORMATS, BROCHURE_PAGES, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './config.js';

function slugify(text, fallback = 'property') {
  return (
    text
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || fallback
  );
}

const argv = minimist(process.argv.slice(2));
const mode = argv.mode || 'one'; // one | all
const index = argv.index !== undefined ? Number(argv.index) : 0;
const limit = argv.limit !== undefined ? Number(argv.limit) : undefined;
const verbose = Boolean(argv.verbose);
const listingIdArg = argv['listing-id'] ? String(argv['listing-id']).trim() : '';
const requestedOutputs = String(argv.outputs || '')
  .split(',')
  .map(x => x.trim().toLowerCase())
  .filter(Boolean);
const requestedOutputSet = new Set(requestedOutputs);
const renderBrochure =
  Boolean(argv.brochure) ||
  requestedOutputSet.has('brochure') ||
  requestedOutputSet.has('pdf');
const INCOME_TIER_KEYS = ['0_14K', '15_24K', '25_34K', '35_49K', '50_74K', '75_99K', '100K_PLUS'];
const runId = `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`;

function getListingId(row, indexNumber) {
  return row.LISTING_ID || row.ID || `row-${indexNumber + 2}`;
}

function resolveRequestedFormatKeys() {
  if (!requestedOutputSet.size) return null;
  const keys = new Set();
  for (const token of requestedOutputSet) {
    if (token === 'social-cards') {
      keys.add('hero');
      keys.add('square');
      keys.add('story');
      continue;
    }
    if (token === 'image') {
      keys.add('hero');
      continue;
    }
    if (token === 'video') {
      keys.add('tiktok');
      continue;
    }
    if (token === 'pdf' || token === 'brochure') {
      continue;
    }
    keys.add(token);
  }
  return keys;
}

const requestedFormatKeys = resolveRequestedFormatKeys();

async function logProductionEntries(entries) {
  if (!Array.isArray(entries) || !entries.length) return;
  try {
    await appendProductionLogEntries(entries);
  } catch (error) {
    console.warn(
      `⚠️ Production log write skipped: ${error?.message || String(error)}`
    );
  }
}

async function logListingEvents(entries) {
  if (!Array.isArray(entries) || !entries.length) return;
  try {
    await appendListingEventEntries(entries);
  } catch (error) {
    console.warn(`⚠️ Listing event log skipped: ${error?.message || String(error)}`);
  }
}

async function logWorkflowAudit(entries) {
  if (!Array.isArray(entries) || !entries.length) return;
  try {
    await appendWorkflowAuditEntries(entries);
  } catch (error) {
    console.warn(`⚠️ Workflow audit log skipped: ${error?.message || String(error)}`);
  }
}

function parseCoordinate(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const num = Number(String(value).trim());
  return Number.isFinite(num) ? num : null;
}

async function enrichRowWithCensusData(row) {
  const hasIncomeTiers = INCOME_TIER_KEYS.some(
    key => row[`DEMO_INCOME_${key}_HOUSEHOLDS`] !== undefined
  );
  if (hasIncomeTiers) return row;

  const lat =
    parseCoordinate(row.MAP_LATITUDE) ??
    parseCoordinate(row.LATITUDE) ??
    parseCoordinate(row.LAT) ??
    parseCoordinate(row.COORD_LATITUDE) ??
    parseCoordinate(row.COORD_LAT);
  const lon =
    parseCoordinate(row.MAP_LONGITUDE) ??
    parseCoordinate(row.LONGITUDE) ??
    parseCoordinate(row.LON) ??
    parseCoordinate(row.LNG) ??
    parseCoordinate(row.COORD_LONGITUDE);

  if (lat == null || lon == null) return row;

  const tiers = await fetchIncomeTiersForCoordinates(lat, lon);
  if (!tiers) return row;

  const nextRow = { ...row };
  for (const [key, value] of Object.entries(tiers)) {
    nextRow[`DEMO_INCOME_${key}_HOUSEHOLDS`] = value;
  }
  return nextRow;
}

async function processRow(row, i) {
  if (!row.FOLDER_ID) throw new Error(`Row ${i + 2}: Missing FOLDER_ID`);
  const logEntries = [];
  const listingId = getListingId(row, i);
  const address = row.ADDRESS_LINE_1 || '';
  const now = () => new Date().toISOString();

  if (verbose) {
    console.log(`\n▶ Processing row ${i + 1}: ${row.ADDRESS_LINE_1 || 'Unnamed property'}`);
  }
  await logListingEvents([
    {
      timestamp: now(),
      runId,
      listingId,
      address,
      eventType: 'RENDER_ROW_STARTED',
      status: 'IN_PROGRESS',
      details: `mode=${mode}`
    }
  ]);

  const { heroImageUrl, carouselPhotoUrls } = await getPropertyMediaAssets(
    row.FOLDER_ID
  );

  const qrCodeUrl = row.PROPERTY_URL
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        row.PROPERTY_URL
      )}`
    : '';

  const enrichedRow = await enrichRowWithCensusData(row);

  const baseContext = await buildContext(enrichedRow, {
    heroFileUrl: heroImageUrl,
    qrCodeUrl,
    carouselPhotos: carouselPhotoUrls
  });

  const baseName = slugify(enrichedRow.ADDRESS_LINE_1, `property-${i + 1}`);
  const baseVideoDuration =
    baseContext.CAROUSEL_VIDEO_DURATION || baseContext.CAROUSEL_DURATION;

  // Render all configured media formats for this property
  const activeFormats = requestedFormatKeys
    ? FORMATS.filter(format => requestedFormatKeys.has(format.key))
    : FORMATS;

  if (!activeFormats.length && !renderBrochure) {
    throw new Error('No render outputs selected. Provide --outputs or --brochure.');
  }

  for (const format of activeFormats) {
    const isVideo = format.type === 'video';
    const formatDuration = isVideo
      ? format.duration || baseVideoDuration
      : format.duration;

    let contextForFormat = {
      ...baseContext,
      CURRENT_FORMAT_KEY: format.key,
      CURRENT_FORMAT_LABEL: format.label,
      VIDEO_DURATION: formatDuration || baseVideoDuration,
      CAROUSEL_AUTO_PLAY: isVideo ? false : baseContext.CAROUSEL_AUTO_PLAY
    };

    if (
      format.maxCarouselPhotos &&
      Array.isArray(baseContext.CAROUSEL_PHOTOS) &&
      baseContext.CAROUSEL_PHOTOS.length > format.maxCarouselPhotos
    ) {
      const limitedSlides = baseContext.CAROUSEL_PHOTOS.slice(
        0,
        format.maxCarouselPhotos
      );
      const {
        slides,
        count,
        hasCarousel,
        durationSeconds,
        startDelaySeconds,
        videoDurationSeconds,
        trackKeyframes
      } = buildCarouselMeta(limitedSlides);
      contextForFormat = {
        ...contextForFormat,
        CAROUSEL_PHOTOS: slides,
        CAROUSEL_COUNT: count,
        HAS_CAROUSEL: hasCarousel,
        CAROUSEL_DURATION: durationSeconds,
        CAROUSEL_START_DELAY: startDelaySeconds,
        CAROUSEL_VIDEO_DURATION: videoDurationSeconds,
        CAROUSEL_TRACK_KEYFRAMES: trackKeyframes
      };
    }

    const html = renderHtml(contextForFormat, format.templateFile);

    const filePath = isVideo
      ? await renderHtmlToVideo(html, baseName, {
          width: format.width,
          height: format.height,
          suffix: format.suffix,
          duration: formatDuration || baseVideoDuration
        })
      : await renderHtmlToPng(html, baseName, {
          width: format.width,
          height: format.height,
          suffix: format.suffix
        });

    // Upload to Drive, if configured
    await uploadRenderedImageToDrive(filePath);
    logEntries.push({
      timestamp: now(),
      runId,
      listingId,
      address,
      status: 'SUCCESS',
      outputType: isVideo ? 'video' : 'image',
      outputKey: format.key,
      filePath,
      message: 'Format rendered successfully'
    });
  }

  if (renderBrochure) {
    const brochurePdfPath = await renderBrochurePages(baseName, baseContext);
    if (brochurePdfPath) {
      logEntries.push({
        timestamp: now(),
        runId,
        listingId,
        address,
        status: 'SUCCESS',
        outputType: 'pdf',
        outputKey: 'brochure',
        filePath: brochurePdfPath,
        message: 'Brochure generated successfully'
      });
    }
  }

  await logProductionEntries(logEntries);
  await logListingEvents([
    {
      timestamp: now(),
      runId,
      listingId,
      address,
      eventType: 'RENDER_ROW_COMPLETED',
      status: 'SUCCESS',
      details: `outputs=${logEntries.length}`
    }
  ]);
}

async function renderBrochurePages(baseName, baseContext) {
  const renderedPages = [];
  for (const page of BROCHURE_PAGES) {
    const pageWidth = page.width || VIEWPORT_WIDTH;
    const pageHeight = page.height || VIEWPORT_HEIGHT;
    const mapVariantKey = page.mapVariant ? page.mapVariant.toUpperCase() : null;
    const contextForPage = {
      ...baseContext,
      CURRENT_BROCHURE_PAGE_KEY: page.key,
      CURRENT_BROCHURE_PAGE_LABEL: page.label,
      BROCHURE_PAGE_NUMBER: page.pageNumber,
      BROCHURE_PAGE_META: page,
      BROCHURE_TOTAL_PAGES: BROCHURE_PAGES.length
    };

    if (mapVariantKey) {
      contextForPage.MAP_PAGE =
        baseContext.PROPERTY_MAP_VARIANTS?.[mapVariantKey] || null;
    }

    if (typeof page.photoPageIndex === 'number') {
      contextForPage.ACTIVE_PHOTO_PAGE =
        baseContext.PHOTO_PAGES?.[page.photoPageIndex] || null;
    }

    const html = renderHtml(contextForPage, page.templateFile);
    const suffix =
      page.suffix ||
      `-brochure-${String(page.pageNumber || 0).padStart(2, '0')}`;

    const filePath = await renderHtmlToPng(html, baseName, {
      width: pageWidth,
      height: pageHeight,
      suffix
    });

    renderedPages.push(filePath);
  }

  if (!renderedPages.length) {
    return null;
  }

  const pdfPath = await createPdfFromImages(renderedPages, baseName, {
    suffix: '-brochure'
  });

  if (pdfPath) {
    await uploadRenderedImageToDrive(pdfPath);
    console.log(`📄 Brochure PDF created: ${pdfPath}`);
  }

  return pdfPath;
}

async function main() {
  await logWorkflowAudit([
    {
      timestamp: new Date().toISOString(),
      runId,
      workflow: 'renderer',
      step: 'RUN_STARTED',
      status: 'IN_PROGRESS',
      entityType: 'run',
      entityId: runId,
      message: `mode=${mode}`
    }
  ]);

  const rows = await getPropertyRows();
  if (!rows.length) {
    console.error('❌ No rows found in sheet');
    process.exit(1);
  }

  if (verbose) {
    console.log(`Found ${rows.length} rows after filtering.`);
  }

  if (mode === 'one') {
    const row = listingIdArg
      ? rows.find((item, idx) => getListingId(item, idx).toLowerCase() === listingIdArg.toLowerCase())
      : rows[index];
    if (!row) throw new Error(`Row index ${index} is out of range`);
    const selectedIndex = rows.indexOf(row);
    try {
      await processRow(row, selectedIndex >= 0 ? selectedIndex : index);
    } catch (error) {
      await logProductionEntries([
        {
          timestamp: new Date().toISOString(),
          runId,
          listingId: getListingId(row, selectedIndex >= 0 ? selectedIndex : index),
          address: row.ADDRESS_LINE_1 || '',
          status: 'FAILED',
          outputType: 'run',
          outputKey: 'row',
          filePath: '',
          message: error?.message || String(error)
        }
      ]);
      await logListingEvents([
        {
          timestamp: new Date().toISOString(),
          runId,
          listingId: getListingId(row, selectedIndex >= 0 ? selectedIndex : index),
          address: row.ADDRESS_LINE_1 || '',
          eventType: 'RENDER_ROW_FAILED',
          status: 'FAILED',
          details: error?.message || String(error)
        }
      ]);
      throw error;
    }
  } else if (mode === 'all') {
    const total = typeof limit === 'number' ? Math.min(limit, rows.length) : rows.length;

    for (let i = 0; i < total; i++) {
      try {
        await processRow(rows[i], i);
      } catch (error) {
        await logProductionEntries([
          {
            timestamp: new Date().toISOString(),
            runId,
            listingId: getListingId(rows[i], i),
            address: rows[i].ADDRESS_LINE_1 || '',
            status: 'FAILED',
            outputType: 'run',
            outputKey: 'row',
            filePath: '',
            message: error?.message || String(error)
          }
        ]);
        await logListingEvents([
          {
            timestamp: new Date().toISOString(),
            runId,
            listingId: getListingId(rows[i], i),
            address: rows[i].ADDRESS_LINE_1 || '',
            eventType: 'RENDER_ROW_FAILED',
            status: 'FAILED',
            details: error?.message || String(error)
          }
        ]);
        throw error;
      }
    }
  } else {
    console.error(`Unknown mode: ${mode}`);
  }

  await logWorkflowAudit([
    {
      timestamp: new Date().toISOString(),
      runId,
      workflow: 'renderer',
      step: 'RUN_COMPLETED',
      status: 'SUCCESS',
      entityType: 'run',
      entityId: runId,
      message: 'Render run finished successfully'
    }
  ]);
}

main().catch(err => {
  logWorkflowAudit([
    {
      timestamp: new Date().toISOString(),
      runId,
      workflow: 'renderer',
      step: 'RUN_FAILED',
      status: 'FAILED',
      entityType: 'run',
      entityId: runId,
      message: err?.message || String(err)
    }
  ]).finally(() => {
    console.error('🔥 Fatal Error:', err);
    process.exit(1);
  });
});
