/** CONFIG **/
const MASTER_SHEET_ID = '1wWMxfkwZ7P70UPSQTdgQ-gAlPKdGppJtHeUbPZgVrvQ';
const CONTACT_TAB_NAME = 'Contact Leads';
const PHOTO_GEN_TAB_NAME = 'Photo Gen';
const PHOTO_GEN_TEMPLATE_LIBRARY_TAB_NAME = 'Photo Gen Templates';
// Optional: set this to your Drive root folder ID that contains `realtors/` and `properties/`.
const PHOTO_LIBRARY_ROOT_FOLDER_ID = '1-dJywy60D7PbN0sIz8g4KsVyvCw2JQGT';
// Drive-first mode: set true only if you intentionally want manual Photo Gen rows merged in.
const ENABLE_PHOTO_GEN_TAB = false;
const EXPORT_JSON_FILENAME = 'properties-1.json';
const EXPORT_CACHE_KEY = 'export-data-v1';
const EXPORT_CACHE_TTL_SECONDS = 300;
const AUTO_REFRESH_FUNCTION_NAME = 'runScheduledRefresh';
const SERVE_PREBUILT_JSON_ON_GET = true;
const EMAIL_TEMPLATES_TAB_NAME = 'Email Templates';
const EMAIL_LOG_TAB_NAME = 'Email Campaign Log';
const MONTHLY_CAMPAIGN_FUNCTION_NAME = 'runMonthlyLeadCampaigns';
const CAMPAIGN_KEYS = ['buying', 'selling', 'investment', 'relocation', 'renting'];
const EMAIL_PROVIDER = 'brevo';
const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send';
const EMAILJS_PROP_SERVICE_ID = 'EMAILJS_SERVICE_ID';
const EMAILJS_PROP_TEMPLATE_ID = 'EMAILJS_TEMPLATE_ID';
const EMAILJS_PROP_PUBLIC_KEY = 'EMAILJS_PUBLIC_KEY';
const EMAILJS_PROP_PRIVATE_KEY = 'EMAILJS_PRIVATE_KEY';
const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_PROP_API_KEY = 'BREVO_API_KEY';
const BREVO_PROP_TEMPLATE_ID = 'BREVO_TEMPLATE_ID';
const BREVO_PROP_SENDER_EMAIL = 'BREVO_SENDER_EMAIL';
const BREVO_PROP_SENDER_NAME = 'BREVO_SENDER_NAME';
const BREVO_USE_TEMPLATE_MODE = false;
const BRAND_NAME = 'Kerry Williams Realty';
const BRAND_PRIMARY = '#d6a000';
const BRAND_DARK = '#0c0c0f';
// Optional hard mappings when a specific folder must be tied to an agent/property.
const EXPLICIT_AGENT_FOLDERS = [
  { key: 'Jake-Browning', targetId: 'Jake-Browning', folderId: '1whzdvsWPd4hE3BgejiBCbOF40azMCSFG' },
];
const EXPLICIT_PROPERTY_FOLDERS = [];
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
const EMAIL_TEMPLATE_HEADERS = ['campaignKey', 'subject', 'htmlBody', 'textBody', 'active', 'updatedAt'];
const EMAIL_LOG_HEADERS = [
  'timestamp',
  'monthKey',
  'campaignKey',
  'email',
  'name',
  'status',
  'messageId',
  'error',
];
const PHOTO_GEN_HEADERS = [
  'targetType',
  'targetId',
  'slot',
  'templateSelector',
  'sortOrder',
  'driveFileId',
  'active',
  'alt',
  'assetKind',
  'statusFocus',
  'typeFocus',
  'overlayPreset',
  'outputFormat',
  'durationSec',
];
const PHOTO_GEN_TEMPLATE_LIBRARY_HEADERS = [
  'templateSelector',
  'targetType',
  'displayName',
  'description',
  'recommendedSlots',
  'active',
];
const PHOTO_GEN_TEMPLATE_LIBRARY = [
  ['for-sale', 'property', 'For Sale', 'Marketing assets for active for-sale listings.', 'hero,cover,gallery,detail,social', 'TRUE'],
  ['for-sale-email', 'property', 'For Sale Email', 'Email-first monthly list layout for for-sale inventory.', 'hero,cover,gallery,detail,social', 'TRUE'],
  ['for-sale-card', 'property', 'For Sale Card Variant', 'Single listing property card without monthly list wrapper.', 'hero,cover,gallery,detail,social', 'TRUE'],
  ['under-contract', 'property', 'Under Contract', 'Pending and under-contract listings for in-progress transactions.', 'hero,cover,gallery,detail,social', 'TRUE'],
  ['under-contract-email', 'property', 'Under Contract Email', 'Email-first list layout for pending listings.', 'hero,cover,gallery,detail,social', 'TRUE'],
  ['under-contract-card', 'property', 'Under Contract Card Variant', 'Single listing under-contract property card variant.', 'hero,cover,gallery,detail,social', 'TRUE'],
  ['sold', 'property', 'Sold', 'Sold announcement assets for closed listings and social proof.', 'hero,cover,gallery,social', 'TRUE'],
  ['sold-email', 'property', 'Sold Email', 'Email-first list layout for sold highlights.', 'hero,cover,gallery,social', 'TRUE'],
  ['sold-card', 'property', 'Sold Card Variant', 'Single listing sold property card variant.', 'hero,cover,gallery,social', 'TRUE'],
  ['lease', 'property', 'Lease', 'Leasing assets for rentals and lease-ready inventory.', 'cover,gallery,detail,social', 'TRUE'],
  ['lease-email', 'property', 'Lease Email', 'Email-first list layout for lease inventory.', 'cover,gallery,detail,social', 'TRUE'],
  ['lease-card', 'property', 'Lease Card Variant', 'Single listing lease property card variant.', 'cover,gallery,detail,social', 'TRUE'],
  ['agent-card', 'agent', 'Agent Card Base', 'Base template for all agent profile media.', 'primary,cover,hero,social', 'TRUE'],
  ['bio-card', 'agent', 'Agent Bio Card Variant', 'Single profile agent bio card variant.', 'primary,cover,hero,social', 'TRUE'],
  ['commercial', 'property', 'Commercial Listing', 'Retail, office, and mixed-use properties.', 'hero,cover,gallery,detail', 'TRUE'],
  ['new-construction', 'property', 'New Construction', 'Builder inventory and staged progress imagery.', 'hero,cover,gallery,detail', 'TRUE'],
  ['open-house', 'property', 'Open House', 'Weekend event imagery and walkthrough assets.', 'cover,gallery,detail,social', 'TRUE'],
  ['social', 'property', 'Social Property', 'Cropped/optimized assets for social channels.', 'hero,cover,social', 'TRUE'],
  ['headshot', 'agent', 'Agent Headshot', 'Professional portrait for profile cards.', 'primary,cover', 'TRUE'],
  ['agent-brand', 'agent', 'Agent Brand', 'Personal brand and team marketing assets.', 'hero,cover,gallery,social', 'TRUE'],
  ['agent-social', 'agent', 'Agent Social', 'Social-first branded assets for agent content.', 'cover,social,detail', 'TRUE'],
];
const DROPDOWN_CONFIG = {
  Agents: {
    exp: ['1 Year', '2 Years', '3 Years', '5 Years', '7 Years', '10 Years', '12 Years', '15+ Years'],
    languages: ['English', 'Spanish', 'English, Spanish', 'English, French', 'English, Arabic'],
    specialties: ['Residential', 'Commercial', 'Luxury', 'First-Time Buyers', 'Investment', 'Relocation'],
  },
  Properties: {
    status: ['For Sale', 'Pending', 'Sold', 'Off Market'],
    type: ['House', 'Single Family', 'Condo', 'Apartment', 'Commercial', 'Rental', 'Land'],
    city: ['Waco', 'Austin', 'Dallas', 'Houston'],
    garage: ['None', '1 Car', '2 Car', '3 Car', 'Attached', 'Detached'],
    schoolDistrict: ['Waco ISD', 'Midway ISD', 'Temple ISD', 'Belton ISD', 'Axtell ISD', 'China Spring ISD'],
    heating: ['Central', 'Electric', 'Gas', 'Heat Pump', 'None'],
    cooling: ['Central Air', 'Electric', 'Window Unit', 'None'],
    flooring: ['Tile', 'Hardwood', 'Laminate', 'Vinyl', 'Carpet', 'Mixed'],
    roof: ['Shingle', 'Metal', 'Tile', 'Flat', 'Other'],
    exterior: ['Brick', 'Stucco', 'Wood', 'Stone', 'Siding', 'Mixed'],
    bedrooms: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    bathrooms: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6'],
  },
  'Photo Gen': {
    targetType: ['agent', 'property'],
    slot: ['primary', 'cover', 'hero', 'gallery', 'detail', 'photo'],
    templateSelector: [
      'for-sale',
      'for-sale-email',
      'for-sale-card',
      'under-contract',
      'under-contract-email',
      'under-contract-card',
      'sold',
      'sold-email',
      'sold-card',
      'lease',
      'lease-email',
      'lease-card',
      'agent-card',
      'bio-card',
      'commercial',
      'new-construction',
      'open-house',
      'social',
      'headshot',
      'agent-brand',
      'agent-social',
    ],
    assetKind: ['image', 'carousel', 'video'],
    statusFocus: ['for-sale', 'lease', 'under-contract', 'sold', 'open-house', 'all'],
    typeFocus: ['house', 'single-family', 'condo', 'apartment', 'commercial', 'rental', 'land', 'all'],
    overlayPreset: ['standard', 'minimal', 'bold-social', 'agent-brand', 'agent-social'],
    outputFormat: ['html', 'jpg', 'png', 'mp4'],
    active: ['TRUE', 'FALSE'],
  },
};

/** WEB APP ENTRY POINTS **/
function doGet(e) {
  return doGetWithRequest(e);
}

