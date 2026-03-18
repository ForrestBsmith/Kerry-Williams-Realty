# Photo Gen Setup (Drive + Sheets)

## 1) Google Drive Folder Architecture

Create this hierarchy in Drive:

- `44-Realty-Assets/`
- `44-Realty-Assets/realtors/`
- `44-Realty-Assets/properties/`
- `44-Realty-Assets/photos/` (optional shared/marketing assets)

Recommended per-entity subfolders:

- `44-Realty-Assets/realtors/{agentId}/`
- `44-Realty-Assets/properties/{propertyId}/`

Store image files in those folders and share them so your web app can access them.

### Auto Mode (Drop Files Only)

If you set `PHOTO_LIBRARY_ROOT_FOLDER_ID` in Apps Script, the app auto-loads images from Drive without `Photo Gen` rows.

- Expected root children: `properties/` and `realtors/` (or `agents/`)
- Under each: folder name must match entity ID from Sheets
- Optional template folders under each entity folder:
  - `properties/property-1/default/...`
  - `properties/property-1/luxury/...`
  - `realtors/agent-2/headshot/...`
- If no template subfolder exists, template defaults to `default`

File naming hints (for deterministic slot/order):

- Include `primary`, `cover`, or `hero` in filename for primary image
- Include a number (e.g. `gallery-01.jpg`) for sort order
- Otherwise slot defaults to gallery and order defaults to 9999

## 2) New Sheet Tab: `Photo Gen`

Add a tab named exactly `Photo Gen` with these columns (optional manual override mode):

- `targetType` (`agent`, `realtor`, or `property`)
- `targetId` (must match `Agents.id` or `Properties.id`)
- `slot` (`primary`, `cover`, `hero`, `gallery`, `detail`)
- `templateSelector` (template key to deterministically select image set)
- `driveFileId` (preferred) or `driveUrl`
- `sortOrder` (number; lower renders first)
- `active` (`TRUE`/`FALSE`)
- `alt` (optional)

## 3) Deterministic Template Selection

For each property/agent:

- If `photoTemplate` (or `templateSelector`/`imageTemplate`) exists on the entity row, app uses exact `Photo Gen.templateSelector` match.
- If no exact match, app uses `templateSelector = default`.
- If no default exists, app falls back to all active rows for that target.

This ensures consistent, deterministic template behavior from your sheet selector.

## 4) URL Handling

You can provide either:

- a raw Drive file ID (`1AbC...`), or
- a standard Drive share URL.

The app converts both into direct image URLs automatically.
