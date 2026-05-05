import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import {
  OUTPUT_DIR,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  DEFAULT_VIDEO_DURATION,
  FFMPEG_PATH
} from './config.js';

const DEFAULT_DEVICE_SCALE_FACTOR = 3;
const DEFAULT_RENDER_RETRIES = 2;
const MAX_VIEWPORT_DIMENSION = 8192;
const MAX_VIEWPORT_PIXELS = 70_000_000;
const RETRY_DELAY_MS = 750;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildViewport(width, height, requestedScale = DEFAULT_DEVICE_SCALE_FACTOR) {
  let deviceScaleFactor = requestedScale;

  if (width * deviceScaleFactor > MAX_VIEWPORT_DIMENSION) {
    deviceScaleFactor = Math.min(deviceScaleFactor, MAX_VIEWPORT_DIMENSION / width);
  }
  if (height * deviceScaleFactor > MAX_VIEWPORT_DIMENSION) {
    deviceScaleFactor = Math.min(deviceScaleFactor, MAX_VIEWPORT_DIMENSION / height);
  }

  const maxScaleByPixels = Math.sqrt(MAX_VIEWPORT_PIXELS / (width * height));
  if (Number.isFinite(maxScaleByPixels) && deviceScaleFactor > maxScaleByPixels) {
    deviceScaleFactor = maxScaleByPixels;
  }

  deviceScaleFactor = Math.max(1, Number(deviceScaleFactor.toFixed(2)));

  if (deviceScaleFactor < requestedScale) {
    console.warn(
      `Viewport scale reduced from ${requestedScale} to ${deviceScaleFactor} for ${width}x${height} to avoid Chromium screenshot limits.`
    );
  }

  return { width, height, deviceScaleFactor };
}

export async function renderHtmlToPng(html, basename, options = {}) {
  const {
    width = VIEWPORT_WIDTH,
    height = VIEWPORT_HEIGHT,
    suffix = '',
    retries = DEFAULT_RENDER_RETRIES
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    attempt += 1;
    const viewport = buildViewport(width, height);
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: viewport
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const filePath = path.join(OUTPUT_DIR, `${basename}${suffix}.png`);

      await page.screenshot({
        path: filePath,
        type: 'png'
      });

      console.log(`✅ Rendered: ${filePath}`);
      return filePath;
    } catch (error) {
      lastError = error;
      const filePath = path.join(OUTPUT_DIR, `${basename}${suffix}.png`);
      await fs.promises.unlink(filePath).catch(() => {});
      if (attempt > retries) {
        throw error;
      }
      console.warn(
        `Screenshot attempt ${attempt} for ${basename}${suffix} failed (${error.message}). Retrying...`
      );
      await delay(RETRY_DELAY_MS * attempt);
    } finally {
      await browser.close().catch(() => {});
    }
  }

  throw lastError;
}

function getFfmpegBinary() {
  if (FFMPEG_PATH?.trim()) {
    try {
      if (fs.existsSync(FFMPEG_PATH)) {
        return FFMPEG_PATH;
      }
    } catch {
      // fall back below
    }
  }
  return 'ffmpeg';
}

function runFfmpeg(binary, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(binary, args, { stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

async function convertWebmToMp4(webmPath, ffmpegBinary) {
  const mp4Path = webmPath.endsWith('.webm')
    ? `${webmPath.slice(0, -5)}.mp4`
    : `${webmPath}.mp4`;

  const args = [
    '-y',
    '-i',
    webmPath,
    '-c:v',
    'libx264',
    '-crf',
    '18',
    '-preset',
    'medium',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    mp4Path
  ];

  await runFfmpeg(ffmpegBinary, args);
  return mp4Path;
}

export async function renderHtmlToVideo(html, basename, options = {}) {
  const {
    width = VIEWPORT_WIDTH,
    height = VIEWPORT_HEIGHT,
    suffix = '',
    duration = DEFAULT_VIDEO_DURATION,
    retries = DEFAULT_RENDER_RETRIES
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    attempt += 1;
    const viewport = buildViewport(width, height);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: viewport
    });

    const filePath = path.join(OUTPUT_DIR, `${basename}${suffix}.webm`);
    const ffmpegBinary = getFfmpegBinary();
    let recorder = null;
    let hasStoppedRecording = false;

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      recorder = await page.screencast({
        path: filePath,
        ffmpegPath: ffmpegBinary
      });

      await page.evaluate(() => {
        if (typeof window.__startCarousel === 'function') {
          window.__startCarousel();
        }
      }).catch(() => {});

      const waitMs = Math.max(1, duration + 0.25) * 1000;
      if (typeof page.waitForTimeout === 'function') {
        await page.waitForTimeout(waitMs);
      } else {
        await delay(waitMs);
      }
      await recorder.stop();
      hasStoppedRecording = true;

      let finalVideoPath = filePath;
      try {
        finalVideoPath = await convertWebmToMp4(filePath, ffmpegBinary);
        await fs.promises.unlink(filePath).catch(() => {});
      } catch (conversionError) {
        console.warn('Video recorded as WebM but MP4 conversion failed:', conversionError);
      }

      console.log(`🎬 Rendered video: ${finalVideoPath}`);
      return finalVideoPath;
    } catch (error) {
      lastError = error;
      console.error(
        'Failed to render video. Ensure ffmpeg is installed and on your PATH (or set FFMPEG_PATH).'
      );
      if (attempt > retries) {
        throw error;
      }
      await fs.promises.unlink(filePath).catch(() => {});
      console.warn(
        `Video render attempt ${attempt} for ${basename}${suffix} failed (${error.message}). Retrying...`
      );
      await delay(RETRY_DELAY_MS * attempt);
    } finally {
      if (recorder && !hasStoppedRecording) {
        try {
          await recorder.stop();
          hasStoppedRecording = true;
        } catch {
          // ignore
        }
      }
      await browser.close().catch(() => {});
    }
  }

  throw lastError;
}