function doGetWithRequest(e) {
  const action = (e?.parameter?.action || '').toLowerCase();
  if (action === 'set-emailjs-config') {
    const serviceId = String(e?.parameter?.serviceId || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const publicKey = String(e?.parameter?.publicKey || '').trim();
    const privateKey = String(e?.parameter?.privateKey || '').trim();
    const result = setEmailJsConfig(serviceId, templateId, publicKey, privateKey);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-emailjs-config', ...result }));
  }
  if (action === 'emailjs-config-status') {
    const status = validateEmailProviderConfig();
    return withCors(jsonOutput({ ok: true, mode: 'emailjs-config-status', ...status }));
  }
  if (action === 'set-emailjs-campaign-template') {
    const campaignKey = String(e?.parameter?.campaign || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const result = setEmailJsCampaignTemplateId(campaignKey, templateId);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-emailjs-campaign-template', ...result }));
  }
  if (action === 'set-brevo-config') {
    const apiKey = String(e?.parameter?.apiKey || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const senderEmail = String(e?.parameter?.senderEmail || '').trim();
    const senderName = String(e?.parameter?.senderName || '').trim();
    const result = setBrevoConfig(apiKey, templateId, senderEmail, senderName);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-brevo-config', ...result }));
  }
  if (action === 'brevo-config-status') {
    const status = validateEmailProviderConfig();
    return withCors(jsonOutput({ ok: true, mode: 'brevo-config-status', ...status }));
  }
  if (action === 'set-brevo-campaign-template') {
    const campaignKey = String(e?.parameter?.campaign || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const result = setBrevoCampaignTemplateId(campaignKey, templateId);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-brevo-campaign-template', ...result }));
  }
  if (action === 'send-test-campaign-email') {
    const email = String(e?.parameter?.email || '').trim();
    const campaignKey = String(e?.parameter?.campaign || 'buying').trim();
    const result = sendCampaignTestEmail(email, campaignKey);
    return withCors(jsonOutput({ ok: true, mode: 'send-test-campaign-email', ...result }));
  }
  if (action === 'render-photo-gen-from-sheets') {
    const selector = String(e?.parameter?.selector || 'for-sale').trim();
    const targetType = String(e?.parameter?.targetType || '').trim();
    const limit = Math.max(1, Math.min(20, toNumber(e?.parameter?.limit) || 5));
    const clientName = String(e?.parameter?.clientName || e?.parameter?.firstName || e?.parameter?.name || '').trim();
    const statusFocus = String(e?.parameter?.statusFocus || '').trim();
    const typeFocus = String(e?.parameter?.typeFocus || '').trim();
    const agentId = String(e?.parameter?.agentId || '').trim();
    const rendered = renderPhotoGenTemplateFromSheets({
      selector, targetType, limit, clientName, statusFocus, typeFocus, agentId,
    });
    return htmlOutput(rendered?.html || '');
  }
  if (action === 'build-social-carousel-plan') {
    const targetId = String(e?.parameter?.targetId || '').trim();
    const selector = String(e?.parameter?.selector || 'social').trim();
    const limit = Math.max(1, Math.min(24, toNumber(e?.parameter?.limit) || 6));
    const durationSec = Math.max(1, Math.min(20, toNumber(e?.parameter?.durationSec) || 3));
    const fps = Math.max(12, Math.min(60, toNumber(e?.parameter?.fps) || 30));
    const transition = String(e?.parameter?.transition || 'fade').trim();
    const outputFormat = String(e?.parameter?.outputFormat || 'mp4').trim();
    const statusFocus = String(e?.parameter?.statusFocus || '').trim();
    const typeFocus = String(e?.parameter?.typeFocus || '').trim();
    const plan = buildSocialCarouselRenderPlan({
      targetId, selector, limit, durationSec, fps, transition, outputFormat, statusFocus, typeFocus,
    });
    return withCors(jsonOutput({ ok: Boolean(plan?.ok), mode: 'build-social-carousel-plan', ...plan }));
  }

  const debugRaw = String(e?.parameter?.debug || '').trim().toLowerCase();
  const includeDebug = debugRaw === '1' || debugRaw === 'true' || debugRaw === 'yes';
  const payload = getExportPayload({ forceRefresh: false, includeDebug });
  return withCors(jsonOutput(payload));
}

function doPost(e) {
  const action = (e?.parameter?.action || '').toLowerCase();
  if (action === 'set-emailjs-config') {
    const serviceId = String(e?.parameter?.serviceId || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const publicKey = String(e?.parameter?.publicKey || '').trim();
    const privateKey = String(e?.parameter?.privateKey || '').trim();
    const result = setEmailJsConfig(serviceId, templateId, publicKey, privateKey);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-emailjs-config', ...result }));
  }
  if (action === 'emailjs-config-status') {
    const status = validateEmailProviderConfig();
    return withCors(jsonOutput({ ok: true, mode: 'emailjs-config-status', ...status }));
  }
  if (action === 'set-emailjs-campaign-template') {
    const campaignKey = String(e?.parameter?.campaign || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const result = setEmailJsCampaignTemplateId(campaignKey, templateId);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-emailjs-campaign-template', ...result }));
  }
  if (action === 'set-brevo-config') {
    const apiKey = String(e?.parameter?.apiKey || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const senderEmail = String(e?.parameter?.senderEmail || '').trim();
    const senderName = String(e?.parameter?.senderName || '').trim();
    const result = setBrevoConfig(apiKey, templateId, senderEmail, senderName);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-brevo-config', ...result }));
  }
  if (action === 'brevo-config-status') {
    const status = validateEmailProviderConfig();
    return withCors(jsonOutput({ ok: true, mode: 'brevo-config-status', ...status }));
  }
  if (action === 'set-brevo-campaign-template') {
    const campaignKey = String(e?.parameter?.campaign || '').trim();
    const templateId = String(e?.parameter?.templateId || '').trim();
    const result = setBrevoCampaignTemplateId(campaignKey, templateId);
    return withCors(jsonOutput({ ok: Boolean(result?.ok), mode: 'set-brevo-campaign-template', ...result }));
  }
  if (action === 'refresh') {
    const payload = getExportPayload({ forceRefresh: true, includeDebug: false });
    return withCors(jsonOutput({ ok: true, mode: 'refresh', rows: payload?.[0]?.properties?.length || 0 }));
  }
  if (action === 'setup-dropdowns' || action === 'setup') {
    const result = setupDataEntryDropdowns();
    return withCors(jsonOutput({ ok: true, mode: 'setup-dropdowns', ...result }));
  }
  if (action === 'sync-agent-rollups') {
    const result = syncAgentRollupsToSheet();
    return withCors(jsonOutput({ ok: true, mode: 'sync-agent-rollups', ...result }));
  }
  if (action === 'seed-properties') {
    const count = toNumber(e?.parameter?.count) || 20;
    const result = seedSampleProperties(count);
    return withCors(jsonOutput({ ok: true, mode: 'seed-properties', ...result }));
  }
  if (action === 'setup-email-campaigns') {
    const result = setupEmailCampaignSheets();
    return withCors(jsonOutput({ ok: true, mode: 'setup-email-campaigns', ...result }));
  }
  if (action === 'setup-photo-gen') {
    const result = setupPhotoGenSheet();
    return withCors(jsonOutput({ ok: true, mode: 'setup-photo-gen', ...result }));
  }
  if (action === 'setup-photo-gen-templates') {
    const result = setupPhotoGenTemplateLibrarySheet();
    return withCors(jsonOutput({ ok: true, mode: 'setup-photo-gen-templates', ...result }));
  }
  if (action === 'setup-photo-gen-html-templates') {
    const result = setupPhotoGenHtmlTemplateSheet();
    return withCors(jsonOutput({ ok: true, mode: 'setup-photo-gen-html-templates', ...result }));
  }
  if (action === 'render-photo-gen-template') {
    const selector = String(e?.parameter?.selector || 'for-sale').trim();
    const targetType = String(e?.parameter?.targetType || 'property').trim();
    const data = {
      title: String(e?.parameter?.title || '').trim(),
      clientName: String(e?.parameter?.clientName || e?.parameter?.firstName || e?.parameter?.name || '').trim(),
      subtitle: String(e?.parameter?.subtitle || '').trim(),
      propertyAddress: String(e?.parameter?.propertyAddress || '').trim(),
      city: String(e?.parameter?.city || '').trim(),
      price: String(e?.parameter?.price || '').trim(),
      beds: String(e?.parameter?.beds || e?.parameter?.bedrooms || '').trim(),
      baths: String(e?.parameter?.baths || e?.parameter?.bathrooms || '').trim(),
      sqft: String(e?.parameter?.sqft || e?.parameter?.squareFeet || '').trim(),
      propertyType: String(e?.parameter?.propertyType || e?.parameter?.type || '').trim(),
      yearBuilt: String(e?.parameter?.yearBuilt || '').trim(),
      lotSize: String(e?.parameter?.lotSize || '').trim(),
      status: String(e?.parameter?.status || '').trim(),
      statusLabel: String(e?.parameter?.statusLabel || '').trim(),
      agentName: String(e?.parameter?.agentName || '').trim(),
      ctaUrl: String(e?.parameter?.ctaUrl || '').trim(),
      imageUrl: String(e?.parameter?.imageUrl || '').trim(),
    };
    const rendered = renderPhotoGenHtmlTemplate(selector, data, targetType);
    return withCors(
      jsonOutput({
        ok: true,
        mode: 'render-photo-gen-template',
        selector: rendered.selector,
        targetType: rendered.targetType,
        html: rendered.html,
        text: rendered.text,
      }),
    );
  }
  if (action === 'render-photo-gen-template-list') {
    const selector = String(e?.parameter?.selector || 'for-sale').trim();
    const targetType = String(e?.parameter?.targetType || 'property').trim();
    const rawListings = String(e?.parameter?.listings || '').trim();
    const fallbackListing = {
      title: String(e?.parameter?.title || '').trim(),
      clientName: String(e?.parameter?.clientName || e?.parameter?.firstName || e?.parameter?.name || '').trim(),
      subtitle: String(e?.parameter?.subtitle || '').trim(),
      propertyAddress: String(e?.parameter?.propertyAddress || '').trim(),
      city: String(e?.parameter?.city || '').trim(),
      price: String(e?.parameter?.price || '').trim(),
      beds: String(e?.parameter?.beds || e?.parameter?.bedrooms || '').trim(),
      baths: String(e?.parameter?.baths || e?.parameter?.bathrooms || '').trim(),
      sqft: String(e?.parameter?.sqft || e?.parameter?.squareFeet || '').trim(),
      propertyType: String(e?.parameter?.propertyType || e?.parameter?.type || '').trim(),
      yearBuilt: String(e?.parameter?.yearBuilt || '').trim(),
      lotSize: String(e?.parameter?.lotSize || '').trim(),
      status: String(e?.parameter?.status || '').trim(),
      statusLabel: String(e?.parameter?.statusLabel || '').trim(),
      agentName: String(e?.parameter?.agentName || '').trim(),
      ctaUrl: String(e?.parameter?.ctaUrl || '').trim(),
      imageUrl: String(e?.parameter?.imageUrl || '').trim(),
      logoUrl: String(e?.parameter?.logoUrl || '').trim(),
    };
    const parsed = parseJson(rawListings);
    const list = Array.isArray(parsed) ? parsed : [];
    const safeList = list.length ? list : [fallbackListing];
    const limit = Math.max(1, Math.min(20, Number(e?.parameter?.limit || 5) || 5));
    const rendered = renderPhotoGenHtmlTemplateList(selector, safeList.slice(0, limit), targetType);
    return withCors(
      jsonOutput({
        ok: true,
        mode: 'render-photo-gen-template-list',
        selector: rendered.selector,
        targetType: rendered.targetType,
        count: rendered.count,
        html: rendered.html,
        text: rendered.text,
      }),
    );
  }
  if (action === 'render-photo-gen-from-sheets') {
    const selector = String(e?.parameter?.selector || 'for-sale').trim();
    const targetType = String(e?.parameter?.targetType || '').trim();
    const limit = Math.max(1, Math.min(20, Number(e?.parameter?.limit || 5) || 5));
    const clientName = String(e?.parameter?.clientName || e?.parameter?.firstName || e?.parameter?.name || '').trim();
    const statusFocus = String(e?.parameter?.statusFocus || '').trim();
    const typeFocus = String(e?.parameter?.typeFocus || '').trim();
    const agentId = String(e?.parameter?.agentId || '').trim();
    const rendered = renderPhotoGenTemplateFromSheets({
      selector, targetType, limit, clientName, statusFocus, typeFocus, agentId,
    });
    return withCors(
      jsonOutput({
        ok: true,
        mode: 'render-photo-gen-from-sheets',
        selector: rendered.selector,
        targetType: rendered.targetType,
        count: rendered.count,
        html: rendered.html,
        text: rendered.text,
      }),
    );
  }
  if (action === 'build-social-carousel-plan') {
    const targetId = String(e?.parameter?.targetId || '').trim();
    const selector = String(e?.parameter?.selector || 'social').trim();
    const limit = Math.max(1, Math.min(24, Number(e?.parameter?.limit || 6) || 6));
    const durationSec = Math.max(1, Math.min(20, Number(e?.parameter?.durationSec || 3) || 3));
    const fps = Math.max(12, Math.min(60, Number(e?.parameter?.fps || 30) || 30));
    const transition = String(e?.parameter?.transition || 'fade').trim();
    const outputFormat = String(e?.parameter?.outputFormat || 'mp4').trim();
    const statusFocus = String(e?.parameter?.statusFocus || '').trim();
    const typeFocus = String(e?.parameter?.typeFocus || '').trim();
    const plan = buildSocialCarouselRenderPlan({
      targetId, selector, limit, durationSec, fps, transition, outputFormat, statusFocus, typeFocus,
    });
    return withCors(jsonOutput({ ok: Boolean(plan?.ok), mode: 'build-social-carousel-plan', ...plan }));
  }
  if (action === 'sync-photo-gen') {
    const replaceRaw = String(e?.parameter?.replace || 'true').trim().toLowerCase();
    const replace = !['0', 'false', 'no', 'n', 'off'].includes(replaceRaw);
    const result = syncPhotoGenTabFromDrive({ replace });
    return withCors(jsonOutput({ ok: true, mode: 'sync-photo-gen', ...result }));
  }
  if (action === 'send-monthly-campaigns') {
    const dryRunRaw = String(e?.parameter?.dryRun || '').trim().toLowerCase();
    const dryRun = dryRunRaw === '1' || dryRunRaw === 'true' || dryRunRaw === 'yes';
    const result = sendMonthlyCampaigns({ dryRun });
    return withCors(jsonOutput({ ok: true, mode: 'send-monthly-campaigns', ...result }));
  }
  if (action === 'send-test-campaign-email') {
    const email = String(e?.parameter?.email || '').trim();
    const campaignKey = String(e?.parameter?.campaign || 'buying').trim();
    const result = sendCampaignTestEmail(email, campaignKey);
    return withCors(jsonOutput({ ok: true, mode: 'send-test-campaign-email', ...result }));
  }
  if (action === 'setup-monthly-campaign-trigger') {
    const result = setupMonthlyCampaignTrigger();
    return withCors(jsonOutput({ ok: true, mode: 'setup-monthly-campaign-trigger', ...result }));
  }
  if (action === 'remove-monthly-campaign-trigger') {
    const result = removeMonthlyCampaignTriggers();
    return withCors(jsonOutput({ ok: true, mode: 'remove-monthly-campaign-trigger', ...result }));
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

/** EMAIL CAMPAIGNS **/
function setupEmailCampaignSheets() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const logSheet = getOrCreateSheet(ss, EMAIL_LOG_TAB_NAME);
  ensureSheetHeaders(logSheet, EMAIL_LOG_HEADERS);
  return { templatesSheet: null, logSheet: EMAIL_LOG_TAB_NAME, templatesAdded: 0 };
}

function runMonthlyLeadCampaigns() {
  return sendMonthlyCampaigns({ dryRun: false });
}

function forceMailAuth() {
  return validateEmailProviderConfig();
}

function setupMonthlyCampaignTrigger() {
  removeMonthlyCampaignTriggers();
  ScriptApp.newTrigger(MONTHLY_CAMPAIGN_FUNCTION_NAME)
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();
  return { ok: true, triggerFunction: MONTHLY_CAMPAIGN_FUNCTION_NAME, schedule: 'Monthly on day 1 around 9:00' };
}

function removeMonthlyCampaignTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  triggers.forEach((trigger) => {
    if (trigger.getHandlerFunction && trigger.getHandlerFunction() === MONTHLY_CAMPAIGN_FUNCTION_NAME) {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    }
  });
  return { ok: true, removed };
}

function sendMonthlyCampaigns(options = {}) {
  const dryRun = Boolean(options.dryRun);
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const leadsSheet = ss.getSheetByName(CONTACT_TAB_NAME);
  if (!leadsSheet) return { sent: 0, skipped: 0, errors: 0, warning: `${CONTACT_TAB_NAME} sheet not found` };

  setupEmailCampaignSheets();
  const logSheet = ss.getSheetByName(EMAIL_LOG_TAB_NAME);
  const templates = getCampaignTemplates();
  const leads = getContactLeadsForCampaign(leadsSheet);
  const monthKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  const sentKeys = getSentCampaignKeysForMonth(logSheet, monthKey);
  const campaignDigests = {};
  CAMPAIGN_KEYS.forEach((key) => {
    campaignDigests[key] = buildCampaignListingDigest(key, key === 'buying' ? 3 : 6);
  });
  const skipReasons = {
    alreadySentThisMonth: 0,
    noProviderTemplate: 0,
  };

  let sent = 0;
  let skipped = 0;
  let errors = 0;
  const logs = [];

  leads.forEach((lead) => {
    const email = String(lead.email || '').trim().toLowerCase();
    const name = lead.name || '';
    if (!email) return;

    lead.campaigns.forEach((campaignKey) => {
      const dedupeKey = `${monthKey}|${campaignKey}|${email}`;
      const template = templates[campaignKey] || buildDefaultCampaignTemplate(campaignKey);
      if (!template.active) return;
      if (sentKeys[dedupeKey]) {
        skipped += 1;
        skipReasons.alreadySentThisMonth += 1;
        logs.push([new Date(), monthKey, campaignKey, email, name, 'SKIPPED_ALREADY_SENT', '', '']);
        return;
      }
      const providerTemplateId = getProviderTemplateId(campaignKey);
      if (!providerTemplateId) {
        skipped += 1;
        skipReasons.noProviderTemplate += 1;
        logs.push([new Date(), monthKey, campaignKey, email, name, 'SKIPPED_NO_PROVIDER_TEMPLATE', '', '']);
        return;
      }

      const rendered = renderCampaignTemplate(template, lead, campaignKey, monthKey, campaignDigests[campaignKey]);
      if (dryRun) {
        sent += 1;
        logs.push([new Date(), monthKey, campaignKey, email, name, 'DRY_RUN', '', '']);
        sentKeys[dedupeKey] = true;
        return;
      }

      try {
        sendCampaignEmail({
          toEmail: email,
          toName: name || lead.name || '',
          campaignKey,
          templateId: providerTemplateId,
          subject: rendered.subject,
          htmlBody: rendered.htmlBody,
          textBody: rendered.textBody,
          monthKey,
          templateParams: rendered.templateParams,
        });
        sent += 1;
        sentKeys[dedupeKey] = true;
        logs.push([new Date(), monthKey, campaignKey, email, name, 'SENT', '', '']);
      } catch (err) {
        errors += 1;
        logs.push([new Date(), monthKey, campaignKey, email, name, 'ERROR', '', String(err)]);
      }
    });
  });

  if (logs.length) {
    logSheet.getRange(logSheet.getLastRow() + 1, 1, logs.length, EMAIL_LOG_HEADERS.length).setValues(logs);
  }
  return {
    sent,
    skipped,
    errors,
    dryRun,
    leadsConsidered: leads.length,
    monthKey,
    skipReasons,
  };
}

function diagnoseMonthlyCampaigns() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const leadsSheet = ss.getSheetByName(CONTACT_TAB_NAME);
  setupEmailCampaignSheets();
  const templates = getCampaignTemplates();
  const leads = leadsSheet ? getContactLeadsForCampaign(leadsSheet) : [];
  const monthKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  const logSheet = ss.getSheetByName(EMAIL_LOG_TAB_NAME);
  const sentKeys = logSheet ? getSentCampaignKeysForMonth(logSheet, monthKey) : {};
  const providerConfig = validateEmailProviderConfig();

  const templateStatus = CAMPAIGN_KEYS.map((key) => ({
    campaignKey: key,
    active: Boolean(templates[key] && templates[key].active),
    providerTemplateId: getProviderTemplateId(key),
    hasSubject: Boolean(templates[key] && templates[key].subject),
    hasHtmlBody: Boolean(templates[key] && templates[key].htmlBody),
  }));

  const leadPreview = leads.slice(0, 10).map((lead) => ({
    email: lead.email,
    name: lead.name,
    campaigns: lead.campaigns,
    dedupeKeys: lead.campaigns.map((campaignKey) => `${monthKey}|${campaignKey}|${String(lead.email || '').toLowerCase()}`),
  }));

  return {
    ok: true,
    monthKey,
    leadsConsidered: leads.length,
    sentKeysCount: Object.keys(sentKeys).length,
    emailProvider: EMAIL_PROVIDER,
    providerConfig,
    templateStatus,
    leadPreview,
  };
}

function sendCampaignTestEmail(emailInput, campaignInput) {
  const email = String(emailInput || '').trim().toLowerCase();
  if (!email) return { sent: false, error: 'Missing email. Pass email parameter.' };

  const campaignKey = normalizeCampaignKey(campaignInput || 'buying');
  if (!campaignKey) return { sent: false, error: 'Invalid campaign key. Use buying/selling/investment/relocation/renting.' };

  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  setupEmailCampaignSheets();
  const templates = getCampaignTemplates();
  const template = templates[campaignKey] || buildDefaultCampaignTemplate(campaignKey);
  if (!template.active) return { sent: false, error: `Campaign is disabled: ${campaignKey}` };

  const monthKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  const providerTemplateId = getProviderTemplateId(campaignKey);
  if (!providerTemplateId) {
    return { sent: false, error: `Missing ${EMAIL_PROVIDER} template for campaign: ${campaignKey}` };
  }
  const lead = { email, name: 'Test User' };
  const rendered = renderCampaignTemplate(
    template,
    lead,
    campaignKey,
    monthKey,
    buildCampaignListingDigest(campaignKey, campaignKey === 'buying' ? 3 : 6),
  );
  sendCampaignEmail({
    toEmail: email,
    toName: 'Test User',
    campaignKey,
    templateId: providerTemplateId,
    subject: rendered.subject,
    htmlBody: rendered.htmlBody,
    textBody: rendered.textBody,
    monthKey,
    templateParams: rendered.templateParams,
  });

  const logSheet = ss.getSheetByName(EMAIL_LOG_TAB_NAME);
  if (logSheet) {
    logSheet.appendRow([new Date(), monthKey, campaignKey, email, 'Test User', 'TEST_SENT', '', '']);
  }
  return { sent: true, email, campaignKey, subject: rendered.subject };
}

function sendCampaignEmail(payload) {
  if (EMAIL_PROVIDER === 'brevo') {
    return sendViaBrevo(payload);
  }
  if (EMAIL_PROVIDER === 'emailjs') {
    return sendViaEmailJs(payload);
  }
  throw new Error(`Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
}

function validateEmailProviderConfig() {
  if (EMAIL_PROVIDER === 'brevo') {
    const cfg = getBrevoConfig();
    const missing = [];
    if (!cfg.apiKey) missing.push(BREVO_PROP_API_KEY);
    const campaignTemplates = {};
    if (BREVO_USE_TEMPLATE_MODE) {
      const hasGlobalTemplate = Boolean(cfg.templateId);
      CAMPAIGN_KEYS.forEach((key) => {
        campaignTemplates[key] = getBrevoTemplateId(key);
        if (!campaignTemplates[key] && !hasGlobalTemplate) {
          missing.push(`BREVO_TEMPLATE_ID_${key.toUpperCase()}`);
        }
      });
    } else {
      if (!cfg.senderEmail) missing.push(BREVO_PROP_SENDER_EMAIL);
      CAMPAIGN_KEYS.forEach((key) => {
        campaignTemplates[key] = 'direct-html';
      });
    }
    return {
      ok: missing.length === 0,
      provider: EMAIL_PROVIDER,
      missing,
      brevoTemplateMode: BREVO_USE_TEMPLATE_MODE,
      campaignTemplates,
    };
  }
  if (EMAIL_PROVIDER !== 'emailjs') {
    return { ok: false, error: `Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}` };
  }
  const cfg = getEmailJsConfig();
  const missing = [];
  if (!cfg.serviceId) missing.push(EMAILJS_PROP_SERVICE_ID);
  if (!cfg.publicKey) missing.push(EMAILJS_PROP_PUBLIC_KEY);
  const hasGlobalTemplate = Boolean(cfg.templateId);
  const campaignTemplates = {};
  CAMPAIGN_KEYS.forEach((key) => {
    campaignTemplates[key] = getEmailJsTemplateId(key);
    if (!campaignTemplates[key] && !hasGlobalTemplate) {
      missing.push(`EMAILJS_TEMPLATE_ID_${key.toUpperCase()}`);
    }
  });
  return {
    ok: missing.length === 0,
    provider: EMAIL_PROVIDER,
    missing,
    hasPrivateKey: Boolean(cfg.privateKey),
    campaignTemplates,
  };
}

function getEmailJsConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    serviceId: String(props.getProperty(EMAILJS_PROP_SERVICE_ID) || '').trim(),
    templateId: String(props.getProperty(EMAILJS_PROP_TEMPLATE_ID) || '').trim(),
    publicKey: String(props.getProperty(EMAILJS_PROP_PUBLIC_KEY) || '').trim(),
    privateKey: String(props.getProperty(EMAILJS_PROP_PRIVATE_KEY) || '').trim(),
  };
}

function setEmailJsConfig(serviceId, templateId, publicKey, privateKey) {
  const props = PropertiesService.getScriptProperties();
  if (serviceId) props.setProperty(EMAILJS_PROP_SERVICE_ID, String(serviceId).trim());
  if (templateId) props.setProperty(EMAILJS_PROP_TEMPLATE_ID, String(templateId).trim());
  if (publicKey) props.setProperty(EMAILJS_PROP_PUBLIC_KEY, String(publicKey).trim());
  if (privateKey) props.setProperty(EMAILJS_PROP_PRIVATE_KEY, String(privateKey).trim());
  return validateEmailProviderConfig();
}

function getEmailJsConfigStatus() {
  return validateEmailProviderConfig();
}

function getBrevoConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    apiKey: String(props.getProperty(BREVO_PROP_API_KEY) || '').trim(),
    templateId: String(props.getProperty(BREVO_PROP_TEMPLATE_ID) || '').trim(),
    senderEmail: String(props.getProperty(BREVO_PROP_SENDER_EMAIL) || '').trim(),
    senderName: String(props.getProperty(BREVO_PROP_SENDER_NAME) || '').trim(),
  };
}

function setBrevoConfig(apiKey, templateId, senderEmail, senderName) {
  const props = PropertiesService.getScriptProperties();
  if (apiKey) props.setProperty(BREVO_PROP_API_KEY, String(apiKey).trim());
  if (templateId) props.setProperty(BREVO_PROP_TEMPLATE_ID, String(templateId).trim());
  if (senderEmail) props.setProperty(BREVO_PROP_SENDER_EMAIL, String(senderEmail).trim());
  if (senderName) props.setProperty(BREVO_PROP_SENDER_NAME, String(senderName).trim());
  return validateEmailProviderConfig();
}

function getBrevoTemplateId(campaignKey) {
  const key = normalizeCampaignKey(campaignKey);
  if (!key) return '';
  const props = PropertiesService.getScriptProperties();
  const scoped = String(props.getProperty(`BREVO_TEMPLATE_ID_${key.toUpperCase()}`) || '').trim();
  if (scoped) return scoped;
  return String(props.getProperty(BREVO_PROP_TEMPLATE_ID) || '').trim();
}

function setBrevoCampaignTemplateId(campaignKey, templateId) {
  const key = normalizeCampaignKey(campaignKey);
  if (!key) return { ok: false, error: 'Invalid campaign key' };
  const id = String(templateId || '').trim();
  if (!id) return { ok: false, error: 'Missing templateId' };
  const props = PropertiesService.getScriptProperties();
  props.setProperty(`BREVO_TEMPLATE_ID_${key.toUpperCase()}`, id);
  return { ok: true, campaignKey: key, templateId: id };
}

function getProviderTemplateId(campaignKey) {
  if (EMAIL_PROVIDER === 'brevo') {
    if (!BREVO_USE_TEMPLATE_MODE) return 'direct-html';
    return getBrevoTemplateId(campaignKey);
  }
  if (EMAIL_PROVIDER === 'emailjs') return getEmailJsTemplateId(campaignKey);
  return '';
}

function logEmailJsConfigStatus() {
  const status = getEmailJsConfigStatus();
  const text = JSON.stringify(status, null, 2);
  Logger.log(text);
  console.log(text);
  return status;
}

function debugSendCampaignTestEmail(emailInput, campaignInput) {
  try {
    const result = sendCampaignTestEmail(emailInput, campaignInput);
    const text = JSON.stringify(result, null, 2);
    Logger.log(text);
    console.log(text);
    return result;
  } catch (err) {
    const errorPayload = {
      ok: false,
      error: String(err && err.message ? err.message : err),
      stack: err && err.stack ? String(err.stack) : '',
    };
    const text = JSON.stringify(errorPayload, null, 2);
    Logger.log(text);
    console.error(text);
    return errorPayload;
  }
}

function debugSendBuyingTestEmail() {
  const props = PropertiesService.getScriptProperties();
  const fallbackEmail = String(props.getProperty('EMAILJS_TEST_EMAIL') || '').trim();
  const testEmail = fallbackEmail || 'forrestsmithb@gmail.com';
  return debugSendCampaignTestEmail(testEmail, 'buying');
}

function sendViaEmailJs(payload) {
  const cfg = getEmailJsConfig();
  const missing = [];
  if (!cfg.serviceId) missing.push(EMAILJS_PROP_SERVICE_ID);
  if (!cfg.publicKey) missing.push(EMAILJS_PROP_PUBLIC_KEY);
  const templateId = String(payload.templateId || '').trim() || cfg.templateId;
  if (missing.length) {
    throw new Error(`EmailJS config missing: ${missing.join(', ')}`);
  }
  if (!templateId) {
    throw new Error(`EmailJS template missing for campaign: ${payload.campaignKey || ''}`);
  }
  const extraParams = payload && typeof payload.templateParams === 'object' && payload.templateParams
    ? payload.templateParams
    : {};
  const body = {
    service_id: cfg.serviceId,
    template_id: templateId,
    user_id: cfg.publicKey,
    template_params: {
      to_email: payload.toEmail || '',
      to_name: payload.toName || '',
      subject: payload.subject || '',
      message_html: payload.htmlBody || '',
      message_text: payload.textBody || '',
      campaign_key: payload.campaignKey || '',
      month_key: payload.monthKey || '',
      brand_name: BRAND_NAME,
      brand_primary: BRAND_PRIMARY,
      brand_dark: BRAND_DARK,
      ...extraParams,
    },
  };
  if (cfg.privateKey) {
    body.accessToken = cfg.privateKey;
  }

  const response = UrlFetchApp.fetch(EMAILJS_SEND_URL, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify(body),
  });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error(`EmailJS send failed (${code}): ${text}`);
  }
  return { ok: true, statusCode: code, response: text };
}

function sendViaBrevo(payload) {
  const cfg = getBrevoConfig();
  const missing = [];
  if (!cfg.apiKey) missing.push(BREVO_PROP_API_KEY);
  const templateIdRaw = String(payload.templateId || '').trim() || cfg.templateId;
  if (missing.length) {
    throw new Error(`Brevo config missing: ${missing.join(', ')}`);
  }

  const extraParams = payload && typeof payload.templateParams === 'object' && payload.templateParams
    ? payload.templateParams
    : {};
  const useTemplateMode = BREVO_USE_TEMPLATE_MODE;
  let body;
  if (useTemplateMode) {
    if (!templateIdRaw) {
      throw new Error(`Brevo template missing for campaign: ${payload.campaignKey || ''}`);
    }
    const templateId = Number(templateIdRaw);
    if (!Number.isFinite(templateId) || templateId <= 0) {
      throw new Error(`Brevo templateId must be numeric. Received: ${templateIdRaw}`);
    }
    body = {
      to: [{ email: String(payload.toEmail || '').trim(), name: String(payload.toName || '').trim() }],
      templateId,
      subject: payload.subject || '',
      params: {
        to_email: payload.toEmail || '',
        to_name: payload.toName || '',
        subject: payload.subject || '',
        message_html: payload.htmlBody || '',
        message_text: payload.textBody || '',
        campaign_key: payload.campaignKey || '',
        month_key: payload.monthKey || '',
        brand_name: BRAND_NAME,
        brand_primary: BRAND_PRIMARY,
        brand_dark: BRAND_DARK,
        ...extraParams,
      },
    };
  } else {
    if (!cfg.senderEmail) {
      throw new Error(`Brevo config missing: ${BREVO_PROP_SENDER_EMAIL}`);
    }
    body = {
      sender: {
        email: cfg.senderEmail,
        name: cfg.senderName || BRAND_NAME,
      },
      to: [{ email: String(payload.toEmail || '').trim(), name: String(payload.toName || '').trim() }],
      subject: payload.subject || '',
      htmlContent: String(payload.htmlBody || ''),
      textContent: String(payload.textBody || ''),
      params: {
        to_email: payload.toEmail || '',
        to_name: payload.toName || '',
        subject: payload.subject || '',
        campaign_key: payload.campaignKey || '',
        month_key: payload.monthKey || '',
        brand_name: BRAND_NAME,
        brand_primary: BRAND_PRIMARY,
        brand_dark: BRAND_DARK,
        ...extraParams,
      },
    };
  }

  const response = UrlFetchApp.fetch(BREVO_SEND_URL, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'api-key': cfg.apiKey,
      accept: 'application/json',
    },
    payload: JSON.stringify(body),
  });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error(`Brevo send failed (${code}): ${text}`);
  }
  return { ok: true, statusCode: code, response: text };
}

function getCampaignTemplates() {
  const props = PropertiesService.getScriptProperties();
  const out = {};
  CAMPAIGN_KEYS.forEach((rawKey) => {
    const key = normalizeCampaignKey(rawKey);
    if (!key) return;
    const defaults = buildDefaultCampaignTemplate(key);
    const activeRaw = String(props.getProperty(`EMAIL_CAMPAIGN_ACTIVE_${key.toUpperCase()}`) || '').trim().toLowerCase();
    const subject = String(props.getProperty(`EMAIL_CAMPAIGN_SUBJECT_${key.toUpperCase()}`) || '').trim();
    const htmlBody = String(props.getProperty(`EMAIL_CAMPAIGN_HTML_${key.toUpperCase()}`) || '').trim();
    const textBody = String(props.getProperty(`EMAIL_CAMPAIGN_TEXT_${key.toUpperCase()}`) || '').trim();
    out[key] = {
      subject: subject || defaults.subject,
      htmlBody: htmlBody || defaults.htmlBody,
      textBody: textBody || defaults.textBody,
      active: activeRaw ? !['false', '0', 'no', 'off'].includes(activeRaw) : true,
    };
  });
  return out;
}

function buildDefaultCampaignTemplate(campaignKey) {
  const label = campaignKey.charAt(0).toUpperCase() + campaignKey.slice(1);
  return {
    subject: `${label} market update - {{month}}`,
    htmlBody:
      `<p>Hi {{firstName}},</p>` +
      `<p>Here is your monthly <strong>${label}</strong> update for {{month}}.</p>` +
      `<p>- ${BRAND_NAME}</p>`,
    textBody:
      `Hi {{firstName}},\n\n` +
      `Here is your monthly ${label} update for {{month}}.\n\n` +
      `- ${BRAND_NAME}`,
    active: true,
  };
}

function getEmailJsTemplateId(campaignKey) {
  const key = normalizeCampaignKey(campaignKey);
  if (!key) return '';
  const props = PropertiesService.getScriptProperties();
  const scoped = String(props.getProperty(`EMAILJS_TEMPLATE_ID_${key.toUpperCase()}`) || '').trim();
  if (scoped) return scoped;
  return String(props.getProperty(EMAILJS_PROP_TEMPLATE_ID) || '').trim();
}

function setEmailJsCampaignTemplateId(campaignKey, templateId) {
  const key = normalizeCampaignKey(campaignKey);
  if (!key) return { ok: false, error: 'Invalid campaign key' };
  const id = String(templateId || '').trim();
  if (!id) return { ok: false, error: 'Missing templateId' };
  const props = PropertiesService.getScriptProperties();
  props.setProperty(`EMAILJS_TEMPLATE_ID_${key.toUpperCase()}`, id);
  return { ok: true, campaignKey: key, templateId: id };
}

function setupEmailJsTemplates(templateMap) {
  const map = templateMap || {};
  const results = [];
  CAMPAIGN_KEYS.forEach((key) => {
    const value = map[key];
    if (!value) return;
    results.push(setEmailJsCampaignTemplateId(key, value));
  });
  return { ok: true, updated: results };
}

function buildCampaignListingDigest(campaignKey, limit) {
  const key = normalizeCampaignKey(campaignKey);
  const max = Math.max(1, Math.min(12, Math.floor(toNumber(limit) || 6)));
  if (EMAIL_PROVIDER === 'brevo') {
    const selector = getPhotoGenSelectorForCampaign(key);
    if (selector) {
      try {
        const rendered = renderPhotoGenTemplateFromSheets({
          selector,
          targetType: 'property',
          limit: max,
          clientName: '{{firstName}}',
        });
        if (rendered && String(rendered.html || '').trim()) {
          return {
            count: Number(rendered.count || 0) || 0,
            listingsHtml: String(rendered.html || ''),
            listingsText: String(rendered.text || ''),
            listingsCompact: [],
          };
        }
      } catch (err) {
        console.error(`Unable to render ${selector} digest from photo-gen templates, using fallback digest`, err);
      }
    }
  }
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const properties = readSheet(ss, 'Properties');
  const filtered = filterListingsForCampaign(properties, campaignKey);
  const top = filtered.slice(0, max);
  const compactLimit = key === 'buying' ? 3 : 6;
  return {
    count: top.length,
    listingsHtml: buildListingsHtml(top),
    listingsText: buildListingsText(top),
    listingsCompact: buildCompactListings(top, compactLimit),
  };
}

function getPhotoGenSelectorForCampaign(campaignKey) {
  const key = normalizeCampaignKey(campaignKey);
  if (key === 'buying') return 'for-sale-email';
  if (key === 'renting') return 'lease-email';
  if (key === 'investment') return 'commercial';
  if (key === 'relocation') return 'for-sale-email';
  if (key === 'selling') return 'for-sale-email';
  return '';
}

function buildCompactListings(listings, limit) {
  const max = Math.max(1, Math.min(6, Math.floor(toNumber(limit) || 3)));
  const safe = Array.isArray(listings) ? listings.slice(0, max) : [];
  return safe.map((p) => {
    const price = Number(p?.price || 0);
    const city = [String(p?.city || '').trim(), String(p?.zip || '').trim()].filter(Boolean).join(' ');
    const image = toDriveDirectUrl(p?.image || (Array.isArray(p?.images) ? p.images[0] : '')) || '';
    return {
      title: String(p?.title || p?.address || 'New Listing').trim(),
      address: String(p?.address || '').trim(),
      city,
      price: price > 0 ? `$${price.toLocaleString()}` : 'Call for price',
      beds: String(p?.bedrooms ?? '-'),
      baths: String(p?.bathrooms ?? '-'),
      sqft: p?.squareFeet ? `${Number(p.squareFeet).toLocaleString()} sqft` : '-',
      url: String(p?.url || p?.listingUrl || p?.permalink || '#').trim() || '#',
      image,
    };
  });
}

function buildEmailJsListingTemplateParams(listings, maxListings) {
  const max = Math.max(1, Math.min(6, Math.floor(toNumber(maxListings) || 3)));
  const safe = Array.isArray(listings) ? listings : [];
  const params = { listing_count: String(Math.min(safe.length, max)) };
  for (let i = 0; i < max; i += 1) {
    const n = i + 1;
    const prefix = `p${n}_`;
    const item = safe[i] || {};
    params[`${prefix}title`] = String(item.title || '');
    params[`${prefix}address`] = String(item.address || '');
    params[`${prefix}city`] = String(item.city || '');
    params[`${prefix}price`] = String(item.price || '');
    params[`${prefix}beds`] = String(item.beds || '');
    params[`${prefix}baths`] = String(item.baths || '');
    params[`${prefix}sqft`] = String(item.sqft || '');
    params[`${prefix}url`] = String(item.url || '#');
    params[`${prefix}image`] = String(item.image || '');
  }
  return params;
}

function filterListingsForCampaign(properties, campaignKey) {
  const key = normalizeCampaignKey(campaignKey);
  const rows = (properties || [])
    .filter((p) => String(p?.status || '').toLowerCase() !== 'sold')
    .sort((a, b) => {
      const an = extractPropertyNumber(a?.id);
      const bn = extractPropertyNumber(b?.id);
      return bn - an;
    });

  if (key === 'renting') {
    return rows.filter((p) => ['rental', 'apartment', 'condo'].includes(normalizeKey(p?.type)));
  }
  if (key === 'investment') {
    return rows.filter((p) => ['commercial', 'land', 'apartment'].includes(normalizeKey(p?.type)));
  }
  if (key === 'selling') {
    return rows.filter((p) => String(p?.city || '').trim());
  }
  if (key === 'relocation') {
    return rows.filter((p) => ['austin', 'dallas', 'houston', 'waco'].includes(normalizeKey(p?.city)));
  }
  return rows;
}

function extractPropertyNumber(idValue) {
  const m = String(idValue || '').match(/property-(\d+)/i);
  return m ? Number(m[1]) || 0 : 0;
}

function buildListingsHtml(listings) {
  if (!listings || !listings.length) {
    return `<p style="margin:0;color:#444;">No new listings this cycle.</p>`;
  }
  const cards = listings.map((p) => {
    const price = Number(p?.price || 0);
    const priceText = price > 0 ? `$${price.toLocaleString()}` : 'Call for price';
    const beds = p?.bedrooms ?? '-';
    const baths = p?.bathrooms ?? '-';
    const sqft = p?.squareFeet ? `${Number(p.squareFeet).toLocaleString()} sqft` : '';
    return `<div style="border:1px solid #e8e8e8;border-radius:10px;padding:12px;margin:8px 0;background:#fff;">
      <div style="font-weight:700;color:${BRAND_DARK};">${p?.address || 'New Listing'}</div>
      <div style="color:#555;margin:4px 0;">${p?.city || ''} ${p?.zip || ''}</div>
      <div style="font-weight:700;color:${BRAND_PRIMARY};">${priceText}</div>
      <div style="color:#444;font-size:13px;">${beds} bd | ${baths} ba ${sqft ? `| ${sqft}` : ''}</div>
    </div>`;
  });
  return `<div style="margin-top:12px;"><h3 style="font-size:16px;margin:0 0 10px;color:${BRAND_DARK};">New Listings</h3>${cards.join('')}</div>`;
}

function buildListingsText(listings) {
  if (!listings || !listings.length) return 'No new listings this cycle.';
  return listings
    .map((p) => {
      const price = Number(p?.price || 0);
      const priceText = price > 0 ? `$${price.toLocaleString()}` : 'Call for price';
      const beds = p?.bedrooms ?? '-';
      const baths = p?.bathrooms ?? '-';
      const sqft = p?.squareFeet ? `${Number(p.squareFeet).toLocaleString()} sqft` : '';
      return `- ${p?.address || 'New Listing'} (${p?.city || ''} ${p?.zip || ''}) | ${priceText} | ${beds}bd/${baths}ba${sqft ? ` | ${sqft}` : ''}`;
    })
    .join('\n');
}

function getContactLeadsForCampaign(sheet) {
  const headerMap = getHeaderMap(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const emailIdx = getHeaderIndex(headerMap, ['email']);
  const nameIdx = getHeaderIndex(headerMap, ['name', 'full name', 'fullname', 'first name', 'firstname']);
  const interestsIdx = getHeaderIndex(headerMap, ['interests']);
  const notesIdx = getHeaderIndex(headerMap, ['notes']);
  if (emailIdx < 0) return [];

  const leadsByEmail = {};
  values.forEach((row) => {
    const email = String(row[emailIdx] || '').trim().toLowerCase();
    if (!email) return;
    const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '';
    const interests = interestsIdx >= 0 ? String(row[interestsIdx] || '') : '';
    const notes = notesIdx >= 0 ? String(row[notesIdx] || '') : '';
    const plans = parseCampaignKeysFromText(`${interests},${notes}`);
    if (!plans.length) return;

    if (!leadsByEmail[email]) {
      leadsByEmail[email] = { email, name, campaigns: {} };
    }
    plans.forEach((key) => {
      leadsByEmail[email].campaigns[key] = true;
    });
    if (name && !leadsByEmail[email].name) leadsByEmail[email].name = name;
  });

  return Object.keys(leadsByEmail).map((email) => ({
    email,
    name: leadsByEmail[email].name || '',
    campaigns: Object.keys(leadsByEmail[email].campaigns),
  }));
}

function getHeaderIndex(headerMap, candidateNames) {
  const names = Array.isArray(candidateNames) ? candidateNames : [candidateNames];
  for (let i = 0; i < names.length; i += 1) {
    const idx = (headerMap[normalizeKey(names[i])] || 0) - 1;
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseCampaignKeysFromText(input) {
  const text = normalizeKey(input).replace(/-/g, ' ');
  const keys = {};
  const patterns = {
    buying: ['buying', 'buyer', 'buy'],
    selling: ['selling', 'seller', 'sell'],
    investment: ['investment', 'investor', 'invest'],
    relocation: ['relocation', 'relocating', 'moving'],
    renting: ['renting', 'renter', 'rental', 'rent'],
  };

  Object.keys(patterns).forEach((key) => {
    if (patterns[key].some((token) => text.includes(token))) {
      keys[key] = true;
    }
  });

  return Object.keys(keys);
}

function normalizeCampaignKey(value) {
  const key = normalizeKey(value).replace(/-/g, '');
  if (key === 'buying') return 'buying';
  if (key === 'selling') return 'selling';
  if (key === 'investment') return 'investment';
  if (key === 'relocation') return 'relocation';
  if (key === 'renting') return 'renting';
  return '';
}

function getSentCampaignKeysForMonth(logSheet, monthKey) {
  const out = {};
  const lastRow = logSheet.getLastRow();
  if (lastRow < 2) return out;
  const headerMap = getHeaderMap(logSheet);
  const values = logSheet.getRange(2, 1, lastRow - 1, logSheet.getLastColumn()).getValues();
  const monthIdx = (headerMap[normalizeKey('monthKey')] || 0) - 1;
  const campaignIdx = (headerMap[normalizeKey('campaignKey')] || 0) - 1;
  const emailIdx = (headerMap[normalizeKey('email')] || 0) - 1;
  const statusIdx = (headerMap[normalizeKey('status')] || 0) - 1;

  values.forEach((row) => {
    const m = String(row[monthIdx] || '').trim();
    const campaign = normalizeCampaignKey(row[campaignIdx]);
    const email = String(row[emailIdx] || '').trim().toLowerCase();
    const status = String(row[statusIdx] || '').trim().toUpperCase();
    if (!m || !campaign || !email || status !== 'SENT') return;
    if (m !== monthKey) return;
    out[`${m}|${campaign}|${email}`] = true;
  });
  return out;
}

function renderCampaignTemplate(template, lead, campaignKey, monthKey, digest) {
  const campaignLabel = campaignKey.charAt(0).toUpperCase() + campaignKey.slice(1);
  const monthLabel = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM yyyy');
  const listingsHtml = digest?.listingsHtml || '';
  const listingsText = digest?.listingsText || '';
  const replacements = {
    '{{name}}': lead.name || '{{name}}',
    '{{firstName}}': lead.name ? lead.name.split(' ')[0] : '{{firstName}}',
    '{{clientName}}': lead.name || '{{clientName}}',
    '{{toName}}': lead.name || '{{toName}}',
    '{{campaign}}': campaignLabel,
    '{{month}}': monthLabel,
    '{{monthKey}}': monthKey,
    '{{email}}': lead.email || '',
    '{{listingsHtml}}': listingsHtml,
    '{{listingsText}}': listingsText,
    '{{brandName}}': BRAND_NAME,
    '{{brandPrimary}}': BRAND_PRIMARY,
    '{{brandDark}}': BRAND_DARK,
  };

  const apply = (text) => {
    let out = String(text || '');
    // Two passes so nested tokens coming from injected blocks like {{listingsHtml}}
    // also get resolved (e.g., {{firstName}} inside digest HTML).
    for (let pass = 0; pass < 2; pass += 1) {
      Object.keys(replacements).forEach((token) => {
        out = out.split(token).join(replacements[token]);
      });
    }
    return out;
  };

  const subject = apply(template.subject || `${campaignLabel} market update - {{month}}`);
  const resolvedListingsHtml = apply(listingsHtml);
  const resolvedListingsText = apply(listingsText);
  let htmlBody = apply(
    template.htmlBody
      || `<p>Hi {{firstName}},</p><p>Here is your {{campaign}} market update for {{month}}.</p>{{listingsHtml}}`,
  );
  let textBody = apply(
    template.textBody
      || `Hi {{firstName}},\n\nHere is your {{campaign}} market update for {{month}}.\n\n{{listingsText}}`,
  );

  if (!String(htmlBody).includes(resolvedListingsHtml) && resolvedListingsHtml) {
    htmlBody = `${htmlBody}<br><br>${resolvedListingsHtml}`;
  }
  if (!String(textBody).includes(resolvedListingsText) && resolvedListingsText) {
    textBody = `${textBody}\n\n${resolvedListingsText}`;
  }

  let templateParams = {};
  if (campaignKey === 'buying') {
    // Keep EmailJS variable payload small by sending compact structured listing fields.
    templateParams = buildEmailJsListingTemplateParams(digest?.listingsCompact || [], 3);
  }

  return { subject, htmlBody, textBody, templateParams };
}

function seedDefaultEmailTemplates(sheet) {
  const existing = readSheet(SpreadsheetApp.openById(MASTER_SHEET_ID), EMAIL_TEMPLATES_TAB_NAME);
  const existingKeys = {};
  existing.forEach((row) => {
    const key = normalizeCampaignKey(row.campaignKey);
    if (key) existingKeys[key] = true;
  });

  const rows = [];
  CAMPAIGN_KEYS.forEach((key) => {
    if (existingKeys[key]) return;
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    rows.push([
      key,
      `${label} market update - {{month}}`,
      `<p>Hi {{firstName}},</p><p>Here is your monthly <strong>${label}</strong> update for {{month}}.</p><p>- Kerry Williams Realty</p>`,
      `Hi {{firstName}},\n\nHere is your monthly ${label} update for {{month}}.\n\n- Kerry Williams Realty`,
      'TRUE',
      new Date(),
    ]);
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, EMAIL_TEMPLATE_HEADERS.length).setValues(rows);
  }
  return rows.length;
}

function getOrCreateSheet(ss, sheetName) {
  const existing = ss.getSheetByName(sheetName);
  if (existing) return existing;
  return ss.insertSheet(sheetName);
}

function ensureSheetHeaders(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0] || [];
  const needs = headers.some((h, idx) => String(current[idx] || '').trim() !== h);
  if (needs) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

/** PHOTO GEN TAB **/
function setupPhotoGenSheet() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sheet = getOrCreateSheet(ss, PHOTO_GEN_TAB_NAME);
  ensureSheetHeaders(sheet, PHOTO_GEN_HEADERS);
  setupPhotoGenTemplateLibrarySheet();
  setupDataEntryDropdowns();
  return { sheetName: PHOTO_GEN_TAB_NAME, headers: PHOTO_GEN_HEADERS, configured: true };
}

function setupPhotoGenTemplateLibrarySheet() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sheet = getOrCreateSheet(ss, PHOTO_GEN_TEMPLATE_LIBRARY_TAB_NAME);
  ensureSheetHeaders(sheet, PHOTO_GEN_TEMPLATE_LIBRARY_HEADERS);

  const existing = readSheet(ss, PHOTO_GEN_TEMPLATE_LIBRARY_TAB_NAME);
  const existingKeys = {};
  existing.forEach((row) => {
    const key = normalizeKey(row.templateSelector);
    if (key) existingKeys[key] = true;
  });

  const rowsToAdd = PHOTO_GEN_TEMPLATE_LIBRARY.filter((row) => {
    const key = normalizeKey(row[0]);
    return key && !existingKeys[key];
  });

  if (rowsToAdd.length) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, PHOTO_GEN_TEMPLATE_LIBRARY_HEADERS.length)
      .setValues(rowsToAdd);
  }

  return {
    sheetName: PHOTO_GEN_TEMPLATE_LIBRARY_TAB_NAME,
    totalTemplates: Math.max(0, sheet.getLastRow() - 1),
    addedTemplates: rowsToAdd.length,
  };
}

function setupBrandedPhotoGenTemplates() {
  const result = setupPhotoGenTemplateLibrarySheet();
  setupPhotoGenSheet();
  return {
    ok: true,
    ...result,
    templates: [
      'for-sale',
      'for-sale-email',
      'for-sale-card',
      'under-contract',
      'under-contract-email',
      'under-contract-card',
      'sold',
      'sold-email',
      'sold-card',
      'lease',
      'lease-email',
      'lease-card',
      'agent-card',
      'bio-card',
    ],
  };
}

function setupPhotoGenHtmlTemplateSheet() {
  const defaults = getPhotoGenHtmlTemplateMap();
  return {
    storage: 'code',
    totalTemplates: Object.keys(defaults).length,
    selectors: Object.values(defaults).map((t) => t.selector),
  };
}

function getPhotoGenHtmlTemplateMap() {
  const rows = getDefaultPhotoGenHtmlTemplateRows();
  const out = {};
  rows.forEach((row) => {
    const selector = normalizeTemplateSelector(row[0]);
    const targetType = normalizeTargetType(row[1]);
    const key = `${selector}|${targetType}`;
    if (!key || key === '|') return;
    out[key] = {
      selector,
      targetType,
      templateName: row[2] || '',
      html: String(row[3] || ''),
      text: String(row[4] || ''),
    };
  });
  return out;
}

function getPhotoGenHtmlTemplate(selectorInput, targetTypeInput) {
  const selector = normalizeTemplateSelector(selectorInput) || 'for-sale';
  const targetType = normalizeTargetType(targetTypeInput) || 'property';
  const map = getPhotoGenHtmlTemplateMap();
  const exact = map[`${selector}|${targetType}`];
  if (exact) return exact;

  const fallbackSelector = targetType === 'agent' ? 'agent-card' : 'for-sale-card';
  const fallback = map[`${fallbackSelector}|${targetType}`];
  if (fallback) return fallback;

  const defaults = getDefaultPhotoGenHtmlTemplateRows();
  const row = defaults.find(
    (x) => normalizeTemplateSelector(x[0]) === fallbackSelector && normalizeTargetType(x[1]) === targetType,
  ) || defaults[0];
  return {
    selector: normalizeTemplateSelector(row[0]),
    targetType: normalizeTargetType(row[1]),
    templateName: row[2],
    html: row[3],
    text: row[4],
  };
}

function getDefaultPhotoGenHtmlTemplateRows() {
  try {
    if (typeof buildDefaultPhotoGenHtmlTemplates === 'function') {
      const rows = buildDefaultPhotoGenHtmlTemplates();
      if (Array.isArray(rows) && rows.length) return rows;
    }
  } catch (err) {
    console.error('Unable to read generated photo-gen template registry, using fallback', err);
  }
  return buildInlinePhotoGenHtmlTemplatesFallback();
}

function buildInlinePhotoGenHtmlTemplatesFallback() {
  const propertyHtml = [
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;border:1px solid #e7e9ec;border-radius:12px;overflow:hidden;font-family:Arial,\'Segoe UI\',sans-serif;background:#ffffff;">',
    '<tr><td style="background:linear-gradient(120deg, {{brandDark}}, #1b1f25);padding:18px 20px 16px;color:#ffffff;"><div style="font-size:26px;line-height:1.15;font-weight:800;margin-top:6px;">{{title}}</div></td></tr>',
    '<tr><td><img src="{{imageUrl}}" alt="{{title}}" style="width:100%;height:320px;display:block;object-fit:contain;background:#0f1318;"></td></tr>',
    '<tr><td style="padding:10px 18px 4px;background:#ffffff;">',
    '<div style="margin:0 0 8px;"><span style="display:inline-block;background:{{brandPrimary}};color:{{brandDark}};font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:8px 12px;border-radius:999px;">For Sale</span></div>',
    '<div style="font-size:19px;color:#5f6670;line-height:1.35;margin:0 0 10px;font-weight:600;">{{propertyAddress}} {{city}}</div>',
    '<div style="font-size:28px;line-height:1.1;color:{{brandDark}};font-weight:800;margin:0 0 12px;">{{price}}</div>',
    '<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 3px;"><tr><td style="padding:0;">',
    '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border:1px solid #dfe3e8;border-radius:999px;font-size:12px;color:{{brandDark}};white-space:nowrap;"><strong>{{beds}}</strong> Beds</span>',
    '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border:1px solid #dfe3e8;border-radius:999px;font-size:12px;color:{{brandDark}};white-space:nowrap;"><strong>{{baths}}</strong> Baths</span>',
    '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border:1px solid #dfe3e8;border-radius:999px;font-size:12px;color:{{brandDark}};white-space:nowrap;"><strong>{{sqft}}</strong> Sq Ft</span>',
    '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border:1px solid #dfe3e8;border-radius:999px;font-size:12px;color:{{brandDark}};white-space:nowrap;"><strong>{{propertyType}}</strong></span>',
    '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border:1px solid #dfe3e8;border-radius:999px;font-size:12px;color:{{brandDark}};white-space:nowrap;"><strong>{{yearBuilt}}</strong> Built</span>',
    '<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border:1px solid #dfe3e8;border-radius:999px;font-size:12px;color:{{brandDark}};white-space:nowrap;"><strong>{{lotSize}}</strong> Lot</span>',
    '</td></tr></table>',
    '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:2px;"><tr>',
    '<td align="left" style="padding-top:4px;"><a href="{{ctaUrl}}" style="display:inline-block;padding:7px 12px;background:{{brandPrimary}};border:1px solid {{brandPrimary}};color:{{brandDark}};text-decoration:none;border-radius:10px;font-weight:800;font-size:12px;letter-spacing:.02em;">View Listing</a></td>',
    '<td align="right" style="padding-top:4px;font-size:15px;color:#4f5660;letter-spacing:.01em;font-weight:800;text-transform:none;line-height:1;">',
    '<table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;"><tr>',
    '<td style="padding-right:8px;white-space:nowrap;color:{{brandDark}};">NEW LISTINGS</td>',
    '<td style="white-space:nowrap;"><img src="{{logoUrl}}" alt="44 Realty" style="height:56px;display:block;"></td>',
    '</tr></table>',
    '</td></tr></table>',
    '</td></tr></table>',
  ].join('');

  const soldHtml = propertyHtml.replace('For Sale', 'Sold');
  const underContractHtml = propertyHtml.replace('For Sale', 'Under Contract');
  const leaseHtml = propertyHtml.replace('For Sale', 'For Lease');
  const bioHtml = [
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;border:1px solid #e7e9ec;border-radius:12px;overflow:hidden;font-family:Arial,\'Segoe UI\',sans-serif;background:#ffffff;">',
    '<tr><td style="padding:18px;"><img src="{{imageUrl}}" alt="{{agentName}}" style="width:100%;max-height:320px;object-fit:cover;display:block;border-radius:10px;"></td></tr>',
    '<tr><td style="padding:0 18px 18px;"><div style="font-size:26px;font-weight:800;color:{{brandDark}};">{{agentName}}</div><div style="color:#5f6670;margin-top:6px;">{{subtitle}}</div><p style="color:#2f3640;line-height:1.5;">{{title}}</p><a href="{{ctaUrl}}" style="display:inline-block;padding:12px 18px;background:{{brandPrimary}};color:{{brandDark}};text-decoration:none;border-radius:10px;font-weight:700;">View Profile</a></td></tr>',
    '</table>',
  ].join('');

  return [
    ['for-sale', 'property', 'For Sale Card', propertyHtml, 'FOR SALE\n{{title}}\n{{propertyAddress}} {{city}}\n{{price}}\nView Listing: {{ctaUrl}}'],
    ['under-contract', 'property', 'Under Contract Card', underContractHtml, 'UNDER CONTRACT\n{{title}}\n{{propertyAddress}} {{city}}\n{{price}}\nView Listing: {{ctaUrl}}'],
    ['sold', 'property', 'Sold Card', soldHtml, 'SOLD\n{{title}}\n{{propertyAddress}} {{city}}\n{{price}}\nView Listing: {{ctaUrl}}'],
    ['lease', 'property', 'Lease Card', leaseHtml, 'FOR LEASE\n{{title}}\n{{propertyAddress}} {{city}}\n{{price}}\nView Listing: {{ctaUrl}}'],
    ['bio', 'agent', 'Agent Bio Card', bioHtml, 'AGENT BIO\n{{agentName}}\n{{subtitle}}\n{{title}}\nView Profile: {{ctaUrl}}'],
  ];
}

function getPhotoGenTemplatePreset(selectorInput, targetTypeInput) {
  const rawSelector = normalizeTemplateSelector(selectorInput);
  const inferredTargetType =
    normalizeTargetType(targetTypeInput)
    || (['agent-card', 'bio', 'bio-card', 'headshot', 'agent-brand', 'agent-social'].includes(rawSelector)
      ? 'agent'
      : 'property');

  const propertyPresets = {
    'for-sale': {
      baseSelector: 'for-sale',
      listingPhrase: 'for sale',
      badgeLabel: 'Featured Listing',
      ctaLabel: 'See Details',
      footerLabel: 'FOR SALE',
    },
    'for-sale-email': {
      baseSelector: 'for-sale',
      listingPhrase: 'for sale',
      badgeLabel: 'Featured Listing',
      ctaLabel: 'See Full Listing',
      footerLabel: 'MONTHLY PICKS',
    },
    'under-contract': {
      baseSelector: 'for-sale',
      listingPhrase: 'under contract',
      badgeLabel: 'Under Contract',
      ctaLabel: 'View Listing',
      footerLabel: 'PENDING',
    },
    'under-contract-email': {
      baseSelector: 'for-sale',
      listingPhrase: 'under contract',
      badgeLabel: 'Under Contract',
      ctaLabel: 'View Listing',
      footerLabel: 'PENDING PICKS',
    },
    sold: {
      baseSelector: 'for-sale',
      listingPhrase: 'sold',
      badgeLabel: 'Sold',
      ctaLabel: 'See Similar Homes',
      footerLabel: 'JUST SOLD',
      useStatusLabelAsPrice: true,
    },
    'sold-email': {
      baseSelector: 'for-sale',
      listingPhrase: 'sold',
      badgeLabel: 'Sold',
      ctaLabel: 'See Similar Homes',
      footerLabel: 'JUST SOLD',
      useStatusLabelAsPrice: true,
    },
    lease: {
      baseSelector: 'for-sale',
      listingPhrase: 'for lease',
      badgeLabel: 'For Lease',
      ctaLabel: 'Schedule Tour',
      footerLabel: 'NEW LEASES',
    },
    'lease-email': {
      baseSelector: 'for-sale',
      listingPhrase: 'for lease',
      badgeLabel: 'For Lease',
      ctaLabel: 'Schedule Tour',
      footerLabel: 'LEASE PICKS',
    },
    'for-sale-card': {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for sale',
      badgeLabel: 'Featured Listing',
      ctaLabel: 'See Details',
      footerLabel: 'FOR SALE',
    },
    'under-contract-card': {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for sale',
      badgeLabel: 'Under Contract',
      ctaLabel: 'View Listing',
      footerLabel: 'PENDING',
    },
    'sold-card': {
      baseSelector: 'for-sale-card',
      listingPhrase: 'sold',
      badgeLabel: 'Sold',
      ctaLabel: 'See Similar Homes',
      footerLabel: 'JUST SOLD',
      useStatusLabelAsPrice: true,
    },
    'lease-card': {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for lease',
      badgeLabel: 'For Lease',
      ctaLabel: 'Schedule Tour',
      footerLabel: 'NEW LEASES',
    },
    commercial: {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for sale',
      badgeLabel: 'Commercial Listing',
      ctaLabel: 'View Listing',
      footerLabel: 'COMMERCIAL',
    },
    'new-construction': {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for sale',
      badgeLabel: 'New Construction',
      ctaLabel: 'View Listing',
      footerLabel: 'NEW BUILD',
    },
    'open-house': {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for sale',
      badgeLabel: 'Open House',
      ctaLabel: 'Reserve Tour',
      footerLabel: 'OPEN HOUSE',
    },
    social: {
      baseSelector: 'for-sale-card',
      listingPhrase: 'for sale',
      badgeLabel: 'Social Spotlight',
      ctaLabel: 'See Details',
      footerLabel: 'SOCIAL PICK',
    },
  };

  const agentPresets = {
    'agent-card': {
      baseSelector: 'agent-card',
      badgeLabel: 'Agent Profile',
      ctaLabel: 'Contact Agent',
      footerLabel: 'AGENT PROFILE',
    },
    bio: {
      baseSelector: 'agent-card',
      badgeLabel: 'Agent Profile',
      ctaLabel: 'Contact Agent',
      footerLabel: 'AGENT PROFILE',
    },
    'bio-card': {
      baseSelector: 'agent-card',
      badgeLabel: 'Agent Profile',
      ctaLabel: 'Contact Agent',
      footerLabel: 'AGENT PROFILE',
    },
    headshot: {
      baseSelector: 'agent-card',
      badgeLabel: 'Agent Headshot',
      ctaLabel: 'Book Consultation',
      footerLabel: 'HEADSHOT',
    },
    'agent-brand': {
      baseSelector: 'agent-card',
      badgeLabel: 'Agent Brand',
      ctaLabel: 'View Brand Kit',
      footerLabel: 'AGENT BRAND',
    },
    'agent-social': {
      baseSelector: 'agent-card',
      badgeLabel: 'Agent Social',
      ctaLabel: 'Follow Agent',
      footerLabel: 'SOCIAL PROFILE',
    },
  };

  const defaultPreset = inferredTargetType === 'agent'
    ? {
        baseSelector: 'agent-card',
        badgeLabel: 'Agent Profile',
        ctaLabel: 'Contact Agent',
        footerLabel: 'AGENT PROFILE',
      }
    : {
        baseSelector: 'for-sale-card',
        listingPhrase: 'for sale',
        badgeLabel: 'Featured Listing',
        ctaLabel: 'See Details',
        footerLabel: 'FOR SALE',
      };

  const scopedMap = inferredTargetType === 'agent' ? agentPresets : propertyPresets;
  const preset = scopedMap[rawSelector] || defaultPreset;
  const selector = rawSelector || preset.baseSelector;
  return {
    selector,
    targetType: inferredTargetType,
    ...preset,
  };
}

function renderPhotoGenHtmlTemplate(selectorInput, data = {}, targetTypeInput) {
  const preset = getPhotoGenTemplatePreset(selectorInput, targetTypeInput);
  const template = getPhotoGenHtmlTemplate(preset.baseSelector, preset.targetType);
  const defaultLogoUrl = getBrandLogoUrl();
  const defaultHeaderImageUrl = getBrandHeaderImageUrl();
  const defaultTextureUrl = getBrandTextureUrl();
  const selectorKey = normalizeTemplateSelector(preset.selector);
  const statusKey = normalizeKey(data.status || data.statusLabel || '');
  let listingPhrase = String(data.listingPhrase || preset.listingPhrase || '').trim().toLowerCase();
  if (!listingPhrase) {
    if (
      selectorKey === 'lease'
      || ['rental', 'lease', 'for-rent', 'forrent', 'for-lease', 'forlease'].includes(statusKey)
    ) {
      listingPhrase = 'for lease';
    } else {
      listingPhrase = 'for sale';
    }
  }
  const listingPhraseTitle = listingPhrase.replace(/\b[a-z]/g, (m) => m.toUpperCase());
  const statusLabel = String(data.statusLabel || '').trim();
  const resolvedPrice = preset.useStatusLabelAsPrice && statusLabel
    ? statusLabel
    : String(data.price || '').trim();
  const replacements = {
    '{{brandName}}': BRAND_NAME,
    '{{brandPrimary}}': BRAND_PRIMARY,
    '{{brandDark}}': BRAND_DARK,
    '{{clientName}}': String(data.clientName || data.firstName || data.name || '{{clientName}}').trim(),
    '{{listingPhrase}}': listingPhrase,
    '{{listingPhraseTitle}}': listingPhraseTitle,
    '{{listingPhraseUpper}}': listingPhrase.toUpperCase(),
    '{{headerImageUrl}}': String(data.headerImageUrl || defaultHeaderImageUrl).trim(),
    '{{textureUrl}}': String(data.textureUrl || defaultTextureUrl).trim(),
    '{{logoUrl}}': String(data.logoUrl || defaultLogoUrl).trim(),
    '{{title}}': String(data.title || data.headline || 'New Listing').trim(),
    '{{subtitle}}': String(data.subtitle || '').trim(),
    '{{badgeLabel}}': String(data.badgeLabel || preset.badgeLabel || 'Featured Listing').trim(),
    '{{ctaLabel}}': String(data.ctaLabel || preset.ctaLabel || 'See Details').trim(),
    '{{footerLabel}}': String(data.footerLabel || preset.footerLabel || 'PROPERTY PICKS').trim(),
    '{{propertyAddress}}': String(data.propertyAddress || data.address || '').trim(),
    '{{city}}': String(data.city || '').trim(),
    '{{price}}': resolvedPrice,
    '{{beds}}': String(data.beds || data.bedrooms || '-').trim(),
    '{{baths}}': String(data.baths || data.bathrooms || '-').trim(),
    '{{sqft}}': String(data.sqft || data.squareFeet || '-').trim(),
    '{{propertyType}}': String(data.propertyType || data.type || '-').trim(),
    '{{yearBuilt}}': String(data.yearBuilt || '-').trim(),
    '{{lotSize}}': String(data.lotSize || '-').trim(),
    '{{statusLabel}}': String(data.statusLabel || '').trim(),
    '{{agentName}}': String(data.agentName || '').trim(),
    '{{ctaUrl}}': String(data.ctaUrl || '#').trim() || '#',
    '{{imageUrl}}': String(data.imageUrl || '').trim(),
  };

  const apply = (input) => {
    let out = String(input || '');
    Object.keys(replacements).forEach((token) => {
      out = out.split(token).join(replacements[token]);
    });
    return out;
  };

  return {
    selector: preset.selector,
    targetType: preset.targetType,
    templateName: template.templateName,
    html: apply(template.html),
    text: apply(template.text),
  };
}

function renderPhotoGenHtmlTemplateList(selectorInput, listData = [], targetTypeInput) {
  const items = Array.isArray(listData) ? listData : [];
  const safe = items.filter((x) => x && typeof x === 'object');
  if (!safe.length) {
    return {
      selector: normalizeTemplateSelector(selectorInput) || 'for-sale',
      targetType: normalizeTargetType(targetTypeInput) || 'property',
      count: 0,
      html: '',
      text: '',
    };
  }

  const renderedItems = safe.map((item) => renderPhotoGenHtmlTemplate(selectorInput, item, targetTypeInput));
  const first = renderedItems[0];
  const listPreset = getPhotoGenTemplatePreset(selectorInput, targetTypeInput);
  const canGroupForSale =
    listPreset.baseSelector === 'for-sale'
    && first.targetType === 'property'
    && renderedItems.length > 1;
  let html = '';
  if (canGroupForSale) {
    const firstHtml = String(renderedItems[0].html || '');
    const headerMatch = firstHtml.match(/<!-- LIST_HEADER_START -->([\s\S]*?)<!-- LIST_HEADER_END -->/);
    const footerMatch = firstHtml.match(/<!-- LIST_FOOTER_START -->([\s\S]*?)<!-- LIST_FOOTER_END -->/);
    const footerEndIdx = firstHtml.indexOf('<!-- LIST_FOOTER_END -->');
    const trailingAfterFooter = footerEndIdx >= 0
      ? firstHtml.slice(footerEndIdx + '<!-- LIST_FOOTER_END -->'.length)
      : '';
    const header = headerMatch && headerMatch[1] ? String(headerMatch[1]) : '';
    const footer = (footerMatch && footerMatch[1] ? String(footerMatch[1]) : '') + trailingAfterFooter;

    if (header && footer) {
      const cards = renderedItems.map((item) => {
        let cardHtml = String(item.html || '');
        cardHtml = cardHtml.replace(/<!-- LIST_HEADER_START -->[\s\S]*?<!-- LIST_HEADER_END -->/, '');
        cardHtml = cardHtml.replace(/<!-- LIST_FOOTER_START -->[\s\S]*?<!-- LIST_FOOTER_END -->[\s\S]*$/, '');
        cardHtml = cardHtml.replace(/<!-- LIST_CARD_START -->/g, '').replace(/<!-- LIST_CARD_END -->/g, '');
        return cardHtml.trim();
      });
      html = `${header}${cards.join('')}${footer}`;
    } else {
      const sections = renderedItems.map((item) => extractForSaleListSections(item.html));
      const fallbackHeader = String(sections[0]?.header || '').trim();
      const fallbackFooter = String(sections[0]?.footer || '').trim();
      const hasStructure = fallbackHeader && fallbackFooter && sections.every((parts) => String(parts?.card || '').trim());
      if (hasStructure) {
        const cards = sections.map((parts) => parts.card);
        html = `${fallbackHeader}${cards.join('')}${fallbackFooter}`;
      }
    }

    const expectedImages = safe
      .map((item) => String(item.imageUrl || '').trim())
      .filter((u) => /^https?:\/\//i.test(u));
    const hasAllListingImages = expectedImages.every((u) => html.includes(u));
    if (!html || !hasAllListingImages) {
      // Final safety: never ship grouped markup if any listing image is dropped.
      const spacer = '<div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>';
      html = renderedItems.map((item) => item.html).join(spacer);
    }
  } else {
    const spacer = '<div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>';
    html = renderedItems.map((item) => item.html).join(spacer);
  }
  const text = renderedItems.map((item, idx) => `#${idx + 1}\n${item.text}`).join('\n\n');

  return {
    selector: first.selector,
    targetType: first.targetType,
    count: renderedItems.length,
    html,
    text,
  };
}

function extractForSaleListSections(html) {
  const input = String(html || '');
  const headerMatch = input.match(/<!-- LIST_HEADER_START -->([\s\S]*?)<!-- LIST_HEADER_END -->/);
  const cardMatch = input.match(/<!-- LIST_CARD_START -->([\s\S]*?)<!-- LIST_CARD_END -->/);
  const footerMatch = input.match(/<!-- LIST_FOOTER_START -->([\s\S]*?)<!-- LIST_FOOTER_END -->/);
  const footerEndIdx = input.indexOf('<!-- LIST_FOOTER_END -->');
  const trailingAfterFooter = footerEndIdx >= 0
    ? input.slice(footerEndIdx + '<!-- LIST_FOOTER_END -->'.length)
    : '';
  const marked = {
    header: headerMatch && headerMatch[1] ? headerMatch[1] : '',
    card: cardMatch && cardMatch[1] ? cardMatch[1] : '',
    footer: (footerMatch && footerMatch[1] ? footerMatch[1] : '') + trailingAfterFooter,
  };
  if (marked.header || marked.card || marked.footer) return marked;
  return extractForSaleListSectionsFallback(input);
}

function extractForSaleListSectionsFallback(inputHtml) {
  const input = String(inputHtml || '');
  if (!input) return { header: '', card: '', footer: '' };

  // Fallback when LIST_* markers are unavailable in the runtime template source.
  const cardTableAnchor = input.indexOf('max-width:640px');
  const tableRowStart = cardTableAnchor >= 0 ? input.lastIndexOf('<tr', cardTableAnchor) : -1;
  const cardAnchor = input.indexOf('Featured Home');
  const featuredRowStart = cardAnchor >= 0 ? input.lastIndexOf('<tr', cardAnchor) : -1;
  const cardStart = tableRowStart >= 0 ? tableRowStart : featuredRowStart;
  if (cardStart < 0) return { header: '', card: input, footer: '' };

  const footerToken = 'You are receiving this monthly update because';
  const footerAnchor = input.indexOf(footerToken);
  const footerStart = footerAnchor >= 0 ? input.lastIndexOf('<tr', footerAnchor) : -1;

  const tableCloseIdx = input.lastIndexOf('</table>');
  const cardEnd = footerStart > cardStart
    ? footerStart
    : (tableCloseIdx > cardStart ? tableCloseIdx : input.length);

  return {
    header: input.slice(0, cardStart),
    card: input.slice(cardStart, cardEnd),
    footer: footerStart > cardStart ? input.slice(footerStart) : input.slice(cardEnd),
  };
}

function renderPhotoGenTemplateFromSheets(options = {}) {
  const selector = normalizeTemplateSelector(options.selector || 'for-sale') || 'for-sale';
  const inferredTargetType = ['agent-card', 'bio', 'bio-card', 'headshot', 'agent-brand', 'agent-social'].includes(selector) ? 'agent' : 'property';
  const targetType = normalizeTargetType(options.targetType) || inferredTargetType;
  const limit = Math.max(1, Math.min(20, Number(options.limit || 5) || 5));
  const clientName = String(options.clientName || '').trim() || getLatestContactLeadName();
  const statusFocus = normalizeCsvList(options.statusFocus);
  const typeFocus = normalizeCsvList(options.typeFocus);
  const agentId = String(options.agentId || '').trim();
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const resolved = getResolvedTemplateEntities();
  const properties = resolved?.properties?.length ? resolved.properties : readSheet(ss, 'Properties');

  if (targetType === 'agent') {
    const agents = resolved?.agents?.length ? resolved.agents : readSheet(ss, 'Agents');
    const rows = buildAgentTemplateRowsFromSheet(agents, properties, selector, limit, { statusFocus, typeFocus, agentId });
    return renderPhotoGenHtmlTemplateList(selector, rows, 'agent');
  }

  const rows = buildPropertyTemplateRowsFromSheet(properties, selector, limit, { clientName, statusFocus, typeFocus, agentId });
  return renderPhotoGenHtmlTemplateList(selector, rows, 'property');
}

function getLatestContactLeadName() {
  try {
    const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
    const sheet = ss.getSheetByName(CONTACT_TAB_NAME);
    if (!sheet) return '';
    const headerMap = getHeaderMap(sheet);
    const nameIdx = getHeaderIndex(headerMap, ['name', 'full name', 'fullname', 'first name', 'firstname']);
    if (nameIdx < 0) return '';
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return '';
    const values = sheet.getRange(2, nameIdx + 1, lastRow - 1, 1).getValues().flat();
    for (let i = values.length - 1; i >= 0; i -= 1) {
      const name = String(values[i] || '').trim();
      if (name) return name;
    }
    return '';
  } catch (err) {
    console.error('Unable to read latest contact lead name', err);
    return '';
  }
}

function getResolvedTemplateEntities() {
  try {
    const payload = exportData({ includeDebug: false });
    const root = Array.isArray(payload) && payload.length ? payload[0] : null;
    return {
      agents: Array.isArray(root?.agents) ? root.agents : [],
      properties: Array.isArray(root?.properties) ? root.properties : [],
    };
  } catch (err) {
    console.error('Unable to resolve entities through export pipeline for templates', err);
    return { agents: [], properties: [] };
  }
}

function buildPropertyTemplateRowsFromSheet(properties, selector, limit, options = {}) {
  const list = Array.isArray(properties) ? properties : [];
  const logoUrl = getBrandLogoUrl();
  const headerImageUrl = getBrandHeaderImageUrl();
  const clientName = String(options.clientName || '').trim();
  const statusFocus = normalizeCsvList(options.statusFocus);
  const typeFocus = normalizeCsvList(options.typeFocus);
  const agentIdFocus = normalizeKey(options.agentId);
  const filtered = list
    .filter((p) => propertyMatchesTemplateSelector(p, selector))
    .filter((p) => !statusFocus.length || statusFocus.includes(normalizeKey(p?.status)))
    .filter((p) => !typeFocus.length || typeFocus.includes(normalizeKey(p?.type)))
    .filter((p) => !agentIdFocus || propertyBelongsToAgent(p, agentIdFocus))
    .sort((a, b) => extractPropertyNumber(b?.id) - extractPropertyNumber(a?.id))
    .slice(0, limit);

  return filtered.map((p, idx) => {
    const img = resolveTemplateImageUrl(p?.image, p?.images);
    const price = toNumber(p?.price);
    const priceText = price > 0 ? `$${price.toLocaleString()}` : 'Call for price';
    const city = [String(p?.city || '').trim(), String(p?.zip || '').trim()].filter(Boolean).join(' ');
    const lotRaw = String(p?.lotSize || '').trim();
    const lotSize = lotRaw ? (/[a-z]/i.test(lotRaw) ? lotRaw : `${lotRaw} ac`) : '-';
    return {
      clientName,
      title: String(p?.title || p?.address || `Listing ${idx + 1}`).trim(),
      propertyAddress: String(p?.address || '').trim(),
      city,
      price: priceText,
      beds: String(p?.bedrooms ?? '-'),
      baths: String(p?.bathrooms ?? '-'),
      sqft: p?.squareFeet ? Number(p.squareFeet).toLocaleString() : '-',
      propertyType: String(p?.type || '-'),
      yearBuilt: String(p?.yearBuilt || '-'),
      lotSize,
      statusLabel: String(p?.status || '').trim(),
      ctaUrl: String(p?.url || p?.listingUrl || p?.permalink || '#').trim() || '#',
      imageUrl: img,
      headerImageUrl,
      logoUrl,
    };
  });
}

function resolveTemplateImageUrl(primaryImage, galleryImages) {
  const fallback = 'https://placehold.co/1200x800/e9edf2/5f6670?text=Listing+Photo';
  const candidates = [];
  candidates.push(primaryImage);
  if (Array.isArray(galleryImages)) {
    for (let i = 0; i < galleryImages.length; i += 1) {
      candidates.push(galleryImages[i]);
    }
  }

  for (let i = 0; i < candidates.length; i += 1) {
    const raw = String(candidates[i] || '').trim();
    if (!raw) continue;
    const normalized = toDriveDirectUrl(raw) || raw;
    if (/^https?:\/\//i.test(normalized)) return normalized;
  }

  return fallback;
}

function buildAgentTemplateRowsFromSheet(agents, properties, selector, limit, options = {}) {
  const list = Array.isArray(agents) ? agents : [];
  const props = Array.isArray(properties) ? properties : [];
  const logoUrl = getBrandLogoUrl();
  const headerImageUrl = getBrandHeaderImageUrl();
  const statusFocus = normalizeCsvList(options.statusFocus);
  const typeFocus = normalizeCsvList(options.typeFocus);
  const agentIdFocus = normalizeKey(options.agentId);
  const filteredAgents = list.filter((a) => {
    if (!agentIdFocus) return true;
    const keys = [normalizeKey(a?.id), normalizeKey(a?.name), normalizeKey(a?.email)];
    return keys.includes(agentIdFocus);
  });

  return filteredAgents.slice(0, limit).map((a, idx) => {
    const propertyMedia = selectAgentPropertyMedia(a, props, selector, { statusFocus, typeFocus });
    const agentImage = toDriveDirectUrl(a?.image) || '';
    const imageUrl = propertyMedia.coverUrl || agentImage;
    const statusTag = propertyMedia.status ? ` | ${propertyMedia.status}` : '';
    return {
      title: String(a?.bio || a?.description || 'Trusted local real estate guidance.').trim(),
      subtitle: String(a?.specialties || '').trim() + statusTag,
      agentName: String(a?.name || `Agent ${idx + 1}`).trim(),
      ctaUrl: String(a?.url || a?.profileUrl || '#').trim() || '#',
      imageUrl,
      headerImageUrl,
      logoUrl,
    };
  });
}

function propertyMatchesTemplateSelector(property, selectorInput) {
  const selector = normalizeTemplateSelector(selectorInput) || 'for-sale';
  const status = normalizeKey(property?.status);
  const type = normalizeKey(property?.type);
  const yearBuilt = toNumber(property?.yearBuilt);
  const price = toNumber(property?.price);
  const desc = normalizeKey(property?.description || '');
  if (selector === 'sold') return status === 'sold';
  if (selector === 'under-contract') {
    return ['pending', 'under-contract', 'undercontract', 'under contract', 'contingent', 'active-under-contract', 'activeundercontract'].includes(status);
  }
  if (selector === 'lease' || selector === 'rental') {
    return ['rental', 'lease', 'for-rent', 'forrent', 'for-lease', 'forlease'].includes(status) || type === 'rental';
  }
  if (selector === 'commercial') return type === 'commercial';
  if (selector === 'land') return type === 'land';
  if (selector === 'luxury') return price >= 1000000;
  if (selector === 'new-construction') return yearBuilt >= (new Date().getFullYear() - 2) || status === 'new-construction';
  if (selector === 'open-house') return status === 'open-house' || desc.includes('open-house') || desc.includes('open house');
  return status !== 'sold';
}

function propertyBelongsToAgent(property, agentKey) {
  const keys = [
    normalizeKey(property?.agentId),
    normalizeKey(property?.listingAgentId),
    normalizeKey(property?.buyerAgentId),
  ];
  return keys.includes(agentKey);
}

function normalizeCsvList(input) {
  const raw = Array.isArray(input) ? input.join(',') : String(input || '');
  return raw
    .split(',')
    .map((s) => normalizeKey(s))
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i && v !== 'all');
}

function selectAgentPropertyMedia(agent, properties, selector, options = {}) {
  const agentKeyCandidates = [normalizeKey(agent?.id), normalizeKey(agent?.name), normalizeKey(agent?.email)].filter(Boolean);
  const statusFocus = normalizeCsvList(options.statusFocus);
  const typeFocus = normalizeCsvList(options.typeFocus);
  const preferredSelector = selector === 'agent-social' ? 'social' : selector === 'agent-brand' ? 'for-sale' : 'default';
  const candidates = (Array.isArray(properties) ? properties : [])
    .filter((p) => agentKeyCandidates.some((key) => propertyBelongsToAgent(p, key)))
    .filter((p) => propertyMatchesTemplateSelector(p, preferredSelector))
    .filter((p) => !statusFocus.length || statusFocus.includes(normalizeKey(p?.status)))
    .filter((p) => !typeFocus.length || typeFocus.includes(normalizeKey(p?.type)))
    .sort((a, b) => extractPropertyNumber(b?.id) - extractPropertyNumber(a?.id));
  const top = candidates[0];
  if (!top) return { coverUrl: '', status: '' };
  return {
    coverUrl: resolveTemplateImageUrl(top?.image, top?.images),
    status: String(top?.status || '').trim(),
  };
}

function buildSocialCarouselRenderPlan(options = {}) {
  const selector = normalizeTemplateSelector(options.selector || 'social') || 'social';
  const targetIdRaw = String(options.targetId || '').trim();
  const limit = Math.max(1, Math.min(24, Number(options.limit || 6) || 6));
  const durationSec = Math.max(1, Math.min(20, Number(options.durationSec || 3) || 3));
  const fps = Math.max(12, Math.min(60, Number(options.fps || 30) || 30));
  const transition = String(options.transition || 'fade').trim() || 'fade';
  const outputFormat = String(options.outputFormat || 'mp4').trim() || 'mp4';
  const statusFocus = normalizeCsvList(options.statusFocus);
  const typeFocus = normalizeCsvList(options.typeFocus);

  const resolved = getResolvedTemplateEntities();
  const properties = Array.isArray(resolved?.properties) ? resolved.properties : [];
  const targetKey = normalizeKey(targetIdRaw);
  const byId = properties.find((p) => normalizeKey(p?.id) === targetKey || normalizeKey(p?.address) === targetKey);
  const fallback = properties
    .filter((p) => propertyMatchesTemplateSelector(p, selector))
    .filter((p) => !statusFocus.length || statusFocus.includes(normalizeKey(p?.status)))
    .filter((p) => !typeFocus.length || typeFocus.includes(normalizeKey(p?.type)))
    .sort((a, b) => extractPropertyNumber(b?.id) - extractPropertyNumber(a?.id))[0];
  const property = byId || fallback;
  if (!property) return { ok: false, error: 'No property found for social carousel plan.' };

  const images = [property?.image, ...(Array.isArray(property?.images) ? property.images : [])]
    .map((img) => toDriveDirectUrl(img) || img)
    .filter((img) => /^https?:\/\//i.test(String(img || '')));
  const uniqueImages = Array.from(new Set(images)).slice(0, limit);
  if (!uniqueImages.length) return { ok: false, error: 'No usable images found for the selected property.' };

  const price = toNumber(property?.price);
  const priceText = price > 0 ? `$${price.toLocaleString()}` : 'Call for price';
  const city = [String(property?.city || '').trim(), String(property?.zip || '').trim()].filter(Boolean).join(' ');
  const ctaUrl = String(property?.url || property?.listingUrl || property?.permalink || '#').trim() || '#';
  const slides = uniqueImages.map((imageUrl, idx) => ({
    index: idx + 1,
    imageUrl,
    durationSec,
    overlay: {
      title: String(property?.title || property?.address || `Listing ${idx + 1}`).trim(),
      propertyAddress: String(property?.address || '').trim(),
      city,
      price: priceText,
      beds: String(property?.bedrooms ?? '-'),
      baths: String(property?.bathrooms ?? '-'),
      sqft: property?.squareFeet ? Number(property.squareFeet).toLocaleString() : '-',
      statusLabel: String(property?.status || '').trim(),
      propertyType: String(property?.type || '-'),
      ctaUrl,
      brandName: BRAND_NAME,
    },
  }));

  return {
    ok: true,
    targetId: String(property?.id || ''),
    selector,
    outputFormat,
    transition,
    fps,
    durationSec,
    totalDurationSec: slides.length * durationSec,
    slides,
    renderHints: {
      pipeline: 'ffmpeg-or-cloud-renderer',
      notes: 'Use each slide.overlay object to place text layers over each image frame before encoding.',
    },
  };
}

function PHOTO_GEN_HTML(templateSelector, title, subtitle, ctaUrl, imageUrl, targetType) {
  const rendered = renderPhotoGenHtmlTemplate(
    templateSelector,
    { title, subtitle, ctaUrl, imageUrl },
    targetType || 'property',
  );
  return rendered.html;
}

function runSyncPhotoGenTabFromDrive() {
  return syncPhotoGenTabFromDrive({ replace: true });
}

function syncPhotoGenTabFromDrive(options = {}) {
  const replace = options.replace !== false;
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const sheet = getOrCreateSheet(ss, PHOTO_GEN_TAB_NAME);
  ensureSheetHeaders(sheet, PHOTO_GEN_HEADERS);

  const agents = readSheet(ss, 'Agents');
  const properties = readSheet(ss, 'Properties');
  const driveRows = readPhotoGenFromDrive({ agents, properties });
  const normalized = normalizePhotoGenRowsForSheet(driveRows);

  if (replace) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
  }

  if (!normalized.length) {
    setupDataEntryDropdowns();
    return { replaced: replace, importedRows: 0, totalRowsInTab: Math.max(0, sheet.getLastRow() - 1) };
  }

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, normalized.length, PHOTO_GEN_HEADERS.length).setValues(normalized);
  setupDataEntryDropdowns();

  return {
    replaced: replace,
    importedRows: normalized.length,
    totalRowsInTab: Math.max(0, sheet.getLastRow() - 1),
  };
}

function normalizePhotoGenRowsForSheet(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const dedupe = {};
  const out = [];

  list.forEach((row, idx) => {
    const targetType = normalizeTargetType(row.targetType || row.entityType || row.type);
    const targetId = String(row.targetId || row.entityId || row.id || '').trim();
    const slot = normalizeKey(row.slot || row.placement || row.imageSlot || 'primary') || 'primary';
    const templateSelector =
      normalizeTemplateSelector(row.templateSelector || row.selector || row.template || 'default') || 'default';
    const sortOrder = toNumber(row.sortOrder || row.order || row.priority || idx + 1);
    const driveFileId = extractDriveFileId(
      String(row.driveFileId || row.fileId || row.imageId || row.driveUrl || row.url || row.image || '').trim(),
    );
    const active = isPhotoRowActive(row) ? 'TRUE' : 'FALSE';
    const alt = String(row.alt || '').trim();
    const assetKind = String(row.assetKind || row.assetType || 'image').trim().toLowerCase() || 'image';
    const statusFocus = String(row.statusFocus || '').trim();
    const typeFocus = String(row.typeFocus || '').trim();
    const overlayPreset = String(row.overlayPreset || '').trim();
    const outputFormat = String(row.outputFormat || '').trim();
    const durationSec = toNumber(row.durationSec || row.slideDuration || 0);

    if (!targetType || !targetId || !driveFileId) return;
    const key = [targetType, normalizeKey(targetId), slot, templateSelector, driveFileId].join('|');
    if (dedupe[key]) return;
    dedupe[key] = true;

    out.push([
      targetType, targetId, slot, templateSelector, sortOrder, driveFileId, active, alt,
      assetKind, statusFocus, typeFocus, overlayPreset, outputFormat, durationSec || '',
    ]);
  });

  return out.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
    if (String(a[1]) !== String(b[1])) return String(a[1]) < String(b[1]) ? -1 : 1;
    return Number(a[4]) - Number(b[4]);
  });
}

/** EXPORT **/
function exportData(options = {}) {
  const includeDebug = Boolean(options.includeDebug);
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const agents = readSheet(ss, 'Agents');
  const properties = readSheet(ss, 'Properties');
  const photoGenTab = ENABLE_PHOTO_GEN_TAB ? readSheet(ss, PHOTO_GEN_TAB_NAME) : [];
  const photoGenDrive = readPhotoGenFromDrive({ agents, properties });
  // Drive rows first so deterministic selection prefers current folder-based assets.
  const photoGen = [...photoGenDrive, ...photoGenTab];
  const merged = applyPhotoGen({
    agents,
    properties,
    photoGen,
  });
  merged.properties = dedupeProperties(merged.properties);
  merged.agents = applyAgentRollupsFromProperties(merged.agents, merged.properties);
  const explicitStats = applyExplicitFolderOverrides(merged);

  return [
    {
      agents: merged.agents,
      properties: merged.properties,
      photoGen: merged.photoGen,
      debug: includeDebug
        ? {
            driveRowsFound: photoGenDrive.length,
            photoRowsTotal: photoGen.length,
            explicitAgentOverridesApplied: explicitStats.agentOverrides,
            explicitPropertyOverridesApplied: explicitStats.propertyOverrides,
            driveSnapshot: getDriveSnapshot(),
          }
        : {
            driveRowsFound: photoGenDrive.length,
            photoRowsTotal: photoGen.length,
            explicitAgentOverridesApplied: explicitStats.agentOverrides,
            explicitPropertyOverridesApplied: explicitStats.propertyOverrides,
          },
    },
  ];
}

function handleRefreshPost() {
  const payload = getExportPayload({ forceRefresh: true, includeDebug: false });
  return jsonOutput({ ok: true, rows: payload?.[0]?.properties?.length || 0 });
}

function runScheduledRefresh() {
  const payload = getExportPayload({ forceRefresh: true, includeDebug: false });
  return { ok: true, rows: payload?.[0]?.properties?.length || 0, refreshedAt: new Date().toISOString() };
}

function setupAutoRefreshEvery15Minutes() {
  return setupAutoRefreshTrigger(15);
}

function setupAutoRefreshEvery30Minutes() {
  return setupAutoRefreshTrigger(30);
}

function setupAutoRefreshHourly() {
  return setupAutoRefreshTrigger(60);
}

function setupAutoRefreshTrigger(minutes) {
  const interval = Math.max(5, Math.floor(toNumber(minutes) || 15));
  removeAutoRefreshTriggers();
  ScriptApp.newTrigger(AUTO_REFRESH_FUNCTION_NAME)
    .timeBased()
    .everyMinutes(interval)
    .create();
  return { ok: true, intervalMinutes: interval, triggerFunction: AUTO_REFRESH_FUNCTION_NAME };
}

function removeAutoRefreshTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  triggers.forEach((trigger) => {
    if (trigger.getHandlerFunction && trigger.getHandlerFunction() === AUTO_REFRESH_FUNCTION_NAME) {
      ScriptApp.deleteTrigger(trigger);
      removed += 1;
    }
  });
  return { ok: true, removed };
}

function getExportPayload(options = {}) {
  const forceRefresh = Boolean(options.forceRefresh);
  const includeDebug = Boolean(options.includeDebug);

  if (!forceRefresh && !includeDebug) {
    const cached = getCachedExportPayload();
    if (cached) return cached;

    if (SERVE_PREBUILT_JSON_ON_GET) {
      const fromDrive = readExportJsonFromDrive();
      if (fromDrive) {
        cacheExportPayload(fromDrive);
        return fromDrive;
      }
    }

    const fresh = exportData({ includeDebug: false });
    cacheExportPayload(fresh);
    return fresh;
  }

  const payload = exportData({ includeDebug });
  if (!includeDebug) {
    cacheExportPayload(payload);
    if (forceRefresh) {
      saveJsonToDrive(payload);
    }
  }
  return payload;
}

function getCachedExportPayload() {
  try {
    const raw = CacheService.getScriptCache().get(EXPORT_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Unable to parse cached export payload', err);
    return null;
  }
}

function cacheExportPayload(payload) {
  try {
    const raw = JSON.stringify(payload);
    if (raw.length > 90000) return;
    CacheService.getScriptCache().put(EXPORT_CACHE_KEY, raw, EXPORT_CACHE_TTL_SECONDS);
  } catch (err) {
    console.error('Unable to cache export payload', err);
  }
}

function readExportJsonFromDrive() {
  try {
    const file = getLatestFileByName(EXPORT_JSON_FILENAME);
    if (!file) return null;
    const text = file.getBlob().getDataAsString();
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    console.error('Unable to read export JSON from Drive', err);
    return null;
  }
}

function getLatestFileByName(name) {
  const files = DriveApp.getFilesByName(name);
  let latest = null;
  let latestTime = 0;
  while (files.hasNext()) {
    const file = files.next();
    const t = file.getLastUpdated().getTime();
    if (!latest || t > latestTime) {
      latest = file;
      latestTime = t;
    }
  }
  return latest;
}

function dedupeProperties(properties) {
  const input = Array.isArray(properties) ? properties : [];
  const seen = {};
  const out = [];
  for (let i = input.length - 1; i >= 0; i -= 1) {
    const p = input[i] || {};
    const idKey = normalizeKey(p.id);
    const addrKey = normalizeKey(p.address);
    const key = idKey ? `id:${idKey}` : `addr:${addrKey}`;
    if (!key || key === 'addr:') {
      out.push(p);
      continue;
    }
    if (seen[key]) continue;
    seen[key] = true;
    out.push(p);
  }
  return out.reverse();
}

function setupDataEntryDropdowns() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const applied = [];

  Object.keys(DROPDOWN_CONFIG).forEach((sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const headerMap = getHeaderMap(sheet);
    const rules = DROPDOWN_CONFIG[sheetName];

    Object.keys(rules).forEach((headerName) => {
      const col = headerMap[normalizeKey(headerName)];
      if (!col) return;
      const options = rules[headerName];
      applyDropdownValidation(sheet, col, options);
      applied.push({ sheet: sheetName, column: headerName, optionsCount: options.length });
    });
  });

  const dynamicApplied = applyDynamicPropertyValidations(ss);
  return { appliedCount: applied.length + dynamicApplied.length, applied: [...applied, ...dynamicApplied] };
}

function getHeaderMap(sheet) {
  const lastCol = sheet.getLastColumn();
  if (!lastCol) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0] || [];
  const map = {};
  headers.forEach((h, idx) => {
    const key = normalizeKey(h);
    if (key) map[key] = idx + 1;
  });
  return map;
}

function applyDropdownValidation(sheet, column, options) {
  const maxRows = Math.max(sheet.getMaxRows(), 2000);
  const rowCount = Math.max(1, maxRows - 1);
  const range = sheet.getRange(2, column, rowCount, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(true)
    .build();
  range.setDataValidation(rule);
}

function applyDynamicPropertyValidations(ss) {
  const spreadsheet = ss || SpreadsheetApp.openById(MASTER_SHEET_ID);
  const applied = [];
  const propertiesSheet = spreadsheet.getSheetByName('Properties');
  const agentsSheet = spreadsheet.getSheetByName('Agents');
  if (!propertiesSheet) return applied;

  const pHeaders = getHeaderMap(propertiesSheet);
  const aHeaders = agentsSheet ? getHeaderMap(agentsSheet) : {};

  const agentIds = agentsSheet ? getColumnValuesByHeader(agentsSheet, aHeaders, 'id') : [];
  ['agentId', 'listingAgentId', 'buyerAgentId'].forEach((field) => {
    const col = pHeaders[normalizeKey(field)];
    if (!col || !agentIds.length) return;
    applyDropdownValidation(propertiesSheet, col, agentIds);
    applied.push({ sheet: 'Properties', column: field, optionsCount: agentIds.length });
  });

  applyNumberValidationByHeader(propertiesSheet, pHeaders, 'zip', 10000, 99999, true, applied);
  const yearBuiltCol = pHeaders[normalizeKey('yearBuilt')];
  if (yearBuiltCol) {
    const years = buildYearBuiltOptions(1900, new Date().getFullYear() + 2);
    applyDropdownValidation(propertiesSheet, yearBuiltCol, years);
    applied.push({ sheet: 'Properties', column: 'yearBuilt', optionsCount: years.length });
  }

  return applied;
}

function buildYearBuiltOptions(startYear, endYear) {
  const out = [];
  for (let y = endYear; y >= startYear; y -= 1) {
    out.push(String(y));
  }
  return out;
}

function applyNumberValidationByHeader(sheet, headerMap, headerName, min, max, wholeNumber, applied) {
  const col = headerMap[normalizeKey(headerName)];
  if (!col) return;
  const maxRows = Math.max(sheet.getMaxRows(), 2000);
  const rowCount = Math.max(1, maxRows - 1);
  const range = sheet.getRange(2, col, rowCount, 1);
  let ruleBuilder = SpreadsheetApp.newDataValidation().setAllowInvalid(true);
  ruleBuilder = wholeNumber
    ? ruleBuilder.requireNumberBetween(min, max)
    : ruleBuilder.requireNumberBetween(min, max);
  range.setDataValidation(ruleBuilder.build());
  applied.push({ sheet: sheet.getName(), column: headerName, optionsCount: 0, validation: `number ${min}-${max}` });
}

function getColumnValuesByHeader(sheet, headerMap, headerName) {
  const col = headerMap[normalizeKey(headerName)];
  if (!col) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, col, lastRow - 1, 1).getValues().flat();
  return Array.from(new Set(values.map((v) => String(v || '').trim()).filter(Boolean)));
}

function applyAgentRollupsFromProperties(agents, properties) {
  const rollups = {};
  (properties || []).forEach((property) => {
    const key = normalizeKey(property?.agentId);
    if (!key) return;
    if (!rollups[key]) rollups[key] = { count: 0, sum: 0, priced: 0 };
    rollups[key].count += 1;
    const price = toNumber(property?.price);
    if (price > 0) {
      rollups[key].sum += price;
      rollups[key].priced += 1;
    }
  });

  return (agents || []).map((agent) => {
    const key = normalizeKey(agent?.id || agent?.name);
    const stats = rollups[key] || { count: 0, sum: 0, priced: 0 };
    const avg = stats.priced > 0 ? stats.sum / stats.priced : 0;
    return {
      ...agent,
      numberofproperties: stats.count,
      averageprice: formatCompactPrice(avg),
    };
  });
}

function formatCompactPrice(value) {
  const n = toNumber(value);
  if (!n) return '0';
  if (n >= 1000000) {
    const m = (n / 1000000).toFixed(1);
    return (m.endsWith('.0') ? m.slice(0, -2) : m) + 'M';
  }
  if (n >= 1000) return String(Math.round(n / 1000)) + 'k';
  return String(Math.round(n));
}

function syncAgentRollupsToSheet() {
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const agentsSheet = ss.getSheetByName('Agents');
  const properties = readSheet(ss, 'Properties');
  if (!agentsSheet) return { updatedRows: 0 };

  const headerMap = getHeaderMap(agentsSheet);
  const idCol = headerMap[normalizeKey('id')];
  const numberCol = headerMap[normalizeKey('numberofproperties')];
  const averageCol = headerMap[normalizeKey('averageprice')];
  if (!idCol || !numberCol || !averageCol) {
    return { updatedRows: 0, warning: 'Agents sheet missing id/numberofproperties/averageprice headers' };
  }

  const lastRow = agentsSheet.getLastRow();
  if (lastRow < 2) return { updatedRows: 0 };
  const ids = agentsSheet.getRange(2, idCol, lastRow - 1, 1).getValues().flat();
  const rollups = {};
  properties.forEach((property) => {
    const key = normalizeKey(property?.agentId);
    if (!key) return;
    if (!rollups[key]) rollups[key] = { count: 0, sum: 0, priced: 0 };
    rollups[key].count += 1;
    const price = toNumber(property?.price);
    if (price > 0) {
      rollups[key].sum += price;
      rollups[key].priced += 1;
    }
  });

  const counts = [];
  const avgs = [];
  ids.forEach((rawId) => {
    const key = normalizeKey(rawId);
    const stats = rollups[key] || { count: 0, sum: 0, priced: 0 };
    const avg = stats.priced > 0 ? stats.sum / stats.priced : 0;
    counts.push([stats.count]);
    avgs.push([formatCompactPrice(avg)]);
  });

  agentsSheet.getRange(2, numberCol, counts.length, 1).setValues(counts);
  agentsSheet.getRange(2, averageCol, avgs.length, 1).setValues(avgs);
  return { updatedRows: counts.length };
}

function seedSampleProperties(countInput) {
  const count = Math.max(1, Math.min(200, Math.floor(toNumber(countInput) || 20)));
  const ss = SpreadsheetApp.openById(MASTER_SHEET_ID);
  const propertiesSheet = ss.getSheetByName('Properties');
  if (!propertiesSheet) return { added: 0, warning: 'Properties sheet not found' };

  const agents = readSheet(ss, 'Agents');
  const properties = readSheet(ss, 'Properties');
  const headers = propertiesSheet.getRange(1, 1, 1, propertiesSheet.getLastColumn()).getValues()[0] || [];

  const nextNum = getNextPropertyNumber(properties);
  const generated = [];
  for (let i = 0; i < count; i += 1) {
    const idNum = nextNum + i;
    const property = generatePropertyRecord(idNum, agents);
    generated.push(headers.map((h) => serializeSheetValue(property[h])));
  }

  if (generated.length) {
    propertiesSheet.getRange(propertiesSheet.getLastRow() + 1, 1, generated.length, headers.length).setValues(generated);
  }

  const rollupResult = syncAgentRollupsToSheet();
  return {
    added: generated.length,
    startId: `property-${nextNum}`,
    endId: `property-${nextNum + generated.length - 1}`,
    rollupsUpdated: rollupResult?.updatedRows || 0,
  };
}

function runSeed20Properties() {
  return seedSampleProperties(20);
}

function generatePropertyRecord(idNum, agents) {
  const typePool = ['House', 'Single Family', 'Condo', 'Apartment', 'Commercial'];
  const type = sample(typePool);
  const cityMeta = sample([
    { city: 'Waco', zips: ['76701', '76706', '76708'], lat: 31.5493, lng: -97.1467 },
    { city: 'Austin', zips: ['78701', '78704', '78745'], lat: 30.2672, lng: -97.7431 },
    { city: 'Dallas', zips: ['75201', '75204', '75214'], lat: 32.7767, lng: -96.797 },
    { city: 'Houston', zips: ['77002', '77007', '77024'], lat: 29.7604, lng: -95.3698 },
  ]);

  const status = weightedSample([
    { value: 'For Sale', w: 0.72 },
    { value: 'Pending', w: 0.18 },
    { value: 'Sold', w: 0.10 },
  ]);

  const addressNum = randomInt(100, 8999);
  const street = sample(['Oak', 'Maple', 'Cedar', 'Lakeview', 'Park', 'Briar', 'Willow', 'Magnolia', 'Pecan']);
  const suffix = sample(['St', 'Ave', 'Dr', 'Ln', 'Ct', 'Way']);
  const address = `${addressNum} ${street} ${suffix}`;
  const zip = sample(cityMeta.zips);

  const agent = chooseAgentForType(agents, type);
  const agentId = String(agent?.id || '');
  const listingAgentId = agentId;
  const buyerAgentId = status === 'Sold' ? String(sample(agents)?.id || agentId) : '';

  const isCommercial = type === 'Commercial';
  const basePrice = isCommercial ? randomInt(280000, 2200000) : randomInt(180000, 980000);
  const bedrooms = isCommercial ? 0 : randomInt(1, 6);
  const bathrooms = isCommercial ? 1 : randomHalfStep(1, 5.5);
  const squareFeet = isCommercial ? randomInt(1400, 12000) : randomInt(700, 5200);
  const yearBuilt = randomInt(1950, new Date().getFullYear() + 1);
  const lotSize = round2(randomFloat(0.08, isCommercial ? 3.5 : 0.9));
  const listedDaysAgo = randomInt(2, 95);

  const soldDate = status === 'Sold'
    ? Utilities.formatDate(new Date(Date.now() - randomInt(5, 220) * 24 * 3600 * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : '';

  const interior = isCommercial
    ? ['Open Floorplan', 'Conference Room', 'Reception Area']
    : sampleMany(['Walk-In Closet', 'Granite Counters', 'Fireplace', 'Island Kitchen', 'Hardwood Floors'], 2, 4);
  const exterior = isCommercial
    ? ['Corner Lot', 'Large Parking Area']
    : sampleMany(['Covered Patio', 'Fenced Yard', 'Sprinkler System', 'Pool', 'Storage Shed'], 1, 3);
  const energy = sampleMany(['Low-E Windows', 'Ceiling Fans', 'Programmable Thermostat', 'Solar Panels'], 1, 2);

  return {
    id: `property-${idNum}`,
    agentId,
    address,
    city: cityMeta.city,
    zip,
    price: basePrice,
    status,
    soldDate,
    listingAgentId,
    buyerAgentId,
    bedrooms,
    bathrooms,
    type,
    squareFeet,
    yearBuilt,
    lotSize,
    garage: isCommercial ? 'None' : sample(['1 Car', '2 Car', '3 Car', 'Attached', 'Detached']),
    hoaFees: isCommercial ? 0 : randomInt(0, 240),
    schoolDistrict: cityMeta.city === 'Waco' ? sample(['Waco ISD', 'Midway ISD']) : `${cityMeta.city} ISD`,
    heating: sample(['Central', 'Electric', 'Gas']),
    cooling: sample(['Central Air', 'Electric']),
    flooring: sample(['Tile', 'Hardwood', 'Laminate', 'Vinyl', 'Carpet', 'Mixed']),
    roof: sample(['Shingle', 'Metal', 'Tile']),
    exterior: sample(['Brick', 'Stucco', 'Wood', 'Stone', 'Siding']),
    interiorFeatures: interior.join(', '),
    exteriorFeatures: exterior.join(', '),
    energyFeatures: energy.join(', '),
    image: '',
    listedDaysAgo,
    lat: round6(cityMeta.lat + randomFloat(-0.08, 0.08)),
    lng: round6(cityMeta.lng + randomFloat(-0.08, 0.08)),
    images: '',
    description: buildDescription(type, cityMeta.city, squareFeet, bedrooms, bathrooms),
  };
}

function chooseAgentForType(agents, propertyType) {
  const all = Array.isArray(agents) ? agents.filter((a) => a && a.id) : [];
  if (!all.length) return null;
  const wantsCommercial = propertyType === 'Commercial';
  const matches = all.filter((agent) => {
    const specs = Array.isArray(agent.specialties)
      ? agent.specialties.map((s) => normalizeKey(s))
      : [normalizeKey(agent.specialties)];
    if (wantsCommercial) return specs.includes('commercial');
    return specs.includes('residential') || specs.includes('luxury') || specs.includes('first-time-buyers');
  });
  return sample(matches.length ? matches : all);
}

function buildDescription(type, city, sqft, beds, baths) {
  if (type === 'Commercial') {
    return `Commercial opportunity in ${city} featuring approx. ${Number(sqft).toLocaleString()} sqft with flexible layout and strong visibility.`;
  }
  return `${type} in ${city} with ${beds} bedrooms, ${baths} bathrooms, and approx. ${Number(sqft).toLocaleString()} sqft. Move-in ready and priced to sell.`;
}

function getNextPropertyNumber(existingProperties) {
  let maxNum = 0;
  (existingProperties || []).forEach((p) => {
    const id = String(p?.id || '');
    const m = id.match(/property-(\d+)/i);
    if (m) maxNum = Math.max(maxNum, Number(m[1]) || 0);
  });
  return maxNum + 1;
}

function serializeSheetValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value === null || value === undefined ? '' : value;
}

function sample(list) {
  if (!list || !list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function sampleMany(list, min, max) {
  const count = randomInt(min, max);
  const copy = [...list];
  const out = [];
  while (copy.length && out.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function weightedSample(weighted) {
  const total = weighted.reduce((sum, x) => sum + x.w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weighted.length; i += 1) {
    r -= weighted[i].w;
    if (r <= 0) return weighted[i].value;
  }
  return weighted[weighted.length - 1].value;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomHalfStep(min, max) {
  const lo = Math.round(min * 2);
  const hi = Math.round(max * 2);
  return randomInt(lo, hi) / 2;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function round6(n) {
  return Math.round(n * 1000000) / 1000000;
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

function applyPhotoGen(payload) {
  const agents = (payload.agents || []).map((a, idx) => ({
    ...a,
    id: normalizeEntityId(a?.id, a?.name, `agent-${idx + 1}`),
  }));
  const properties = (payload.properties || []).map((p, idx) => ({
    ...p,
    id: normalizeEntityId(p?.id, p?.address, `property-${idx + 1}`),
    agentId: p?.agentId ? normalizeEntityId(p.agentId, '', '') : p?.agentId,
    listingAgentId: p?.listingAgentId ? normalizeEntityId(p.listingAgentId, '', '') : p?.listingAgentId,
    buyerAgentId: p?.buyerAgentId ? normalizeEntityId(p.buyerAgentId, '', '') : p?.buyerAgentId,
  }));
  const rows = payload.photoGen || [];

  const byTarget = rows.reduce((acc, row, idx) => {
    if (!isPhotoRowActive(row)) return acc;

    const targetType = normalizeTargetType(row.targetType || row.entityType || row.type);
    const targetId = String(row.targetId || row.entityId || row.id || '').trim();
    const image = toDriveDirectUrl(row.driveFileId || row.fileId || row.imageId || row.driveUrl || row.url || row.image);
    if (!targetType || !targetId || !image) return acc;

    const rowsToPush = {
      image,
      slot: normalizeKey(row.slot || row.placement || row.imageSlot || 'primary'),
      template: normalizeTemplateSelector(row.templateSelector || row.selector || row.template || 'default'),
      sortOrder: toNumber(row.sortOrder || row.order || row.priority || idx),
      alt: row.alt || '',
    };

    const keys = Array.from(
      new Set([
        `${targetType}:${targetId.toLowerCase()}`,
        `${targetType}:${normalizeKey(targetId)}`,
      ].filter((k) => !k.endsWith(':'))),
    );
    keys.forEach((bucketKey) => {
      if (!acc[bucketKey]) acc[bucketKey] = [];
      acc[bucketKey].push(rowsToPush);
    });
    return acc;
  }, {});

  properties.forEach((property) => {
    const propKeys = [
      `property:${String(property.id || '').toLowerCase()}`,
      `property:${normalizeKey(property.id)}`,
      `property:${normalizeKey(property.address)}`,
    ];
    const targetRows = propKeys.flatMap((k) => byTarget[k] || []);
    if (!targetRows.length) {
      // Normalize existing image fields in case they still contain share links.
      property.image = toDriveDirectUrl(property.image) || property.image;
      if (Array.isArray(property.images)) {
        property.images = property.images.map((img) => toDriveDirectUrl(img) || img);
      }
      return;
    }
    const selected = selectTemplateRows(
      targetRows,
      normalizeTemplateSelector(property.photoTemplate || property.templateSelector || property.imageTemplate || ''),
    );
    hydrateEntityImages(property, selected);
  });

  agents.forEach((agent) => {
    const agentKeys = [
      String(agent.id || '').toLowerCase(),
      normalizeKey(agent.id),
      normalizeKey(agent.name),
      normalizeKey(agent.email),
      normalizeKey(agent.lic),
    ].filter(Boolean);
    const targetRows = agentKeys.flatMap((k) => byTarget[`agent:${k}`] || []);
    if (!targetRows.length) {
      agent.image = toDriveDirectUrl(agent.image) || agent.image;
      return;
    }
    const selected = selectTemplateRows(
      targetRows,
      normalizeTemplateSelector(agent.photoTemplate || agent.templateSelector || agent.imageTemplate || ''),
    );
    hydrateEntityImages(agent, selected);
  });

  // Hard fallback defaults so UI never renders blank when Drive lookup fails.
  agents.forEach((agent) => {
    if (!String(agent.image || '').trim()) agent.image = 'agents.jpg';
  });
  properties.forEach((property) => {
    if (!String(property.image || '').trim()) property.image = 'placeholder.jpg';
    if (!Array.isArray(property.images) || !property.images.length) {
      property.images = [property.image];
    }
  });

  return { agents, properties, photoGen: rows };
}

function readPhotoGenFromDrive(context = {}) {
  if (!PHOTO_LIBRARY_ROOT_FOLDER_ID) return [];

  let root = null;
  try {
    root = DriveApp.getFolderById(PHOTO_LIBRARY_ROOT_FOLDER_ID);
  } catch (err) {
    console.error('Invalid PHOTO_LIBRARY_ROOT_FOLDER_ID', err);
    return [];
  }

  const agentResolver = buildFolderResolver(context.agents || [], 'agent');
  const propertyResolver = buildFolderResolver(context.properties || [], 'property');
  const rows = [];
  const propertyStart = rows.length;
  scanTargetTypeFolder(root, ['properties', 'property'], 'property', propertyResolver, rows);
  const propertyFound = rows.length - propertyStart;

  const agentStart = rows.length;
  scanTargetTypeFolder(root, ['realtors', 'realtor', 'agents', 'agent'], 'agent', agentResolver, rows);
  const agentFound = rows.length - agentStart;

  // Fallback mode: scan entire root tree if expected folder names were not matched.
  if (propertyFound === 0) {
    scanEntireRootForTarget(root, 'property', propertyResolver, rows);
  }
  if (agentFound === 0) {
    scanEntireRootForTarget(root, 'agent', agentResolver, rows);
  }

  scanExplicitFolders('agent', agentResolver, EXPLICIT_AGENT_FOLDERS, rows);
  scanExplicitFolders('property', propertyResolver, EXPLICIT_PROPERTY_FOLDERS, rows);

  return rows;
}

function scanTargetTypeFolder(root, folderNames, targetType, resolver, rowsOut) {
  const base = findChildFolderByNames(root, folderNames);
  if (!base) return;
  findAndReadEntityFolders({
    folder: base,
    targetType,
    resolver,
    rowsOut,
    depth: 0,
    maxDepth: 4,
  });
}

function scanEntireRootForTarget(root, targetType, resolver, rowsOut) {
  findAndReadEntityFolders({
    folder: root,
    targetType,
    resolver,
    rowsOut,
    depth: 0,
    maxDepth: 6,
  });
}

function scanExplicitFolders(targetType, resolver, mappings, rowsOut) {
  const list = Array.isArray(mappings) ? mappings : [];
  list.forEach((item) => {
    const folderId = String(item?.folderId || '').trim();
    if (!folderId) return;

    let folder = null;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (err) {
      console.error(`Invalid explicit ${targetType} folder ID: ${folderId}`, err);
      return;
    }

    const key = String(item?.key || folder.getName() || '').trim();
    const targetId = String(item?.targetId || '').trim() || resolveTargetId(key, resolver) || normalizeKey(key);
    if (!targetId) return;

    readEntityFolderImages({
      folder,
      targetType,
      targetId,
      currentTemplate: 'default',
      rowsOut,
    });
  });
}

function findChildFolderByNames(parent, candidateNames) {
  const expected = (candidateNames || []).map((name) => normalizeKey(name)).filter(Boolean);
  if (!expected.length) return null;

  const folders = parent.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    const key = normalizeKey(folder.getName());
    if (expected.includes(key)) return folder;
  }
  return null;
}

function findAndReadEntityFolders(ctx) {
  const { folder, targetType, resolver, rowsOut, depth, maxDepth } = ctx;
  if (depth > maxDepth) return;

  const children = folder.getFolders();
  while (children.hasNext()) {
    const child = children.next();
    const folderName = String(child.getName() || '').trim();
    if (!folderName) continue;

    const targetId = resolveTargetId(folderName, resolver);
    if (targetId) {
      readEntityFolderImages({
        folder: child,
        targetType,
        targetId,
        currentTemplate: 'default',
        rowsOut,
      });
      continue;
    }

    findAndReadEntityFolders({
      folder: child,
      targetType,
      resolver,
      rowsOut,
      depth: depth + 1,
      maxDepth,
    });
  }
}

function readEntityFolderImages(ctx) {
  const { folder, targetType, targetId, currentTemplate, rowsOut } = ctx;

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName() || '';
    if (!isImageFile(name, file.getMimeType())) continue;

    const meta = inferImageMetaFromName(name);
    rowsOut.push({
      targetType,
      targetId,
      slot: meta.slot,
      templateSelector: currentTemplate || 'default',
      sortOrder: meta.sortOrder,
      driveFileId: file.getId(),
      active: true,
      alt: removeFileExt(name),
    });
  }

  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const sub = subfolders.next();
    const nextTemplate =
      normalizeTemplateFolderName(sub.getName()) || currentTemplate || 'default';
    readEntityFolderImages({
      folder: sub,
      targetType,
      targetId,
      currentTemplate: nextTemplate,
      rowsOut,
    });
  }
}

function isImageFile(fileName, mimeType) {
  const mime = String(mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  const lower = String(fileName || '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].some((ext) => lower.endsWith(ext));
}

function inferImageMetaFromName(fileName) {
  const base = removeFileExt(fileName).toLowerCase();
  const imageNumberMatch = base.match(/image[-_ ]?(\d{1,4})/);
  const imageNumber = imageNumberMatch ? Number(imageNumberMatch[1]) : null;

  let slot = 'gallery';
  if (/(^|[-_ ])(primary|cover|hero)([-_ ]|$)/.test(base) || imageNumber === 1) slot = 'primary';
  else if (/(^|[-_ ])(detail|photo|gallery)([-_ ]|$)/.test(base)) slot = 'gallery';

  const orderMatch = base.match(/(^|[-_ ])(\d{1,4})([-_ ]|$)/);
  const sortOrder = imageNumber || (orderMatch ? Number(orderMatch[2]) : 9999);

  return { slot, sortOrder };
}

function removeFileExt(name) {
  return String(name || '').replace(/\.[^.]+$/, '');
}

function normalizeTemplateFolderName(name) {
  const key = normalizeTemplateSelector(name);
  if (!key) return '';

  // These are content buckets, not template selectors.
  const neutral = ['property-photos', 'photos', 'images', 'gallery', 'media'];
  if (neutral.includes(key)) return '';
  return key;
}

function normalizeTemplateSelector(value) {
  const key = normalizeKey(value);
  if (!key) return '';
  if (key === 'default') return 'for-sale-card';
  if (key === 'bio' || key === 'bio-card') return 'agent-card';
  if (key === 'agentprofile') return 'agent-card';
  if (key === 'branded-for-sale') return 'for-sale';
  if (key === 'branded-under-contract') return 'under-contract';
  if (key === 'branded-sold') return 'sold';
  if (key === 'branded-lease') return 'lease';
  if (key === 'branded-bio') return 'agent-card';
  return key;
}

function buildFolderResolver(records, targetType) {
  const map = {};

  records.forEach((record) => {
    const id = String(record?.id || '').trim();
    if (!id) return;

    addResolverKey(map, id, id);

    if (targetType === 'agent') {
      addResolverKey(map, record?.name, id);
      addResolverKey(map, record?.email, id);
      addResolverKey(map, record?.lic, id);
      return;
    }

    if (targetType === 'property') {
      addResolverKey(map, record?.address, id);
      addResolverKey(map, record?.mls, id);
      addResolverKey(map, record?.apn, id);
    }
  });

  return map;
}

function resolveTargetId(folderName, resolverMap) {
  const key = normalizeKey(folderName);
  if (!key) return '';
  if (resolverMap[key]) return resolverMap[key];

  // Lenient match for folders like "agent-1-jane-smith" or "jane-smith-team".
  let bestId = '';
  let bestKeyLen = 0;
  const keys = Object.keys(resolverMap);
  for (let i = 0; i < keys.length; i += 1) {
    const candidate = keys[i];
    if (!candidate) continue;
    const isPrefix = key.startsWith(`${candidate}-`) || key.startsWith(`${candidate}_`);
    const isContains = key.includes(candidate) || candidate.includes(key);
    if ((isPrefix || isContains) && candidate.length > bestKeyLen) {
      bestKeyLen = candidate.length;
      bestId = resolverMap[candidate];
    }
  }
  return bestId;
}

function addResolverKey(map, rawValue, id) {
  const key = normalizeKey(rawValue);
  if (!key || !id) return;
  if (!map[key]) map[key] = id;
}

function applyExplicitFolderOverrides(payload) {
  const stats = { agentOverrides: 0, propertyOverrides: 0 };
  const agents = payload?.agents || [];
  const properties = payload?.properties || [];

  EXPLICIT_AGENT_FOLDERS.forEach((item) => {
    const folderId = String(item?.folderId || '').trim();
    if (!folderId) return;
    const key = normalizeKey(item?.targetId || item?.key || '');
    if (!key) return;
    const imageUrl = getFirstImageFromFolder(folderId);
    if (!imageUrl) return;

    agents.forEach((agent) => {
      const agentKeys = [
        normalizeKey(agent.id),
        normalizeKey(agent.name),
        normalizeKey(agent.email),
        normalizeKey(agent.lic),
      ];
      if (agentKeys.includes(key)) {
        agent.image = imageUrl;
        stats.agentOverrides += 1;
      }
    });
  });

  EXPLICIT_PROPERTY_FOLDERS.forEach((item) => {
    const folderId = String(item?.folderId || '').trim();
    if (!folderId) return;
    const key = normalizeKey(item?.targetId || item?.key || '');
    if (!key) return;
    const imageUrl = getFirstImageFromFolder(folderId);
    if (!imageUrl) return;

    properties.forEach((property) => {
      const propKeys = [
        normalizeKey(property.id),
        normalizeKey(property.address),
        normalizeKey(property.mls),
      ];
      if (propKeys.includes(key)) {
        property.image = imageUrl;
        if (!Array.isArray(property.images) || !property.images.length) {
          property.images = [imageUrl];
        }
        stats.propertyOverrides += 1;
      }
    });
  });

  return stats;
}

function getFirstImageFromFolder(folderId) {
  let folder = null;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (err) {
    console.error(`Cannot access explicit folder: ${folderId}`, err);
    return '';
  }

  const foundUrl = findFirstImageUrlRecursively(folder, 0, 6);
  return foundUrl || '';
}

function findFirstImageUrlRecursively(folder, depth, maxDepth) {
  if (depth > maxDepth) return null;

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const url = toImageUrlFromFile(file);
    if (url) {
      return url;
    }
  }

  const subs = folder.getFolders();
  while (subs.hasNext()) {
    const sub = subs.next();
    const found = findFirstImageUrlRecursively(sub, depth + 1, maxDepth);
    if (found) return found;
  }
  return null;
}

function toImageUrlFromFile(file) {
  if (!file) return '';

  const name = file.getName() || '';
  const mime = file.getMimeType() || '';
  if (isImageFile(name, mime)) {
    return toDriveDirectUrl(file.getId());
  }

  // Support Drive shortcuts that point to image files.
  if (String(mime).toLowerCase() === 'application/vnd.google-apps.shortcut') {
    try {
      if (typeof file.getTargetId === 'function') {
        const targetId = file.getTargetId();
        if (!targetId) return '';
        const target = DriveApp.getFileById(targetId);
        const targetName = target.getName() || '';
        const targetMime = target.getMimeType() || '';
        if (isImageFile(targetName, targetMime)) {
          return toDriveDirectUrl(target.getId());
        }
      }
    } catch (err) {
      console.error('Unable to resolve shortcut target', err);
      return '';
    }
  }

  return '';
}

function getDriveSnapshot() {
  if (!PHOTO_LIBRARY_ROOT_FOLDER_ID) {
    return { enabled: false, reason: 'PHOTO_LIBRARY_ROOT_FOLDER_ID is empty' };
  }

  try {
    const root = DriveApp.getFolderById(PHOTO_LIBRARY_ROOT_FOLDER_ID);
    const top = listFolderNames(root, 30);
    const realtorsFolder =
      findChildFolderByNames(root, ['realtors', 'realtor', 'agents', 'agent']) || null;
    const propertiesFolder =
      findChildFolderByNames(root, ['properties', 'property']) || null;

    const realtorChildren = realtorsFolder ? listFolderNames(realtorsFolder, 30) : [];
    const propertyChildren = propertiesFolder ? listFolderNames(propertiesFolder, 30) : [];

    return {
      enabled: true,
      rootName: root.getName(),
      topLevelFolders: top,
      hasRealtorsFolder: Boolean(realtorsFolder),
      hasPropertiesFolder: Boolean(propertiesFolder),
      realtorsChildFolders: realtorChildren,
      propertiesChildFolders: propertyChildren,
    };
  } catch (err) {
    return {
      enabled: true,
      error: String(err && err.message ? err.message : err),
    };
  }
}

function listFolderNames(folder, limit) {
  const out = [];
  const iter = folder.getFolders();
  while (iter.hasNext() && out.length < limit) {
    out.push(iter.next().getName());
  }
  return out;
}

function hydrateEntityImages(entity, rows) {
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary =
    sorted.find((row) => row.slot === 'primary' || row.slot === 'cover' || row.slot === 'hero') ||
    sorted[0];

  if (primary?.image) {
    entity.image = primary.image;
  } else if (entity.image) {
    entity.image = toDriveDirectUrl(entity.image) || entity.image;
  }

  const gallery = sorted
    .filter((row) => row.slot === 'gallery' || row.slot === 'photo' || row.slot === 'detail')
    .map((row) => row.image);

  const mergedGallery = [...(Array.isArray(entity.images) ? entity.images : []), ...gallery]
    .map((img) => toDriveDirectUrl(img) || img)
    .filter(Boolean);

  if (mergedGallery.length) {
    entity.images = Array.from(new Set(mergedGallery));
  }
}

function selectTemplateRows(rows, selector) {
  if (!rows.length) return [];

  // Deterministic selection order:
  // 1) exact selector match
  // 2) "default"
  // 3) all rows (fallback)
  if (selector) {
    const exact = rows.filter((row) => row.template === selector);
    if (exact.length) return exact;
  }

  const defaults = rows.filter((row) => row.template === 'default');
  if (defaults.length) return defaults;
  return rows;
}

function normalizeTargetType(value) {
  const type = normalizeKey(value);
  if (type === 'realtor') return 'agent';
  if (type === 'property') return 'property';
  if (type === 'agent') return 'agent';
  return '';
}

function isPhotoRowActive(row) {
  const raw = String(row.active ?? row.enabled ?? row.isActive ?? 'true').trim().toLowerCase();
  return !['false', '0', 'no', 'n', 'off'].includes(raw);
}

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeEntityId(idValue, nameFallback, hardFallback) {
  const id = String(idValue || '').trim();
  if (id) return id;
  const byName = normalizeKey(nameFallback);
  if (byName) return byName;
  return hardFallback || '';
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toDriveDirectUrl(value) {
  const input = String(value || '').trim();
  if (!input) return '';

  const maybeId = extractDriveFileId(input);
  if (maybeId) {
    return `https://lh3.googleusercontent.com/d/${maybeId}=w2000`;
  }
  return input;
}

function extractDriveFileId(input) {
  if (!input) return '';

  // If value already looks like an ID (common 25+ char Drive IDs), accept it.
  if (/^[a-zA-Z0-9_-]{20,}$/.test(input) && !/^https?:\/\//i.test(input)) {
    return input;
  }

  const patterns = [
    /\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]{20,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
  ];

  for (let i = 0; i < patterns.length; i += 1) {
    const match = input.match(patterns[i]);
    if (match && match[1]) return match[1];
  }
  return '';
}

function saveJsonToDrive(payload) {
  const data = payload || exportData({ includeDebug: false });
  const json = JSON.stringify(data, null, 2);
  const latest = getLatestFileByName(EXPORT_JSON_FILENAME);
  if (latest) {
    latest.setContent(json);
    return latest.getId();
  }
  const created = DriveApp.createFile(EXPORT_JSON_FILENAME, json, MimeType.PLAIN_TEXT);
  return created.getId();
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

function getBrandLogoUrl() {
  // Use a web-accessible absolute URL for Apps Script rendered HTML.
  const propValue = String(PropertiesService.getScriptProperties().getProperty('BRAND_LOGO_URL') || '').trim();
  if (propValue) return toDriveDirectUrl(propValue) || propValue;
  return 'https://via.placeholder.com/320x120?text=44+Realty';
}

function getBrandHeaderImageUrl() {
  const propValue = String(PropertiesService.getScriptProperties().getProperty('BRAND_HEADER_IMAGE_URL') || '').trim();
  if (propValue) return toDriveDirectUrl(propValue) || propValue;
  return 'https://via.placeholder.com/1280x220?text=Header+Image';
}

function getBrandTextureUrl() {
  const props = PropertiesService.getScriptProperties();
  const propValue = String(props.getProperty('BRAND_TEXTURE_URL') || '').trim();
  if (propValue) return toDriveDirectUrl(propValue) || propValue;

  try {
    const latest = getLatestFileByName('grass.jpg');
    if (latest) return toDriveDirectUrl(latest.getId());
  } catch (err) {
    console.error('Unable to resolve grass.jpg from Drive', err);
  }

  return 'https://via.placeholder.com/1200x800/eaf0e4/8fa182?text=Texture';
}

function setBrandTextureUrl(urlOrDriveId) {
  const value = String(urlOrDriveId || '').trim();
  if (!value) return { ok: false, error: 'Missing texture URL or Drive file ID' };
  PropertiesService.getScriptProperties().setProperty('BRAND_TEXTURE_URL', value);
  return { ok: true, textureUrl: getBrandTextureUrl() };
}

function setBrandLogoUrl(urlOrDriveId) {
  const value = String(urlOrDriveId || '').trim();
  if (!value) return { ok: false, error: 'Missing logo URL or Drive file ID' };
  PropertiesService.getScriptProperties().setProperty('BRAND_LOGO_URL', value);
  return { ok: true, logoUrl: getBrandLogoUrl() };
}

function setBrandHeaderImageUrl(urlOrDriveId) {
  const value = String(urlOrDriveId || '').trim();
  if (!value) return { ok: false, error: 'Missing header image URL or Drive file ID' };
  PropertiesService.getScriptProperties().setProperty('BRAND_HEADER_IMAGE_URL', value);
  return { ok: true, headerImageUrl: getBrandHeaderImageUrl() };
}

function setBrandLogoFromSocialAssets(fileNameInput) {
  const fileName = String(fileNameInput || '44realty.png').trim();
  if (!fileName) return { ok: false, error: 'Missing file name' };
  if (!PHOTO_LIBRARY_ROOT_FOLDER_ID) {
    return { ok: false, error: 'PHOTO_LIBRARY_ROOT_FOLDER_ID is empty' };
  }

  try {
    const root = DriveApp.getFolderById(PHOTO_LIBRARY_ROOT_FOLDER_ID);
    const socialFolder = findFirstFolderByNameInTree(root, 'social-assets', 0, 8);
    if (!socialFolder) {
      return { ok: false, error: 'Social-Assets folder not found under photo library root' };
    }

    const file = findFirstFileByNameInTree(socialFolder, fileName, 0, 8);
    if (!file) {
      return { ok: false, error: `File not found in Social-Assets: ${fileName}` };
    }

    PropertiesService.getScriptProperties().setProperty('BRAND_LOGO_URL', file.getId());
    return {
      ok: true,
      fileName: file.getName(),
      fileId: file.getId(),
      folderName: socialFolder.getName(),
      logoUrl: getBrandLogoUrl(),
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

function setBrandHeaderFromSocialAssets(fileNameInput) {
  const fileName = String(fileNameInput || 'slide2.jpeg').trim();
  if (!fileName) return { ok: false, error: 'Missing file name' };
  if (!PHOTO_LIBRARY_ROOT_FOLDER_ID) {
    return { ok: false, error: 'PHOTO_LIBRARY_ROOT_FOLDER_ID is empty' };
  }

  try {
    const root = DriveApp.getFolderById(PHOTO_LIBRARY_ROOT_FOLDER_ID);
    const socialFolder = findFirstFolderByNameInTree(root, 'social-assets', 0, 8);
    if (!socialFolder) {
      return { ok: false, error: 'Social-Assets folder not found under photo library root' };
    }

    const file = findFirstFileByNameInTree(socialFolder, fileName, 0, 8);
    if (!file) {
      return { ok: false, error: `File not found in Social-Assets: ${fileName}` };
    }

    PropertiesService.getScriptProperties().setProperty('BRAND_HEADER_IMAGE_URL', file.getId());
    return {
      ok: true,
      fileName: file.getName(),
      fileId: file.getId(),
      folderName: socialFolder.getName(),
      headerImageUrl: getBrandHeaderImageUrl(),
    };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

function findFirstFolderByNameInTree(folder, expectedName, depth, maxDepth) {
  if (!folder || depth > maxDepth) return null;
  const expected = normalizeKey(expectedName);
  const current = normalizeKey(folder.getName());
  if (current === expected) return folder;

  const subs = folder.getFolders();
  while (subs.hasNext()) {
    const sub = subs.next();
    const found = findFirstFolderByNameInTree(sub, expectedName, depth + 1, maxDepth);
    if (found) return found;
  }
  return null;
}

function findFirstFileByNameInTree(folder, fileName, depth, maxDepth) {
  if (!folder || depth > maxDepth) return null;

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (String(file.getName() || '').trim().toLowerCase() === String(fileName || '').trim().toLowerCase()) {
      return file;
    }
  }

  const subs = folder.getFolders();
  while (subs.hasNext()) {
    const sub = subs.next();
    const found = findFirstFileByNameInTree(sub, fileName, depth + 1, maxDepth);
    if (found) return found;
  }
  return null;
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function htmlOutput(html) {
  return HtmlService.createHtmlOutput(String(html || ''));
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
