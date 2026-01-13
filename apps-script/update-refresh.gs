/** CONFIG **/
const MASTER_SHEET_ID = '1wWMxfkwZ7P70UPSQTdgQ-gAlPKdGppJtHeUbPZgVrvQ';
const CONTACT_TAB_NAME = 'Contact Leads';
const CONTACT_HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Saved Homes Count',
  'Saved Home Addresses',
  'Saved Home IDs',
  'Message Count',
  'Message Subjects',
  'Interests',
  'Notes',
  'Source',
];

/** WEB APP ENTRY POINTS **/
function doGet() {
  return withCors(
    ContentService.createTextOutput(JSON.stringify(exportData())).setMimeType(
      ContentService.MimeType.JSON,
    ),
  );
}

function doPost(e) {
  const action = (e?.parameter?.action || '').toLowerCase();
  if (action === 'refresh') {
    saveJsonToDrive();
    return withCors(jsonOutput({ ok: true, mode: 'refresh' }));
  }
  const payload = parseJson(e?.postData?.contents);
  appendContactRow(payload);
  return withCors(jsonOutput({ ok: true, mode: 'contact' }));
}

function doOptions() {
  return withCors(jsonOutput({ ok: true }));
}

/** CONTACT SIGN-IN **/
function appendContactRow(body = {}) {
  const sheet = SpreadsheetApp.openById(MASTER_SHEET_ID).getSheetByName(CONTACT_TAB_NAME);
  if (!sheet) throw new Error(`Sheet "${CONTACT_TAB_NAME}" not found.`);
  ensureContactHeaders(sheet);
  sheet.appendRow([
    new Date(),
    body.name || '',
    body.email || '',
    body.phone || '',
    body.saved_home_count || 0,
    body.saved_home_addresses || '',
    body.saved_home_ids || '',
    body.message_count || 0,
    body.message_subjects || '',
    body.interests || '',
    body.notes || '',
    body.source || 'Sign-In.html',
  ]);
}

function ensureContactHeaders(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, CONTACT_HEADERS.length);
  const existing = headerRange.getValues()[0] || [];
  const needsUpdate = CONTACT_HEADERS.some(
    (header, idx) => (existing[idx] || '').toString().trim() !== header,
  );
  if (needsUpdate) {
    headerRange.setValues([CONTACT_HEADERS]);
  }
}

/** EXPORT **/
function exportData() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  return [
    {
      agents: readSheet(ss, 'Agents'),
      properties: readSheet(ss, 'Properties'),
    },
  ];
}

function handleRefreshPost() {
  saveJsonToDrive();
  return jsonOutput({ ok: true });
}

function readSheet(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values
    .filter((row) => row.some((cell) => cell !== '' && cell !== null))
    .map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        let val = row[i];
        if (
          ['languages', 'specialties', 'interiorFeatures', 'exteriorFeatures', 'energyFeatures', 'images'].includes(
            header,
          ) &&
          typeof val === 'string'
        ) {
          val = val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        obj[header] = val === '' ? null : val;
      });
      return obj;
    });
}

function saveJsonToDrive() {
  const json = JSON.stringify(exportData(), null, 2);
  DriveApp.createFile('properties-1.json', json, MimeType.PLAIN_TEXT);
}

/** HELPERS **/
function parseJson(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Invalid JSON payload', err);
    return {};
  }
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function withCors(textOutput) {
  const output = textOutput || ContentService.createTextOutput('');
  if (typeof output.setMimeType === 'function') {
    output.setMimeType(ContentService.MimeType.JSON);
  }
  if (typeof output.setHeader === 'function') {
    output
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  return output;
}
