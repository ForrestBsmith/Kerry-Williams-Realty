import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { OUTPUT_DIR } from './config.js';

function normalizeOutputPath(fileName) {
  if (!fileName) return null;
  if (path.isAbsolute(fileName)) return fileName;
  return path.join(OUTPUT_DIR, fileName);
}

export async function createPdfFromImages(imagePaths = [], basename, options = {}) {
  const validImages = (imagePaths || []).filter(Boolean);
  if (!validImages.length) return null;

  const { suffix = '-brochure', fileName } = options;
  const targetFileName =
    fileName || `${basename}${suffix.endsWith('.pdf') ? suffix : `${suffix}.pdf`}`;
  const pdfPath = normalizeOutputPath(
    targetFileName.endsWith('.pdf') ? targetFileName : `${targetFileName}.pdf`
  );

  const pdfDoc = await PDFDocument.create();

  for (const imagePath of validImages) {
    const imageBytes = await fs.promises.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    let embeddedImage;
    if (ext === '.jpg' || ext === '.jpeg') {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    }

    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height
    });
  }

  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(pdfPath, pdfBytes);
  return pdfPath;
}
