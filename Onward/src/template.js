import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import {
  LOGO_PATH,
  FOOTER_BG_PATH,
  BRIDGE_BG_PATH,
  BROCHURE_INFO_BG_PATH,
  TEMPLATES_DIR,
  TEMPLATE_FILE
} from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Preload static assets and embed as data URLs so they are
// always available in the rendered HTML.
let logoDataUrl = '';
let footerBgDataUrl = '';
let bridgeBgDataUrl = '';
let brochureInfoBgDataUrl = '';

try {
  const logoBuffer = fs.readFileSync(LOGO_PATH);
  logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch {
  logoDataUrl = '';
}

try {
  const footerBuffer = fs.readFileSync(FOOTER_BG_PATH);
  footerBgDataUrl = `data:image/png;base64,${footerBuffer.toString('base64')}`;
} catch {
  footerBgDataUrl = '';
}

try {
  const bridgeBuffer = fs.readFileSync(BRIDGE_BG_PATH);
  bridgeBgDataUrl = `data:image/png;base64,${bridgeBuffer.toString('base64')}`;
} catch {
  bridgeBgDataUrl = '';
}

try {
  const infoBgBuffer = fs.readFileSync(BROCHURE_INFO_BG_PATH);
  brochureInfoBgDataUrl = `data:image/jpeg;base64,${infoBgBuffer.toString('base64')}`;
} catch {
  brochureInfoBgDataUrl = '';
}


function buildLocation(line1, line2) {
  return [line1, line2].filter(Boolean).join(', ');
}

function parseHighlights(raw = '') {
  return raw
    .split(/\r?\n|[;|]/)
    .map(item => item.replace(/^[•\-\s]+/, '').trim())
    .filter(Boolean);
}

function parseStatPairs(raw = '') {
  if (!raw) return [];
  const pairs = [];
  const regex = /(\d+(?:\.\d+)?%?)\s*([^,]+?)(?:,|$)/gim;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const value = match[1]?.trim();
    const label = match[2]?.replace(/\s+/g, ' ').trim();
    if (value && label) {
      pairs.push({ value, label });
    }
  }

  if (!pairs.length) {
    const tokens = raw
      .split(/[,|\n]/)
      .map(token => token.trim())
      .filter(Boolean);
    for (let i = 0; i < tokens.length - 1; i += 2) {
      pairs.push({
        value: tokens[i],
        label: tokens[i + 1]
      });
    }
  }

  return pairs;
}

const filenameCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
});

function getEntryName(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  return entry.name || '';
}

function extractSequenceNumber(name = '') {
  const match = (name || '').match(/^(\d{1,4})[\s._-]?/);
  return match ? Number(match[1]) : null;
}

function orderPhotosBySequence(entries = []) {
  return [...entries].sort((a, b) => {
    const nameA = getEntryName(a).toLowerCase();
    const nameB = getEntryName(b).toLowerCase();
    const seqA = extractSequenceNumber(nameA);
    const seqB = extractSequenceNumber(nameB);
    const hasSeqA = typeof seqA === 'number';
    const hasSeqB = typeof seqB === 'number';

    if (hasSeqA && hasSeqB && seqA !== seqB) {
      return seqA - seqB;
    }
    if (hasSeqA && !hasSeqB) return -1;
    if (!hasSeqA && hasSeqB) return 1;

    return filenameCollator.compare(nameA, nameB);
  });
}

function chunkArray(items = [], size = 1) {
  if (size <= 0) return [items];
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1
});

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const cleaned = String(value).replace(/[^0-9.\-]+/g, '').trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatNumberValue(value, style = 'number') {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value !== 'number') return String(value);
  if (style === 'currency') return currencyFormatter.format(value);
  if (style === 'decimal') return decimalFormatter.format(value);
  if (style === 'percent') {
    const ratio = Math.abs(value) > 1 ? value / 100 : value;
    return percentFormatter.format(ratio);
  }
  return numberFormatter.format(value);
}

