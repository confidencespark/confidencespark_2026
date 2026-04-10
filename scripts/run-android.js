#!/usr/bin/env node
/**
 * Cross-platform Android run script.
 * On Windows, uses short path (subst Y:) - required for dependency resolution.
 * For a working APK on Windows, use: npm run android:apk
 */

const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';

if (isWindows) {
  const result = spawnSync(
    'powershell',
    ['-ExecutionPolicy', 'Bypass', '-File', './scripts/android-windows-shortpath.ps1'],
    { stdio: 'inherit' }
  );
  process.exit(result.status ?? 1);
} else {
  const result = spawnSync('npx', ['react-native', 'run-android'], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
// ConfidenceSpark workspace batch
