# Build Android from a short path using a virtual drive (subst).
# Fixes "Permission denied" and CMake 250-char path limit when project path is long.
# Run from project root: .\scripts\android-windows-shortpath.ps1

$ErrorActionPreference = "Stop"
$DriveLetter = "Y"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent

# Stop Gradle daemons to release file handles (avoids "failed recompaction: Permission denied")
$gradlew = Join-Path $ProjectRoot "android\gradlew.bat"
if (Test-Path $gradlew) {
    Write-Host "Stopping Gradle daemons..." -ForegroundColor Gray
    & $gradlew --stop 2>$null
    Start-Sleep -Seconds 2
}

# Remove .cxx caches (ensures CMake reconfigures with ninja wrapper + short path)
# Clearing stale ninja state avoids "failed recompaction: Permission denied" on Windows
$cxxPaths = @(
    "node_modules\react-native-nitro-modules\android\.cxx",
    "node_modules\react-native-reanimated\android\.cxx",
    "node_modules\react-native-worklets\android\.cxx",
    "node_modules\react-native-audio-recorder-player\android\.cxx",
    "android\app\.cxx"
)
foreach ($relPath in $cxxPaths) {
    $fullPath = Join-Path $ProjectRoot $relPath
    if (Test-Path $fullPath) {
        Remove-Item -Recurse -Force $fullPath -ErrorAction SilentlyContinue
        Write-Host "Cleaned $relPath" -ForegroundColor Gray
    }
}

# Only clean .cxx; avoid full build wipe to reduce file churn and "Permission denied" races.
# For full clean, run: cd android; .\gradlew clean; cd ..

# Pause so Windows fully releases file handles before CMake/ninja run
# Shorter pauses often cause "ninja: failed recompaction: Permission denied" on first build
Start-Sleep -Seconds 6

# Remove drive if already in use (e.g. from previous run)
$existing = Get-PSDrive -Name $DriveLetter -ErrorAction SilentlyContinue
if ($existing) {
    subst "${DriveLetter}:" /d
}

try {
    subst "${DriveLetter}:" $ProjectRoot
    Set-Location "${DriveLetter}:\"
    Write-Host "Building from short path: ${DriveLetter}:\" -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    # Ensure ANDROID_HOME is set so ninja-wrapper.bat can find SDK (for -d keepdepfile)
    $localProps = Join-Path $ProjectRoot "android\local.properties"
    if ((Test-Path $localProps) -and (Select-String -Path $localProps -Pattern "sdk\.dir=(.+)" -Quiet)) {
        $sdkMatch = Select-String -Path $localProps -Pattern "sdk\.dir=(.+)" | Select-Object -First 1
        if ($sdkMatch) {
            $sdkPath = $sdkMatch.Matches.Groups[1].Value.Trim() -replace '\\\\', '\'
            $env:ANDROID_HOME = $sdkPath
            $env:ANDROID_SDK_ROOT = $sdkPath
        }
    }
    if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk" }
    # Release mode: JS bundled in APK, no Metro needed. Includes all native libs (e.g. libNitroAudioRecorderPlayer.so).
    Write-Host "Building release APK (JS bundled, no Metro needed)..." -ForegroundColor Cyan
    $maxRetries = 2
    $lastExit = -1
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        & npx react-native run-android --mode=release
        $lastExit = $LASTEXITCODE
        if ($lastExit -eq 0) { break }
        if ($attempt -lt $maxRetries) {
            Write-Host "Build failed (exit $lastExit). Cleaning app .cxx and retrying in 5 seconds..." -ForegroundColor Yellow
            $appCxx = Join-Path $ProjectRoot "android\app\.cxx"
            if (Test-Path $appCxx) {
                Remove-Item -Recurse -Force $appCxx -ErrorAction SilentlyContinue
                Write-Host "Cleaned android\app\.cxx for retry" -ForegroundColor Gray
            }
            Start-Sleep -Seconds 5
        }
    }
    if ($lastExit -ne 0) { exit $lastExit }
} finally {
    Set-Location $ProjectRoot
    subst "${DriveLetter}:" /d
    Write-Host "Unmounted ${DriveLetter}:" -ForegroundColor Gray
}