const INCOME_TIERS = [
  { key: '0_14K', label: '$0–14k', midpoint: 7000 },
  { key: '15_24K', label: '$15–24k', midpoint: 19500 },
  { key: '25_34K', label: '$25–34k', midpoint: 29500 },
  { key: '35_49K', label: '$35–49k', midpoint: 42000 },
  { key: '50_74K', label: '$50–74k', midpoint: 62000 },
  { key: '75_99K', label: '$75–99k', midpoint: 87000 },
  { key: '100K_PLUS', label: '$100k+', midpoint: 125000 }
];

function parseKeyFacts(raw = '') {
  const tokens = raw
    .split(/\r?\n|[;|]/)
    .map(line => line.replace(/,+$/, '').trim())
    .filter(Boolean);

  const results = [];
  const used = new Set();

  tokens.forEach((entry, index) => {
    if (used.has(index)) return;
    const parts = entry.split(/[:\-–]/);
    if (parts.length >= 2) {
      const [labelPart, valuePart] = parts;
      const label = labelPart.trim();
      const value = valuePart.trim();
      if (label && value) {
        results.push({ label, value });
        used.add(index);
      }
    }
  });

  const isNumericValue = value => /[\d$.,]/.test(value) && !/[a-z]/i.test(value);
  const leftover = tokens
    .map((token, idx) => ({ token, idx }))
    .filter(({ idx }) => !used.has(idx));

  for (let i = 0; i < leftover.length - 1; i += 2) {
    const valueCandidate = leftover[i].token;
    const labelCandidate = leftover[i + 1].token;
    if (isNumericValue(valueCandidate) && !isNumericValue(labelCandidate)) {
      results.push({ label: labelCandidate, value: valueCandidate });
      used.add(leftover[i].idx);
      used.add(leftover[i + 1].idx);
    }
  }

  return results;
}

