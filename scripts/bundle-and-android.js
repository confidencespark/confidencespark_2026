#!/usr/bin/env node
/**
 * Bundle JS into the APK and run on Android.
 * Use when you need the app to run without Metro (e.g. after closing the terminal).
 * Run: npm run android:standalone
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets');
const bundleOutput = path.join(assetsDir, 'index.android.bundle');
const assetsDest = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('Created', assetsDir);
}

// 1. Bundle the JS
console.log('Bundling JavaScript...');
const bundleResult = spawnSync(
  'npx',
  [
    'react-native', 'bundle',
    '--platform', 'android',
    '--dev', 'false',
    '--entry-file', 'index.js',
    '--bundle-output', bundleOutput,
    '--assets-dest', assetsDest
  ],
  { stdio: 'inherit', cwd: projectRoot }
);

if (bundleResult.status !== 0) {
  console.error('Bundle failed.');
  process.exit(1);
}

// 2. Run Android (reuse Windows shortpath logic)
const isWindows = process.platform === 'win32';
if (isWindows) {
  const runResult = spawnSync(
    'powershell',
    ['-ExecutionPolicy', 'Bypass', '-File', './scripts/android-windows-shortpath.ps1'],
    { stdio: 'inherit', cwd: projectRoot }
  );
  process.exit(runResult.status ?? 1);
} else {
  const runResult = spawnSync('npx', ['react-native', 'run-android'], {
    stdio: 'inherit',
    cwd: projectRoot
  });
  process.exit(runResult.status ?? 1);
}
// ConfidenceSpark workspace batch
