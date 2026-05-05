#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_ZONING_MAPSERVER =
  process.env.ZONING_MAPSERVER_URL ||
  'https://arcgis.waco-texas.com/arcgis/rest/services/Hosted/Zoning/MapServer';
const FEMA_MAPSERVER =
  process.env.FEMA_MAPSERVER_URL || 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer';

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function degToBbox(lat, lng, delta = 0.01) {
  return {
    xmin: lng - delta,
    ymin: lat - delta,
    xmax: lng + delta,
    ymax: lat + delta
  };
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  await fs.promises.writeFile(destPath, Buffer.from(buffer));
}

function buildArcGisExportUrl(baseUrl, { bbox, width = 1600, height = 1200, layers = 'show:', format = 'png32' }) {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/export`);
  const params = new URLSearchParams({
    bbox: `${bbox.xmin},${bbox.ymin},${bbox.xmax},${bbox.ymax}`,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${width},${height}`,
    format,
    transparent: 'true',
    f: 'image'
  });
  if (layers) {
    params.set('layers', layers);
  }
  url.search = params.toString();
  return url.toString();
}

async function fetchZoningImage(lat, lng, outputDir, slug) {
  if (!DEFAULT_ZONING_MAPSERVER) return null;
  const bbox = degToBbox(lat, lng, 0.02);
  const url = buildArcGisExportUrl(DEFAULT_ZONING_MAPSERVER, { bbox, layers: 'show:' });
  const dest = path.resolve(outputDir, `${slug}-zoning-map.png`);
  await downloadImage(url, dest);
  return dest;
}

async function fetchFemaImage(lat, lng, outputDir, slug) {
  const bbox = degToBbox(lat, lng, 0.02);
  const url = buildArcGisExportUrl(`${FEMA_MAPSERVER.replace(/\/$/, '')}`, {
    bbox,
    layers: 'show:28'
  });
  const dest = path.resolve(outputDir, `${slug}-fema-map.png`);
  await downloadImage(url, dest);
  return dest;
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const lat = argv.lat !== undefined ? Number(argv.lat) : undefined;
  const lng = argv.lng !== undefined ? Number(argv.lng) : undefined;
  const slug = argv.slug || 'property';
  const outDir = path.resolve(argv.output || path.join(__dirname, '..', 'output', slug));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('Usage: node scripts/fetch-map-overlays.js --lat=## --lng=## [--slug=identifier] [--output=dir]');
    process.exit(1);
  }

  ensureDirSync(outDir);

  try {
    const zoningPath = await fetchZoningImage(lat, lng, outDir, slug);
    console.log('Saved zoning map:', zoningPath);
  } catch (err) {
    console.warn('Failed to fetch zoning map:', err.message);
  }

  try {
    const femaPath = await fetchFemaImage(lat, lng, outDir, slug);
    console.log('Saved FEMA map:', femaPath);
  } catch (err) {
    console.warn('Failed to fetch FEMA map:', err.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