function parseLatLngPair(value) {
  if (!value) return null;
  const text = String(value).trim();
  if (!text) return null;
  const match = text.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = parseNumber(match[1]);
  const lng = parseNumber(match[2]);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

function pickFirstField(source, keys = []) {
  if (!source || !Array.isArray(keys)) return '';
  for (const key of keys) {
    if (!key) continue;
    const value = source[key];
    if (value) return value;
  }
  return '';
}

function buildKeyFactsList(row) {
  const keyFacts = [
    {
      label: 'Population',
      value: parseNumber(row.DEMO_POPULATION ?? row.POPULATION),
      format: 'number'
    },
    {
      label: 'Median Age',
      value: parseNumber(row.DEMO_MEDIAN_AGE ?? row.MEDIAN_AGE),
      format: 'decimal'
    },
    {
      label: 'Households',
      value: parseNumber(row.DEMO_HOUSEHOLDS ?? row.HOUSEHOLDS),
      format: 'number'
    },
    {
      label: 'Median Disposable Income',
      value:
        parseNumber(row.DEMO_MEDIAN_DISPOSABLE_INCOME ?? row.MEDIAN_DISPOSABLE_INCOME) ??
        parseNumber(row.DEMO_MEDIAN_INCOME ?? row.MEDIAN_INCOME),
      format: 'currency'
    }
  ];

  return keyFacts
    .filter(item => item.value !== null && item.value !== undefined)
    .map(item => ({
      label: item.label,
      value: formatNumberValue(item.value, item.format)
    }));
}

function collectIncomeTierSeries(row) {
  return INCOME_TIERS.map(tier => {
    const households =
      parseNumber(row[`DEMO_INCOME_${tier.key}_HOUSEHOLDS`]) ??
      parseNumber(row[`INCOME_${tier.key}_HOUSEHOLDS`]) ??
      parseNumber(row[`INCOME_${tier.key}`]);
    if (households == null || households <= 0) return null;
    const label = row[`DEMO_INCOME_${tier.key}_LABEL`] || tier.label;
    const midpoint =
      parseNumber(row[`DEMO_INCOME_${tier.key}_MIDPOINT`]) ?? tier.midpoint ?? 0;
    const totalIncome = households * midpoint;
    return {
      label,
      households,
      midpoint,
      totalIncome
    };
  }).filter(Boolean);
}

function buildEducationStats(row) {
  const entries = [
    {
      label: 'Graduate / Professional',
      value:
        parseNumber(row.DEMO_EDUCATION_GRADUATE ?? row.EDUCATION_GRADUATE ?? row.EDUCATION_GRAD) ??
        null
    },
    {
      label: "Bachelor's Degree",
      value:
        parseNumber(row.DEMO_EDUCATION_BACHELOR ?? row.EDUCATION_BACHELOR ?? row.EDUCATION_BA) ??
        null
    },
    {
      label: 'Some College / Associate',
      value:
        parseNumber(
          row.DEMO_EDUCATION_SOME_COLLEGE ?? row.EDUCATION_SOME_COLLEGE ?? row.EDUCATION_ASSOCIATE
        ) ?? null
    },
    {
      label: 'High School or Less',
      value:
        parseNumber(
          row.DEMO_EDUCATION_HS_OR_LESS ?? row.EDUCATION_HS_OR_LESS ?? row.EDUCATION_HS
        ) ?? null
    }
  ];

  const normalized = entries
    .filter(item => item.value !== null && item.value !== undefined)
    .map(item => ({
      label: item.label,
      value: formatNumberValue(item.value, 'percent')
    }));

  if (normalized.length) {
    return normalized;
  }

  const fallback = row.DEMO_EDUCATION_LIST || row.EDUCATION_LIST || row.EDUCATION_TEXT;
  if (fallback) {
    return parseStatPairs(fallback);
  }

  return [];
}

function buildEmploymentStats(row) {
  const entries = [
    {
      label: 'White Collar',
      value:
        parseNumber(
          row.DEMO_EMPLOYMENT_WHITE_COLLAR ?? row.EMPLOYMENT_WHITE_COLLAR ?? row.EMPLOYMENT_WHITE
        ) ?? null
    },
    {
      label: 'Blue Collar',
      value:
        parseNumber(
          row.DEMO_EMPLOYMENT_BLUE_COLLAR ?? row.EMPLOYMENT_BLUE_COLLAR ?? row.EMPLOYMENT_BLUE
        ) ?? null
    },
    {
      label: 'Service / Retail',
      value:
        parseNumber(
          row.DEMO_EMPLOYMENT_SERVICE ?? row.EMPLOYMENT_SERVICE ?? row.EMPLOYMENT_RETAIL
        ) ?? null
    },
    {
      label: 'Unemployment Rate',
      value:
        parseNumber(
          row.DEMO_EMPLOYMENT_UNEMPLOYED ??
            row.EMPLOYMENT_UNEMPLOYED ??
            row.UNEMPLOYMENT_RATE ??
            row.DEMO_UNEMPLOYMENT_RATE
        ) ?? null
    }
  ];

  const normalized = entries
    .filter(item => item.value !== null && item.value !== undefined)
    .map(item => ({
      label: item.label,
      value: formatNumberValue(item.value, 'percent')
    }));

  if (normalized.length) {
    return normalized;
  }

  const fallback = row.DEMO_EMPLOYMENT_LIST || row.EMPLOYMENT_LIST || row.EMPLOYMENT_TEXT;
  if (fallback) {
    return parseStatPairs(fallback);
  }

  return [];
}

function buildIncomeList(series = []) {
  if (!series.length) return [];
  return series.map(item => ({
    label: item.label,
    value: `${formatNumberValue(item.households, 'number')} HH`
  }));
}

function escapeXml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createIncomePopulationChart(series = []) {
  if (!series.length) return '';
  const width = 900;
  const height = 360;
  const margin = { top: 50, right: 30, bottom: 70, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const gap = 30;
  const barWidth = Math.max(40, (chartWidth - gap * (series.length + 1)) / series.length);
  const maxTotal = Math.max(...series.map(point => point.totalIncome || 0)) || 1;

  const bars = series
    .map((point, index) => {
      const barHeight = Math.max(8, (point.totalIncome / maxTotal) * chartHeight);
      const x = margin.left + gap + index * (barWidth + gap);
      const y = margin.top + (chartHeight - barHeight);
      const valueLabel = formatNumberValue(point.totalIncome, 'currency');
      const popLabel = `${formatNumberValue(point.population)} people`;
      const incomeLabel = `${formatNumberValue(point.income, 'currency')} income`;
      const labelX = x + barWidth / 2;
      const labelY = height - margin.bottom + 24;
      return `
        <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(
        2
      )}" height="${barHeight.toFixed(2)}" rx="10" fill="#0c3440"/>
        <text x="${labelX.toFixed(2)}" y="${(y - 10).toFixed(
        2
      )}" fill="#0c3440" font-size="16" font-weight="600" text-anchor="middle">${escapeXml(
        valueLabel
      )}</text>
        <text x="${labelX.toFixed(
          2
        )}" y="${labelY.toFixed(2)}" fill="#0c3440" font-size="16" font-weight="600" text-anchor="middle">${escapeXml(
        point.label
      )}</text>
        <text x="${labelX.toFixed(
          2
        )}" y="${(labelY + 18).toFixed(2)}" fill="#65727a" font-size="13" text-anchor="middle">${escapeXml(
        popLabel
      )}</text>
        <text x="${labelX.toFixed(
          2
        )}" y="${(labelY + 34).toFixed(2)}" fill="#65727a" font-size="13" text-anchor="middle">${escapeXml(
        incomeLabel
      )}</text>
      `;
    })
    .join('');

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Source Sans Pro', Arial, sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="#f9f7f4" rx="24"/>
      <g>
        <text x="${margin.left}" y="${margin.top - 20}" fill="#0c3440" font-size="20" font-weight="600">
          Income Capacity by Trade Area
        </text>
        <text x="${margin.left}" y="${margin.top}" fill="#65727a" font-size="14">
          Total disposable income (median income × population)
        </text>
      </g>
      <g>
        <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${width - margin.right}" y2="${
    margin.top + chartHeight
  }" stroke="#d9dfe3" stroke-width="2"/>
        ${bars}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function fetchImageAsDataUrl(url) {
  if (!url) return '';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('Failed to fetch image', url, response.status);
      return '';
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.warn('Failed to fetch image', url, error.message);
    return '';
  }
}

async function buildStaticMapImageData({
  lat,
  lng,
  zoom = 15,
  width = 600,
  height = 360,
  marker = 'lightblue1',
  markers = []
} = {}) {
  const centerLat = lat ?? markers[0]?.lat;
  const centerLng = lng ?? markers[0]?.lng;
  if (centerLat == null || centerLng == null) return '';
  const normalizedMarkers = (Array.isArray(markers) && markers.length
    ? markers
    : [{ lat: centerLat, lng: centerLng, color: marker }]
  ).filter(entry => entry && entry.lat != null && entry.lng != null);
  if (!normalizedMarkers.length) return '';
  const providers = [
    () => {
      const safeWidth = Math.min(Math.max(100, Math.floor(width)), 650);
      const safeHeight = Math.min(Math.max(100, Math.floor(height)), 450);
      const markerString = normalizedMarkers
        .map(markerEntry => {
          const style =
            markerEntry.yandexStyle ||
            (markerEntry.color && markerEntry.color.toLowerCase().includes('blue') ? 'pm2blm' : 'pm2rdm');
          return `${markerEntry.lng},${markerEntry.lat},${style}`;
        })
        .join('~');
      const layers = 'sat,skl';
      return `https://static-maps.yandex.ru/1.x/?ll=${centerLng},${centerLat}&size=${safeWidth},${safeHeight}&z=${zoom}&l=${layers}&pt=${markerString}`;
    }
  ];

  for (const buildUrl of providers) {
    const candidate = buildUrl();
    const dataUrl = await fetchImageAsDataUrl(candidate);
    if (dataUrl) return dataUrl;
  }

  return '';
}

async function fetchNearbyRetailers(coords, { radius = 1200, limit = 10 } = {}) {
  if (!coords || coords.lat == null || coords.lng == null) return [];
  const amenityCategories = ['fast_food', 'restaurant', 'cafe', 'bar', 'pub', 'supermarket', 'convenience', 'pharmacy', 'bank', 'fuel'];
  const query = `
    [out:json][timeout:25];
    (
      node(around:${radius},${coords.lat},${coords.lng})[amenity~"^(${amenityCategories.join('|')})$"];
      node(around:${radius},${coords.lat},${coords.lng})[shop];
    );
    out body ${limit};
  `;
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query })
    });
    if (!response.ok) return [];
    const data = await response.json();
    const elements = Array.isArray(data.elements) ? data.elements : [];
    return elements
      .filter(el => typeof el.lat === 'number' && typeof el.lon === 'number')
      .slice(0, limit)
      .map(el => ({
        lat: el.lat,
        lng: el.lon,
        name: el.tags?.name || ''
      }));
  } catch (error) {
    console.warn('Failed to fetch nearby retailers', error);
    return [];
  }
}

