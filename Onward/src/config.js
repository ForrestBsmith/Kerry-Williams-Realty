import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------
// GOOGLE AUTH
// ----------------------------------------
export const GOOGLE_CONFIG = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

// Optional credentials JSON path (alternative auth mechanism)
export const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// ----------------------------------------
// GOOGLE SHEETS
// ----------------------------------------
// Support both the original env names and the newer ones.
export const SHEET_ID =
  process.env.SHEET_ID || process.env.SHEETS_SPREADSHEET_ID || '';

export const SHEET_RANGE =
  process.env.SHEET_RANGE || process.env.SHEETS_RANGE || 'Sheet1!A2:F';

// Optional: filter by STATUS values (comma-separated)
export const STATUS_FILTER = (process.env.STATUS_FILTER || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export const PRODUCTION_LOG_SHEET_NAME =
  process.env.PRODUCTION_LOG_SHEET_NAME || 'Production_Log';
export const LISTING_EVENTS_SHEET_NAME =
  process.env.LISTING_EVENTS_SHEET_NAME || 'Listing_Events';
export const WORKFLOW_AUDIT_SHEET_NAME =
  process.env.WORKFLOW_AUDIT_SHEET_NAME || 'Workflow_Audit';

// ----------------------------------------
// GOOGLE DRIVE
// ----------------------------------------
export const DRIVE_ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID || '';
export const DRIVE_OUTPUT_FOLDER_ID = process.env.DRIVE_OUTPUT_FOLDER_ID || '';

// ----------------------------------------
// PATHS: OUTPUT / TMP / ASSETS / TEMPLATES
// ----------------------------------------
const projectRoot = path.resolve(__dirname, '..');

export const OUTPUT_DIR = path.resolve(projectRoot, process.env.OUTPUT_DIR || 'output');
export const TMP_DIR = path.resolve(projectRoot, process.env.TMP_DIR || 'tmp');

const staticAssetsDir =
  process.env.STATIC_ASSETS_DIR || process.env.ASSETS_DIR || 'assets';
export const ASSETS_DIR = path.resolve(projectRoot, staticAssetsDir);
export const LOGO_PATH = path.join(ASSETS_DIR, 'logo.png');
export const FOOTER_BG_PATH = path.join(ASSETS_DIR, 'footer-bg.png');
export const BRIDGE_BG_PATH = path.join(projectRoot, 'bridge.png');
export const BROCHURE_INFO_BG_PATH = path.join(projectRoot, 'brochure_info.jpg');

const templatesDir = process.env.TEMPLATES_DIR || 'Templates';
export const TEMPLATES_DIR = path.resolve(projectRoot, templatesDir);
export const TEMPLATE_FILE = process.env.TEMPLATE_FILE || 'property-hero.html';

// ----------------------------------------
// PUPPETEER / RENDERING
// ----------------------------------------
export const VIEWPORT_WIDTH = Number(process.env.VIEWPORT_WIDTH || 1920);
export const VIEWPORT_HEIGHT = Number(process.env.VIEWPORT_HEIGHT || 1080);
export const CAROUSEL_PHOTO_LIMIT = Number(process.env.CAROUSEL_PHOTO_LIMIT || 8);
export const TIKTOK_MAX_CAROUSEL_PHOTOS = Number(
  process.env.TIKTOK_MAX_CAROUSEL_PHOTOS || 5
);
export const DEFAULT_VIDEO_DURATION = Number(process.env.DEFAULT_VIDEO_DURATION || 8);
export const FFMPEG_PATH = process.env.FFMPEG_PATH || '';
export const BROCHURE_PAGE_WIDTH = Number(process.env.BROCHURE_PAGE_WIDTH || 3300);
export const BROCHURE_PAGE_HEIGHT = Number(process.env.BROCHURE_PAGE_HEIGHT || 2550);

// Default media formats (can be expanded later)
export const FORMATS = [
  {
    key: 'hero',
    label: 'Hero 16:9',
    width: 1920,
    height: 1080,
    suffix: ''
  },
  {
    key: 'square',
    label: 'Square 1:1',
    width: 1080,
    height: 1080,
    suffix: '-square'
  },
  {
    key: 'story',
    label: 'Vertical Story 9:16',
    width: 1080,
    height: 1920,
    suffix: '-story'
  },
  {
    key: 'tiktok',
    label: 'TikTok Carousel Video',
    width: 1080,
    height: 1920,
    suffix: '-tiktok',
    type: 'video',
    templateFile: process.env.TIKTOK_TEMPLATE_FILE || 'social-tiktok-classic.html',
    duration: Number(process.env.TIKTOK_VIDEO_DURATION || 8),
    maxCarouselPhotos: TIKTOK_MAX_CAROUSEL_PHOTOS
  }
];

export const BROCHURE_PAGES = [
  {
    pageNumber: 1,
    key: 'brochure-hero',
    label: 'Cover Hero',
    templateFile: 'property-hero.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p01'
  },
  {
    pageNumber: 2,
    key: 'brochure-overview',
    label: 'Property Overview',
    templateFile: 'property-overview.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p02'
  },
  {
    pageNumber: 3,
    key: 'brochure-demographics',
    label: 'Demographics Summary',
    templateFile: 'property-demographics.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p03'
  },
  {
    pageNumber: 4,
    key: 'brochure-boundary',
    label: 'Property Boundary',
    templateFile: 'property-boundary.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p04',
    mapVariant: 'BOUNDARY'
  },
  {
    pageNumber: 5,
    key: 'brochure-retailer-map',
    label: 'Retailer Map',
    templateFile: 'property-boundary.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p05',
    mapVariant: 'RETAILER'
  },
  {
    pageNumber: 6,
    key: 'brochure-zoning-map',
    label: 'Zoning Map',
    templateFile: 'property-boundary.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p06',
    mapVariant: 'ZONING'
  },
  {
    pageNumber: 7,
    key: 'brochure-fema-map',
    label: 'FEMA Flood Map',
    templateFile: 'property-boundary.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p07',
    mapVariant: 'FEMA'
  },
  {
    pageNumber: 8,
    key: 'brochure-photos-1',
    label: 'Property Photos',
    templateFile: 'property-photos.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p08',
    photoPageIndex: 0
  },
  {
    pageNumber: 9,
    key: 'brochure-photos-2',
    label: 'Property Photos',
    templateFile: 'property-photos.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p09',
    photoPageIndex: 1
  },
  {
    pageNumber: 10,
    key: 'brochure-photos-3',
    label: 'Property Photos',
    templateFile: 'property-photos.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p10',
    photoPageIndex: 2
  },
  {
    pageNumber: 11,
    key: 'brochure-photos-4',
    label: 'Property Photos',
    templateFile: 'property-photos.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p11',
    photoPageIndex: 3
  },
  {
    pageNumber: 12,
    key: 'brochure-floorplan',
    label: 'Floor Plan',
    templateFile: 'property-floorplan.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p12'
  },
  {
    pageNumber: 13,
    key: 'brochure-team',
    label: 'Team',
    templateFile: 'property-team.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p13'
  },
  {
    pageNumber: 14,
    key: 'brochure-info',
    label: 'Info Page',
    templateFile: 'property-info.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p14'
  },
  {
    pageNumber: 15,
    key: 'brochure-backcover',
    label: 'Back Cover',
    templateFile: 'property-backcover.html',
    width: BROCHURE_PAGE_WIDTH,
    height: BROCHURE_PAGE_HEIGHT,
    suffix: '-brochure-p15'
  }
];

// Ensure directories exist
[OUTPUT_DIR, TMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
