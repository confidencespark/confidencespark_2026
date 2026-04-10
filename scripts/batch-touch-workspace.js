/**
 * Workspace batch: tags text files with a harmless marker (no image/build/deps dirs).
 * Run: node scripts/batch-touch-workspace.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TAG = 'ConfidenceSpark workspace batch';
const TAG_JSON_KEY = '_workspaceBatch';
const TAG_JSON_VAL = 'ConfidenceSpark';

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'vendor',
  '.git',
  'Pods',
  'build',
  '.cxx',
  'DerivedData',
  '.gradle',
]);

const IMAGE_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.bmp',
  '.heic',
]);

const BINARY_EXT = new Set([
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.keystore',
  '.jks',
  '.jar',
  '.aar',
  '.so',
  '.bin',
  '.mp3',
  '.mp4',
  '.m4a',
  '.wav',
]);

const SKIP_FILE_NAMES = new Set([
  'package-lock.json',
  'Podfile.lock',
  'Gemfile.lock',
  'yarn.lock',
]);

const XML_ROOT_TAGS = [
  'Workspace',
  'Scheme',
  'document',
  'plist',
  'manifest',
  'resources',
  'inset',
  'svg',
];

function relPosix(fullPath) {
  return path.relative(ROOT, fullPath).split(path.sep).join('/');
}

function shouldSkipFile(rel, ext) {
  const base = path.basename(rel);
  if (SKIP_FILE_NAMES.has(base)) return true;
  if (rel.includes('/patches/')) return true;
  if (rel.includes('/intermediates/')) return true;
  if (rel.includes('/src/assets/animations/') && ext === '.json') return true;
  if (rel.includes('/assets/images/')) return true;
  if (IMAGE_EXT.has(ext)) return true;
  if (BINARY_EXT.has(ext)) return true;
  if (rel === 'src/utils/commonFn.js') return true;
  return false;
}

function appendIfMissing(content, suffix) {
  if (content.includes(TAG)) return null;
  const trimmed = content.replace(/\s*$/, '');
  return `${trimmed}${suffix}`;
}

function touchJson(content) {
  if (content.includes(`"${TAG_JSON_KEY}"`) || content.includes(TAG)) return null;
  let data;
  try {
    data = JSON.parse(content);
  } catch {
    return null;
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;
  data[TAG_JSON_KEY] = TAG_JSON_VAL;
  return `${JSON.stringify(data, null, 2)}\n`;
}

function touchXml(raw) {
  if (raw.includes(TAG)) return null;
  const trimmed = raw.trimEnd();
  for (const t of XML_ROOT_TAGS) {
    const close = `</${t}>`;
    if (trimmed.endsWith(close)) {
      const idx = trimmed.lastIndexOf(close);
      return `${trimmed.slice(0, idx)}<!-- ${TAG} -->\n${trimmed.slice(idx)}\n`;
    }
  }
  return null;
}

function processFile(fullPath) {
  const rel = relPosix(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const base = path.basename(fullPath);

  if (shouldSkipFile(rel, ext)) return false;

  let raw;
  try {
    raw = fs.readFileSync(fullPath, 'utf8');
  } catch {
    return false;
  }
  if (raw.includes('\0')) return false;

  let next = null;

  if (base === '.watchmanconfig') {
    next = touchJson(raw);
  } else if (base === '.gitignore' || base === '.editorconfig') {
    next = appendIfMissing(raw, `\n# ${TAG}\n`);
  } else if (base === 'gradlew') {
    next = appendIfMissing(raw, `\n# ${TAG}\n`);
  } else if (base === 'Podfile' || base === 'Gemfile') {
    next = appendIfMissing(raw, `\n# ${TAG}\n`);
  } else if (ext === '.json') {
    next = touchJson(raw);
  } else if (
    [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.mjs',
      '.cjs',
      '.gradle',
      '.kts',
      '.swift',
      '.java',
      '.kt',
    ].includes(ext)
  ) {
    next = appendIfMissing(raw, `\n// ${TAG}\n`);
  } else if (['.properties', '.env', '.rb', '.podspec'].includes(ext)) {
    next = appendIfMissing(raw, `\n# ${TAG}\n`);
  } else if (base.startsWith('.xcode.env')) {
    next = appendIfMissing(raw, `\n# ${TAG}\n`);
  } else if (ext === '.md') {
    next = appendIfMissing(raw, `\n\n---\n\n${TAG}.\n`);
  } else if (
    ['.xml', '.storyboard', '.xcscheme', '.xcprivacy', '.plist'].includes(ext)
  ) {
    next = touchXml(raw);
  } else if (ext === '.pbxproj') {
    next = appendIfMissing(raw, `\n// ${TAG}\n`);
  } else if (ext === '.bat' || ext === '.cmd') {
    next = appendIfMissing(raw, `\nrem ${TAG}\n`);
  } else if (ext === '.ps1') {
    next = appendIfMissing(raw, `\n# ${TAG}\n`);
  } else if (ext === '.svg' && !rel.includes('/assets/images/')) {
    next = touchXml(raw) || appendIfMissing(raw, `\n<!-- ${TAG} -->\n`);
  }

  if (next !== null && next !== raw) {
    fs.writeFileSync(fullPath, next, 'utf8');
    return true;
  }
  return false;
}

function walk(dir, stats) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (SKIP_DIR_NAMES.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full, stats);
    } else if (ent.isFile()) {
      if (processFile(full)) stats.touched += 1;
      stats.seen += 1;
    }
  }
}

function ensureCommonFnNoOp() {
  const p = path.join(ROOT, 'src', 'utils', 'commonFn.js');
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('workspaceBatchNoOp')) {
    if (!s.includes(TAG)) {
      s = s.replace(/\s*$/, '');
      fs.writeFileSync(p, `${s}\n// ${TAG}\n`, 'utf8');
    }
    return;
  }
  s = s.replace(/\s*$/, '');
  const addition = `\n\n/** Optional no-op for workspace batch tagging; unused at runtime. */\nexport function workspaceBatchNoOp() {\n  return undefined;\n}\n// ${TAG}\n`;
  fs.writeFileSync(p, `${s}${addition}`, 'utf8');
}

const stats = { seen: 0, touched: 0 };
walk(ROOT, stats);
ensureCommonFnNoOp();

console.log(`batch-touch-workspace: scanned ${stats.seen} files, updated ${stats.touched}.`);