async function buildRetailerMapImageData(center, retailers = [], {
  width = 1000,
  height = 800,
  zoom = center?.zoom ?? 15
} = {}) {
  if (!center || center.lat == null || center.lng == null) return '';
  const markers = [
    { lat: center.lat, lng: center.lng, color: 'lightblue1', label: 'C' }
  ];
  retailers.forEach((poi, idx) => {
    if (poi.lat == null || poi.lng == null) return;
    const label = idx < 26 ? String.fromCharCode(65 + idx) : '';
    markers.push({ lat: poi.lat, lng: poi.lng, color: 'red', label });
  });
  return buildStaticMapImageData({
    lat: center.lat,
    lng: center.lng,
    zoom,
    width,
    height,
    markers
  });
}

function getMapCoordinates(row) {
  let lat =
    parseNumber(row.MAP_LATITUDE ?? row.LATITUDE ?? row.LAT ?? row.COORD_LATITUDE ?? row.COORD_LAT) ??
    null;
  let lng =
    parseNumber(row.MAP_LONGITUDE ?? row.LONGITUDE ?? row.LON ?? row.LNG ?? row.COORD_LONGITUDE) ?? null;

  if (lat == null || lng == null) {
    const coordinateSources = [
      row.MAP_COORDINATES,
      row.MAP_CENTER,
      row.COORDINATES,
      row.GPS_COORDINATES,
      row.COORD_PAIR,
      row.COORDINATE_PAIR
    ];
    for (const value of coordinateSources) {
      const parsed = parseLatLngPair(value);
      if (parsed) {
        lat = parsed.lat;
        lng = parsed.lng;
        break;
      }
    }
  }

  if (lat == null || lng == null) return null;
  const zoom =
    parseNumber(row.MAP_ZOOM ?? row.DEMO_MAP_ZOOM ?? row.COORD_ZOOM ?? row.MAP_COORDINATE_ZOOM) ?? 15;
  return { lat, lng, zoom };
}

