import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const templateDir = path.join(repoRoot, 'templates', 'photo-gen');
const configPath = path.join(templateDir, 'templates.json');
const outPath = path.join(repoRoot, 'apps-script', 'photo-gen-html-templates.gs');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function extractBodyHtml(input) {
  const raw = String(input || '');
  const matches = [...raw.matchAll(/<body\b[^>]*>/gi)];
  if (!matches.length) return raw.trim();

  // Use the last body tag to avoid false positives in comments/scripts.
  const openMatch = matches[matches.length - 1];
  const start = openMatch.index + openMatch[0].length;
  const closeIndex = raw.toLowerCase().indexOf('</body>', start);
  if (closeIndex === -1) return raw.trim();
  return raw.slice(start, closeIndex).trim();
}

const rows = config.map((item) => {
  const htmlPath = path.join(templateDir, item.htmlFile);
  const textPath = path.join(templateDir, item.textFile);
  const htmlRaw = fs.readFileSync(htmlPath, 'utf8');
  const html = extractBodyHtml(htmlRaw);
  const text = fs.readFileSync(textPath, 'utf8').trim();

  return [item.selector, item.targetType, item.templateName, html, text];
});

const body = rows
  .map((row) => `    [${row.map((v) => JSON.stringify(v)).join(', ')}],`)
  .join('\n');

const content = `/**\n * AUTO-GENERATED FILE.\n * Source: templates/photo-gen/* + templates/photo-gen/templates.json\n * Regenerate with: node scripts/generate-photo-gen-template-registry.mjs\n */\nfunction buildDefaultPhotoGenHtmlTemplates() {\n  return [\n${body}\n  ];\n}\n`;

fs.writeFileSync(outPath, content, 'utf8');
console.log(`Wrote ${outPath}`);
