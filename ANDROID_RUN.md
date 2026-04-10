# Running Confidence Spark on Android

## Recommended: Build APK (Windows)

On Windows, use this to get a working APK:

```bash
npm run android:apk
```

Output: `ConfidenceCatalyst-release.apk` in the project root. Copy to your phone and install.

This uses a two-phase CMake workaround that avoids the ninja rules.ninja bug.

## Quick Start (run on connected device/emulator)

```bash
npm run android
```

Builds release APK with JS bundled. May hit ninja error on Windows—if so, use `npm run android:apk` instead.

## If the app still shows "keeps stopping"

1. **Uninstall the app** from the emulator/device.
2. **Clean and rebuild:**
   ```bash
   cd android
   .\gradlew clean
   cd ..
   npm run android
   ```

## If the first build fails with "Permission denied"

The script waits for file handles to release. If it still fails on first run, do a full clean first:
   ```bash
   cd android
   .\gradlew clean
   .\gradlew --stop
   cd ..
   npm run android:apk
   ```

## If build fails (ninja rules.ninja error)

The default `npm run android` now builds from the real path (no subst) to avoid the ninja "cannot find CMakeFiles/rules.ninja" error. If it still fails:

1. Stop Gradle: `cd android` then `.\gradlew --stop`
2. Delete: `android\app\.cxx` and `android\app\build`
3. Run `npm run android` again

**Alternative:** Use `npm run android:apk` which has a two-phase CMake workaround and outputs `ConfidenceCatalyst-release.apk` for manual install.

**Legacy:** Set `ANDROID_USE_SHORTPATH=1` to use the old subst-based script (may hit rules.ninja bug).

## Debug build with hot reload (Metro)

For development with hot reload:

1. Run Metro in one terminal: `npm start` (keep it open).
2. In another terminal: `npx react-native run-android --mode=debug`

Then keep the Metro terminal open when using the app.

---

ConfidenceSpark workspace batch.