function buildCarouselMeta(carouselSlidesInput = []) {
  const carouselSlides = Array.isArray(carouselSlidesInput)
    ? carouselSlidesInput
    : [];
  const carouselCount = Math.max(1, carouselSlides.length);
  const MAX_VIDEO_DURATION_SECONDS = 8;
  const MIN_HOLD_SECONDS = 1.5;
  const slidesForTiming = carouselSlides.length || 1;
  const maxPerSlide = MAX_VIDEO_DURATION_SECONDS / slidesForTiming;
  const holdSeconds = carouselSlides.length
    ? Math.min(MIN_HOLD_SECONDS, maxPerSlide)
    : MIN_HOLD_SECONDS;
  const secondsPerSlide = holdSeconds;
  const rawDuration = secondsPerSlide * slidesForTiming;
  const carouselDurationSeconds =
    Number(rawDuration.toFixed(4)) || MIN_HOLD_SECONDS;
  const carouselStartDelaySeconds = Number(
    Math.min(0.5, holdSeconds / 2).toFixed(4)
  );
  const carouselVideoDurationSeconds = Number(
    (carouselDurationSeconds + carouselStartDelaySeconds).toFixed(4)
  );
  const slidePercent = carouselSlides.length
    ? 100 / carouselSlides.length
    : 100;
  const epsilon = slidePercent > 0 ? Math.min(0.01, slidePercent / 1000) : 0;

  const translateForIndex = slideIdx => {
    if (!carouselSlides.length) return '0%';
    return `${-100 * slideIdx}%`;
  };

  const trackKeyframes = [];
  if (carouselSlides.length) {
    for (let idx = 0; idx < carouselSlides.length; idx += 1) {
      const startPercent = Number((idx * slidePercent).toFixed(4));
      const endPercent = Number(
        Math.min(100, (idx + 1) * slidePercent).toFixed(4)
      );
      const translateCurrent = translateForIndex(idx);
      if (
        !trackKeyframes.length ||
        trackKeyframes[trackKeyframes.length - 1].percent !== startPercent
      ) {
        trackKeyframes.push({
          percent: startPercent,
          translate: translateCurrent
        });
      }

      const exitPercent = Number(
        Math.max(startPercent, endPercent - epsilon).toFixed(4)
      );
      if (exitPercent > startPercent) {
        trackKeyframes.push({
          percent: exitPercent,
          translate: translateCurrent
        });
      }

      const translateNext =
        idx + 1 < carouselSlides.length ? translateForIndex(idx + 1) : '0%';
      trackKeyframes.push({
        percent: endPercent,
        translate: translateNext
      });
    }
  } else {
    trackKeyframes.push(
      { percent: 0, translate: '0%' },
      { percent: 100, translate: '0%' }
    );
  }

  return {
    slides: carouselSlides,
    count: carouselCount,
    hasCarousel: carouselSlides.length > 0,
    durationSeconds: carouselDurationSeconds,
    startDelaySeconds: carouselStartDelaySeconds,
    videoDurationSeconds: carouselVideoDurationSeconds,
    trackKeyframes
  };
}

