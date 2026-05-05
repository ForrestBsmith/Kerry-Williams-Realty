import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getDriveClient } from './sheets.js';
import { TMP_DIR, DRIVE_OUTPUT_FOLDER_ID, CAROUSEL_PHOTO_LIMIT } from './config.js';

function logFolderContents(folderId, files, label) {
  const folderLabel = label ? `${label} (${folderId})` : folderId;
  console.log(
    `Drive: found ${files.length} file(s) in folder ${folderLabel}:`,
    files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType }))
  );
}

async function listImageFiles(drive, folderId, label) {
  const res = await drive.files.list({
    q: [
      `'${folderId}' in parents`,
      "mimeType contains 'image/'",
      "trashed = false"
    ].join(' and '),
    fields: 'files(id, name, mimeType)',
    pageSize: 20
  });

  const files = res.data.files || [];
  logFolderContents(folderId, files, label);
  return files;
}

async function findPhotoUploadFolder(drive, propertyFolderId) {
  const res = await drive.files.list({
    q: [
      `'${propertyFolderId}' in parents`,
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false"
    ].join(' and '),
    fields: 'files(id, name)',
    pageSize: 20
  });

  const folders = res.data.files || [];
  const targetNames = ['photo_upload', 'photo upload'];
  const match =
    folders.find(f => targetNames.includes(f.name?.trim().toLowerCase())) || null;

  if (match) {
    console.log(
      `Drive: found nested PHOTO_UPLOAD folder ${match.id} inside ${propertyFolderId}`
    );
  }

  return match;
}

/**
 * Find hero.jpg image inside a given folder.
 */
async function findAllImageFiles(drive, propertyFolderId) {
  const directFiles = await listImageFiles(drive, propertyFolderId);
  if (directFiles.length) {
    return directFiles;
  }

  const nestedFolder = await findPhotoUploadFolder(drive, propertyFolderId);
  if (nestedFolder) {
    const nestedFiles = await listImageFiles(
      drive,
      nestedFolder.id,
      nestedFolder.name
    );
    if (nestedFiles.length) {
      return nestedFiles;
    }
  }

  throw new Error(
    `No photos found in folder ${propertyFolderId} (or in PHOTO_UPLOAD subfolder)`
  );
}

function extractSequenceNumber(name = '') {
  const match = (name || '').match(/^(\d{1,4})[\s._-]?/);
  return match ? Number(match[1]) : null;
}

const localeCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base'
});

function normalizeImageOrder(files) {
  if (!Array.isArray(files) || !files.length) return [];

  return [...files].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    const seqA = extractSequenceNumber(nameA);
    const seqB = extractSequenceNumber(nameB);
    const hasSeqA = typeof seqA === 'number';
    const hasSeqB = typeof seqB === 'number';

    if (hasSeqA && hasSeqB && seqA !== seqB) {
      return seqA - seqB;
    }
    if (hasSeqA && !hasSeqB) return -1;
    if (!hasSeqA && hasSeqB) return 1;

    return localeCollator.compare(nameA, nameB);
  });
}

const SUPPORTED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

async function downloadFileAsDataUrl(drive, file) {
  const ext = file.name?.includes('.') ? file.name.split('.').pop() : 'jpg';
  const localPath = path.join(TMP_DIR, `${file.id}.${ext}`);
  const dest = fs.createWriteStream(localPath);

  await new Promise((resolve, reject) => {
    drive.files.get(
      { fileId: file.id, alt: 'media' },
      { responseType: 'stream' },
      (err, res) => {
        if (err) return reject(err);

        res.data
          .on('end', resolve)
          .on('error', reject)
          .pipe(dest);
      }
    );
  });

  let buffer = await fs.promises.readFile(localPath);
  let mimeType = file.mimeType || `image/${ext === 'png' ? 'png' : 'jpeg'}`;

  if (!SUPPORTED_IMAGE_MIMES.has(mimeType)) {
    try {
      buffer = await sharp(buffer).png().toBuffer();
      mimeType = 'image/png';
    } catch (conversionError) {
      console.warn(`Could not convert ${file.name} (${mimeType}), attempting fallback to jpeg.`);
      try {
        buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        mimeType = 'image/jpeg';
      } catch {
        // leave as-is
      }
    }
  }

  const base64 = buffer.toString('base64');
  return {
    url: `data:${mimeType};base64,${base64}`,
    name: file.name || ''
  };
}

/**
 * Gather hero image plus carousel-ready photos for a property.
 */
export async function getPropertyMediaAssets(
  propertyFolderId,
  { limit = CAROUSEL_PHOTO_LIMIT } = {}
) {
  const drive = await getDriveClient();

  const orderedFiles = normalizeImageOrder(await findAllImageFiles(drive, propertyFolderId));
  const essentialKeywords = ['hero', 'landview', 'map', 'retailer', 'zoning', 'fema', 'flood', 'floor'];
  const isNumberedName = file => /^\s*\d/.test(file?.name || '');
  let selectedFiles =
    typeof limit === 'number'
      ? orderedFiles.slice(0, Math.max(1, limit))
      : orderedFiles.slice();

  if (typeof limit === 'number') {
    orderedFiles.forEach(file => {
      if (selectedFiles.includes(file)) return;
      const name = (file.name || '').toLowerCase();
      if (essentialKeywords.some(keyword => name.includes(keyword)) || isNumberedName(file)) {
        selectedFiles.push(file);
      }
    });
  }

  const photoEntriesRaw = await Promise.all(
    selectedFiles.map(file => downloadFileAsDataUrl(drive, file))
  );
  const photoEntries = photoEntriesRaw;

  if (process.env.DEBUG_CAROUSEL_ORDER === '1') {
    console.log(
      `Carousel order for folder ${propertyFolderId}:`,
      photoEntries.map(entry => entry.name || '(unnamed)')
    );
  }

  return {
    heroImageUrl: photoEntries[0]?.url,
    carouselPhotoUrls: photoEntries
  };
}

/**
 * Backwards-compatible helper for callers expecting only the hero image.
 */
export async function getHeroImageLocalFileUrl(propertyFolderId) {
  const { heroImageUrl } = await getPropertyMediaAssets(propertyFolderId, { limit: 1 });
  return heroImageUrl;
}

/**
 * Upload a rendered PNG from the local filesystem to the output folder in Drive.
 * No-op if DRIVE_OUTPUT_FOLDER_ID is not set.
 */
export async function uploadRenderedImageToDrive(filePath) {
  if (!DRIVE_OUTPUT_FOLDER_ID) return null;

  const drive = await getDriveClient();
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();
  const mimeType =
    ext === '.webm'
      ? 'video/webm'
      : ext === '.mp4'
      ? 'video/mp4'
      : ext === '.pdf'
      ? 'application/pdf'
      : 'image/png';

  const fileMetadata = {
    name: fileName,
    parents: [DRIVE_OUTPUT_FOLDER_ID]
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath)
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, webViewLink, webContentLink'
  });

  return res.data;
}
