import { google } from 'googleapis';
import {
  GOOGLE_CONFIG,
  SHEET_ID,
  SHEET_RANGE,
  STATUS_FILTER,
  PRODUCTION_LOG_SHEET_NAME,
  LISTING_EVENTS_SHEET_NAME,
  WORKFLOW_AUDIT_SHEET_NAME
} from './config.js';

async function getAuth() {
  const jwt = new google.auth.JWT(
    GOOGLE_CONFIG.clientEmail,
    null,
    GOOGLE_CONFIG.privateKey,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  );

  await jwt.authorize();
  return jwt;
}

export async function getSheetsClient() {
  const auth = await getAuth();
  return google.sheets({ version: 'v4', auth });
}

export async function getDriveClient() {
  const auth = await getAuth();
  return google.drive({ version: 'v3', auth });
}

function normalizeHeader(header = '') {
  return header
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeKey(value = '') {
  return String(value || '').trim().toUpperCase();
}

function mapRowsWithHeaders(rows = []) {
  if (!rows.length) return [];
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const key = normalizeHeader(h || '');
      if (!key) return;
      obj[key] = row[i] || '';
    });
    return obj;
  });
}

async function getSheetRowsByRange(sheets, range) {
  if (!range) return [];
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range
  });
  return mapRowsWithHeaders(res.data.values || []);
}

function indexBy(rows, keyName) {
  const map = new Map();
  for (const row of rows) {
    const key = normalizeKey(row[keyName]);
    if (!key) continue;
    map.set(key, row);
  }
  return map;
}

function mergeListingWithLinkedData(listingRow, linkedMaps) {
  const assetSetId = normalizeKey(listingRow.ASSET_SET_ID);
  const agentId = normalizeKey(listingRow.AGENT_ID);
  const buyerGuideId = normalizeKey(listingRow.BUYER_GUIDE_ID);

  const assetSet = assetSetId ? linkedMaps.assetSetsById.get(assetSetId) : null;
  const agent = agentId ? linkedMaps.agentsById.get(agentId) : null;
  const buyerGuide = buyerGuideId
    ? linkedMaps.buyerGuidesById.get(buyerGuideId)
    : null;

  return {
    ...listingRow,
    ...(assetSet || {}),
    ...(agent || {}),
    ...(buyerGuide || {}),
    LINKED_ASSET_SET_ID: assetSetId || '',
    LINKED_AGENT_ID: agentId || '',
    LINKED_BUYER_GUIDE_ID: buyerGuideId || ''
  };
}

function applyStatusFilter(rows) {
  if (!STATUS_FILTER.length) return rows;
  return rows.filter(row => STATUS_FILTER.includes(row.STATUS));
}

export async function getPropertyRows() {
  const sheets = await getSheetsClient();
  const baseRows = await getSheetRowsByRange(sheets, SHEET_RANGE);

  const listingsRange =
    process.env.LISTINGS_SHEET_RANGE || process.env.SHEETS_LISTINGS_RANGE || '';
  const assetSetsRange =
    process.env.ASSET_SETS_SHEET_RANGE || process.env.SHEETS_ASSET_SETS_RANGE || '';
  const agentsRange =
    process.env.AGENTS_SHEET_RANGE || process.env.SHEETS_AGENTS_RANGE || '';
  const buyerGuidesRange =
    process.env.BUYER_GUIDES_SHEET_RANGE ||
    process.env.SHEETS_BUYER_GUIDES_RANGE ||
    '';

  const hasLinkedRanges =
    Boolean(listingsRange) ||
    Boolean(assetSetsRange) ||
    Boolean(agentsRange) ||
    Boolean(buyerGuidesRange);

  // Backward-compatible mode: existing single-range behavior.
  if (!hasLinkedRanges) {
    return applyStatusFilter(baseRows);
  }

  const listingRows = listingsRange
    ? await getSheetRowsByRange(sheets, listingsRange)
    : baseRows;
  const assetSetRows = assetSetsRange
    ? await getSheetRowsByRange(sheets, assetSetsRange)
    : [];
  const agentRows = agentsRange ? await getSheetRowsByRange(sheets, agentsRange) : [];
  const buyerGuideRows = buyerGuidesRange
    ? await getSheetRowsByRange(sheets, buyerGuidesRange)
    : [];

  const linkedMaps = {
    assetSetsById: indexBy(assetSetRows, 'ASSET_SET_ID'),
    agentsById: indexBy(agentRows, 'AGENT_ID'),
    buyerGuidesById: indexBy(buyerGuideRows, 'BUYER_GUIDE_ID')
  };

  const mergedRows = listingRows.map(row =>
    mergeListingWithLinkedData(row, linkedMaps)
  );

  return applyStatusFilter(mergedRows);
}

export async function appendProductionLogEntries(entries = []) {
  const rows = Array.isArray(entries) ? entries : [];
  if (!rows.length) return;

  await appendRowsToSheet(PRODUCTION_LOG_SHEET_NAME, rows.map(entry => [
    entry.timestamp || new Date().toISOString(),
    entry.runId || '',
    entry.listingId || '',
    entry.address || '',
    entry.status || '',
    entry.outputType || '',
    entry.outputKey || '',
    entry.filePath || '',
    entry.message || ''
  ]));
}

async function appendRowsToSheet(sheetName, values) {
  if (!sheetName || !Array.isArray(values) || !values.length) return;
  const sheets = await getSheetsClient();
  const escapedSheetName = String(sheetName).replace(/'/g, "''");
  const range = `'${escapedSheetName}'!A1`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

export async function appendListingEventEntries(entries = []) {
  const rows = Array.isArray(entries) ? entries : [];
  if (!rows.length) return;

  await appendRowsToSheet(LISTING_EVENTS_SHEET_NAME, rows.map(entry => [
    entry.timestamp || new Date().toISOString(),
    entry.runId || '',
    entry.listingId || '',
    entry.address || '',
    entry.eventType || '',
    entry.status || '',
    entry.actor || 'renderer',
    entry.details || ''
  ]));
}

export async function appendWorkflowAuditEntries(entries = []) {
  const rows = Array.isArray(entries) ? entries : [];
  if (!rows.length) return;

  await appendRowsToSheet(WORKFLOW_AUDIT_SHEET_NAME, rows.map(entry => [
    entry.timestamp || new Date().toISOString(),
    entry.runId || '',
    entry.workflow || 'render',
    entry.step || '',
    entry.status || '',
    entry.entityType || 'listing',
    entry.entityId || '',
    entry.message || '',
    entry.metadata || ''
  ]));
}