const compiledTemplates = new Map();

function getTemplate(templateFile = TEMPLATE_FILE) {
  const templatePath = path.resolve(TEMPLATES_DIR, templateFile);
  if (compiledTemplates.has(templatePath)) {
    return compiledTemplates.get(templatePath);
  }

  const html = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(html);
  compiledTemplates.set(templatePath, template);
  return template;
}

export async function buildContext(row, { heroFileUrl, qrCodeUrl, carouselPhotos = [] }) {
  const addressLine1 = row.ADDRESS_LINE_1 || '';
  const addressLine2 = row.ADDRESS_LINE_2 || '';
  const propertyTitle = row.PROPERTY_TITLE || row.PROPERTY_NAME || addressLine1 || 'Property Overview';
  const location = buildLocation(addressLine1, addressLine2);
  const highlights = parseHighlights(row.PROPERTY_HIGHLIGHTS || row.HIGHLIGHTS || '');
  const manualKeyFacts = parseKeyFacts(
    row.KEY_FACTS ||
      row.KEY_FACTS_TEXT ||
      row.KEY_FACTS_LIST ||
      row.KEY_FACTS_DATA ||
      ''
  );
  const autoKeyFacts = buildKeyFactsList(row);
  const keyFactsList = manualKeyFacts.length ? manualKeyFacts : autoKeyFacts;
  const educationStats = buildEducationStats(row);
  const employmentStats = buildEmploymentStats(row);
  const normalizedCarousel = orderPhotosBySequence(carouselPhotos)
    .filter(Boolean)
    .map((entry, index) => {
      const photoUrl = typeof entry === 'string' ? entry : entry.url || '';
      const name = typeof entry === 'string' ? '' : entry.name || '';
      return {
        url: photoUrl,
        name,
        index: index + 1,
        backgroundUrl: photoUrl
      };
    });
  const findPhotoByKeywords = keywords =>
    normalizedCarousel.find(entry => {
      if (typeof entry.name !== 'string') return false;
      const lower = entry.name.toLowerCase();
      return keywords.some(keyword => lower.includes(keyword));
    });
  const heroPhotoEntry = findPhotoByKeywords(['01', 'hero']);
  const landViewPhotoEntry = findPhotoByKeywords(['02', 'landview']);
  const retailerPhotoEntry = findPhotoByKeywords(['retailer']);

  const {
    slides: carouselSlides,
    count: carouselCount,
    hasCarousel,
    durationSeconds: carouselDurationSeconds,
    startDelaySeconds: carouselStartDelaySeconds,
    videoDurationSeconds: carouselVideoDurationSeconds,
    trackKeyframes
  } = buildCarouselMeta(normalizedCarousel);
  const heroImage = heroFileUrl || heroPhotoEntry?.url || normalizedCarousel[0]?.url || '';
  const overviewPhotoUrl = landViewPhotoEntry?.url || heroImage;

  const numberedPhotos = normalizedCarousel.filter(entry => {
    if (typeof entry.name !== 'string') return false;
    return /^\d/.test(entry.name.trim());
  });
  const photoPagesSource = numberedPhotos.length ? numberedPhotos : carouselSlides;
  const photoPages = chunkArray(photoPagesSource, 4).map((photos, index) => ({
    index: index + 1,
    photos
  }));

  const makeMapVariant = (prefix, fallbackTitle) => {
    const upper = prefix.toUpperCase();
    return {
      key: upper,
      title: row[`${upper}_TITLE`] || fallbackTitle,
      subtitle: row[`${upper}_SUBTITLE`] || '',
      imageUrl: pickFirstField(row, [
        `${upper}_MAP_URL`,
        `${upper}_MAP_IMAGE_URL`,
        `${upper}_IMAGE_URL`,
        `${upper}_IMAGE`,
        `${upper}_PHOTO_URL`,
        `${upper}_PHOTO`,
        `${upper}_URL`
      ]),
      footerLeft:
        row[`${upper}_FOOTER_LEFT`] ||
        row[`${upper}_FOOTER`] ||
        'ONWARDCRE | ONWARDRET.COM',
      footerRight:
        row[`${upper}_FOOTER_RIGHT`] ||
        row[`${upper}_FOOTER_NOTE`] ||
        '',
      badge: row[`${upper}_BADGE`] || ''
    };
  };

  const mapVariants = {
    BOUNDARY: makeMapVariant('BOUNDARY', 'Property Boundary'),
    RETAILER: makeMapVariant('RETAILER', 'Retailer Map'),
    ZONING: makeMapVariant('ZONING', 'Zoning Map'),
    FEMA: makeMapVariant('FEMA', 'FEMA Flood Zone')
  };
  const mapImageEntry = findPhotoByKeywords(['map', 'site', 'boundary', 'retailer']);
  const zoningImageEntry = findPhotoByKeywords(['zoning']);
  const femaImageEntry = findPhotoByKeywords(['fema', 'flood']);

  const floorPlanDetails = [
    { label: 'Building SF', value: row.BUILDING_SF || row.SQFT },
    { label: 'Lot Size', value: row.LOT_SIZE || row.LAND_SIZE },
    { label: 'Year Built', value: row.YEAR_BUILT },
    { label: 'Parcel', value: row.PARCEL_ID || row.APN },
    { label: 'Zoning', value: row.ZONING }
  ].filter(item => item.value);
  const floorPlanImageEntry = findPhotoByKeywords(['floor']);
  const floorPlanImageUrl =
    row.FLOOR_PLAN_URL || row.FLOORPLAN_URL || floorPlanImageEntry?.url || '';

  const incomeTierSeries = collectIncomeTierSeries(row);
  const manualIncomeStats = parseKeyFacts(
    row.INCOME_LIST || row.INCOME_STATS || row.INCOME_TEXT || ''
  );
  const incomeStatList = manualIncomeStats.length
    ? manualIncomeStats
    : buildIncomeList(incomeTierSeries);
  const autoChartUrl = incomeTierSeries.length
    ? createIncomePopulationChart(incomeTierSeries)
    : '';
  const demographicChartUrl = row.DEMO_CHART_URL || autoChartUrl;
  const demographicChartTitle = row.DEMO_CHART_TITLE || 'Household Income Capacity';
  const mapCoordinates = getMapCoordinates(row);
  if (!mapCoordinates) {
    console.warn('Map coordinates missing for', row.ADDRESS_LINE_1, row.MAP_LATITUDE, row.MAP_LONGITUDE);
  }
  const mapLatitude = mapCoordinates?.lat ?? '';
  const mapLongitude = mapCoordinates?.lng ?? '';
  const mapZoom = mapCoordinates?.zoom ?? '';
  const autoMapUrl = mapCoordinates ? await buildStaticMapImageData(mapCoordinates) : '';
  const nearbyRetailers = mapCoordinates ? await fetchNearbyRetailers(mapCoordinates) : [];
  const retailerMapUrl = mapCoordinates
    ? await buildRetailerMapImageData(mapCoordinates, nearbyRetailers)
    : '';
  const demographicMapUrl =
    row.MAP_IMAGE_URL ||
    row.MAP_URL ||
    row.DEMO_MAP_IMAGE_URL ||
    row.DEMO_MAP_URL ||
    autoMapUrl ||
    mapImageEntry?.url ||
    heroImage ||
    '';
  const defaultMapImage = demographicMapUrl || heroImage;
  const boundaryImageUrl = heroPhotoEntry?.url || heroImage;
  Object.entries(mapVariants).forEach(([key, variant]) => {
    if (variant.imageUrl) return;
    if (key === 'BOUNDARY') {
      variant.imageUrl = boundaryImageUrl || defaultMapImage;
      return;
    }
    if (key === 'RETAILER') {
      variant.imageUrl = retailerPhotoEntry?.url || retailerMapUrl || defaultMapImage;
      return;
    }
    if (key === 'ZONING') {
      variant.imageUrl = zoningImageEntry?.url || defaultMapImage;
      return;
    }
    if (key === 'FEMA') {
      variant.imageUrl = femaImageEntry?.url || defaultMapImage;
      return;
    }
    variant.imageUrl = defaultMapImage;
  });
  const demographicMapLabel =
    row.MAP_LABEL || row.DEMO_MAP_LABEL || location || row.CITY || row.STATE || '';

  return {
    PHOTO_URL: heroFileUrl,
    QR_CODE_URL: qrCodeUrl,
    SQFT: row.SQFT || '',
    STATUS: row.STATUS || '',
    ADDRESS_LINE_1: addressLine1,
    ADDRESS_LINE_2: addressLine2,
    LOCATION: location,
    PROPERTY_TITLE: propertyTitle,
    OVERVIEW_PHOTO_URL: overviewPhotoUrl,
    ZONING: row.ZONING || '',
    LEASE_RATE: row.LEASE_RATE || row.LEASE || '',
    NN_ESTIMATE: row.NN_ESTIMATE || '',
    SALES_PRICE: row.SALES_PRICE || row.PRICE || '',
    PROPERTY_HIGHLIGHTS_LIST: highlights,
    KEY_FACTS_LIST: keyFactsList,
    LOGO_PATH: logoDataUrl,
    FOOTER_BG_PATH: footerBgDataUrl,
    BRIDGE_BG_PATH: bridgeBgDataUrl,
    BROCHURE_INFO_BG_PATH: brochureInfoBgDataUrl,
    HERO_PHOTO_URL: heroImage,
    CAROUSEL_PHOTOS: carouselSlides,
    CAROUSEL_COUNT: carouselCount,
    HAS_CAROUSEL: hasCarousel,
    CAROUSEL_DURATION: carouselDurationSeconds,
    CAROUSEL_START_DELAY: carouselStartDelaySeconds,
    CAROUSEL_VIDEO_DURATION: carouselVideoDurationSeconds,
    CAROUSEL_TRACK_KEYFRAMES: trackKeyframes,
    CAROUSEL_AUTO_PLAY: true,
    PHOTO_PAGES: photoPages,
    PROPERTY_MAP_VARIANTS: mapVariants,
    INFO_PAGE_IMAGE_URL: row.INFO_PAGE_IMAGE_URL || row.INFO_IMAGE_URL || '',
    FLOOR_PLAN_IMAGE_URL: floorPlanImageUrl,
    FLOOR_PLAN_DETAILS: floorPlanDetails,
    FLOOR_PLAN_NOTES: row.FLOOR_PLAN_NOTES || row.FLOORPLAN_NOTES || '',
    DEMO_CHART_URL: demographicChartUrl,
    DEMO_CHART_TITLE: demographicChartTitle,
    EDUCATION_LIST: educationStats,
    EMPLOYMENT_LIST: employmentStats,
    INCOME_LIST: incomeStatList,
    MAP_IMAGE_URL: demographicMapUrl,
    MAP_LABEL: demographicMapLabel,
    MAP_LATITUDE: mapLatitude,
    MAP_LONGITUDE: mapLongitude,
    MAP_ZOOM: mapZoom
  };
}

export { buildCarouselMeta };
export function renderHtml(context, templateFile = TEMPLATE_FILE) {
  const template = getTemplate(templateFile);
  return template(context);
}
