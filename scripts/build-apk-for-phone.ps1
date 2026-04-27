# Build release APK for physical phones (arm64-v8a)
# Workaround: x86_64 CMake works; arm64 CMake fails to create rules.ninja on Windows.
# We build x86_64 first to get CMakeFiles, copy+adapt for arm64, then build arm64.
# Output: ConfidenceCatalyst-release.apk in project root
#
# IMPORTANT: Do not SUBST the project to another drive (e.g. Y:\). React Native's
# codegen compares paths with path.relative(); mixed Y:\ and D:\ roots cause:
# "this and base files have different roots" and fail the build.

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$AndroidDir = Join-Path $ProjectRoot "android"

# Avoid Set-Content "Stream was not readable" when Gradle/antivirus lock files — use UTF-8 write + retries
function Write-ProjectTextFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $attempts = 6
    for ($a = 1; $a -le $attempts; $a++) {
        try {
            [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
            return
        }
        catch {
            if ($a -eq $attempts) { throw }
            Start-Sleep -Seconds 2
        }
    }
}

# Ninja keeps a .ninja_log in each CMake build dir; on Windows the next Gradle run can hit
# "opening build log: Permission denied" if daemons/workers still hold the file.
function Remove-NinjaLogsUnderNodeModulesCxx {
    param([string]$Root)
    $targets = @()
    $nm = Join-Path $Root "node_modules"
    if (Test-Path $nm) {
        Get-ChildItem $nm -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            $cxx = Join-Path $_.FullName "android\.cxx"
            if (Test-Path $cxx) { $targets += $cxx }
        }
    }
    $appCxx = Join-Path $Root "android\app\.cxx"
    if (Test-Path $appCxx) { $targets += $appCxx }
    foreach ($dir in $targets) {
        Get-ChildItem -LiteralPath $dir -Recurse -Force -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -ceq '.ninja_log' } |
            ForEach-Object {
                Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
            }
    }
}

Write-Host "Building release APK for phones (arm64-v8a)..." -ForegroundColor Cyan

# Remove stale Y: (or other) SUBST from older versions of this script
$legacySubstDrive = "Y"
if (Get-PSDrive -Name $legacySubstDrive -ErrorAction SilentlyContinue) {
    subst "${legacySubstDrive}:" /d 2>$null
    Start-Sleep -Seconds 1
}

# Stop Gradle
$gradlew = Join-Path $AndroidDir "gradlew.bat"
if (Test-Path $gradlew) {
    Push-Location $AndroidDir
    try { & .\gradlew.bat --stop 2>$null } finally { Pop-Location }
    Start-Sleep -Seconds 2
}

# Clean .cxx and problem modules (avoids "file in use" on Windows)
# Avoid cleaning android\app\build - can cause "No variants exist" for libs
$cxxPaths = @(
    "android\app\.cxx",
    "node_modules\@d11\react-native-fast-image\android\build",
    "node_modules\react-native-nitro-modules\android\.cxx",
    "node_modules\react-native-reanimated\android\.cxx",
    "node_modules\react-native-worklets\android\.cxx",
    "node_modules\react-native-audio-recorder-player\android\.cxx"
)
foreach ($relPath in $cxxPaths) {
    $fullPath = Join-Path $ProjectRoot $relPath
    if (Test-Path $fullPath) {
        Remove-Item -Recurse -Force $fullPath -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 6

try {
    Set-Location $ProjectRoot

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

    # Phase 1: Build x86_64 (works) to get CMakeFiles
    Write-Host "Phase 1: Building x86_64 (creates CMakeFiles)..." -ForegroundColor Gray
    $gradleProps = Join-Path $ProjectRoot "android\gradle.properties"
    $content = [System.IO.File]::ReadAllText($gradleProps)
    $content = $content -replace 'reactNativeArchitectures=arm64-v8a', 'reactNativeArchitectures=x86_64'
    Write-ProjectTextFile -Path $gradleProps -Content $content

    $appBuild = Join-Path $ProjectRoot "android\app\build.gradle"
    $buildContent = [System.IO.File]::ReadAllText($appBuild)
    $buildContent = $buildContent -replace 'abiFilters "arm64-v8a"', 'abiFilters "x86_64"'
    Write-ProjectTextFile -Path $appBuild -Content $buildContent

    $maxRetries = 2
    $phase1 = 1
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        if ($attempt -gt 1) {
            Write-Host "Phase 1 retry $attempt/$maxRetries (ninja recompaction can be intermittent)..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
        Push-Location $AndroidDir
        try {
            & .\gradlew.bat assembleRelease --no-parallel -x verifyReleaseResources
            $phase1 = $LASTEXITCODE
        } finally {
            Pop-Location
        }
        if ($phase1 -eq 0) { break }
    }

    if ($phase1 -ne 0) {
        Write-Host "Phase 1 failed after $maxRetries attempt(s)." -ForegroundColor Red
        exit $phase1
    }

    # Phase 2: Switch to arm64, copy CMakeFiles, build
    Write-Host "Phase 2: Building arm64-v8a (with CMakeFiles workaround)..." -ForegroundColor Gray
    $content = [System.IO.File]::ReadAllText($gradleProps)
    $content = $content -replace 'reactNativeArchitectures=x86_64', 'reactNativeArchitectures=arm64-v8a'
    Write-ProjectTextFile -Path $gradleProps -Content $content

    $buildContent = [System.IO.File]::ReadAllText($appBuild)
    $buildContent = $buildContent -replace 'abiFilters "x86_64"', 'abiFilters "arm64-v8a"'
    Write-ProjectTextFile -Path $appBuild -Content $buildContent

    Push-Location $AndroidDir
    try {
        cmd /c ".\gradlew.bat assembleRelease -x verifyReleaseResources 2>nul"
    } finally {
        Pop-Location
    }

    # Release workers so .ninja_log / CMake outputs are not locked before we patch app .cxx or run the final build
    Push-Location $AndroidDir
    try { & .\gradlew.bat --stop 2>$null } finally { Pop-Location }
    Start-Sleep -Seconds 8

    # Copy and adapt CMakeFiles from x86_64 to arm64-v8a (workaround for Windows CMake bug)
    $cxxBase = Join-Path $ProjectRoot "android\app\.cxx\RelWithDebInfo"
    $hashDir = Get-ChildItem $cxxBase -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hashDir) {
        $srcCMake = Join-Path $hashDir.FullName "x86_64\CMakeFiles"
        $dstArm = Join-Path $hashDir.FullName "arm64-v8a"
        $dstCMake = Join-Path $dstArm "CMakeFiles"
        if ((Test-Path $srcCMake) -and (Test-Path $dstArm)) {
            if (-not (Test-Path $dstCMake)) { New-Item -ItemType Directory -Path $dstCMake -Force | Out-Null }
            Copy-Item "$srcCMake\*" $dstCMake -Recurse -Force
            $rulesPath = Join-Path $dstCMake "rules.ninja"
            if (Test-Path $rulesPath) {
                $rules = Get-Content $rulesPath -Raw
                $rules = $rules -replace 'x86_64-none-linux-android', 'aarch64-none-linux-android'
                $rules = $rules -replace '--target=x86_64-', '--target=aarch64-'
                Write-ProjectTextFile -Path $rulesPath -Content $rules
                Write-Host "Applied CMakeFiles workaround for arm64." -ForegroundColor Gray
            }
        }
        # x86_64 CMake metadata + earlier incremental builds can leave x86 .o files here; linking then fails with
        # "autolinking.cpp.o is incompatible with aarch64linux". Force recompile for aarch64 only.
        $arm64Root = Join-Path $hashDir.FullName "arm64-v8a"
        if (Test-Path $arm64Root) {
            Get-ChildItem -LiteralPath $arm64Root -Filter *.o -Recurse -File -ErrorAction SilentlyContinue |
                ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue }
            Write-Host "Removed stale *.o under arm64-v8a (.cxx) so the final link uses aarch64 objects only." -ForegroundColor Gray
        }
    }

    Remove-NinjaLogsUnderNodeModulesCxx -Root $ProjectRoot
    Write-Host "Cleared .ninja_log under node_modules/**/android/.cxx (reduces Windows ninja 'opening build log: Permission denied')." -ForegroundColor Gray

    Push-Location $AndroidDir
    try { & .\gradlew.bat --stop 2>$null } finally { Pop-Location }
    Start-Sleep -Seconds 5

    $maxFinalAttempts = 2
    $exitCode = 1
    for ($fa = 1; $fa -le $maxFinalAttempts; $fa++) {
        if ($fa -gt 1) {
            Write-Host "Final arm64 assemble retry $fa/$maxFinalAttempts (ninja log / file lock)..." -ForegroundColor Gray
            Push-Location $AndroidDir
            try { & .\gradlew.bat --stop 2>$null } finally { Pop-Location }
            Start-Sleep -Seconds 12
            Remove-NinjaLogsUnderNodeModulesCxx -Root $ProjectRoot
        }
        Push-Location $AndroidDir
        try {
            & .\gradlew.bat assembleRelease --no-daemon -x verifyReleaseResources
            $exitCode = $LASTEXITCODE
        } finally {
            Pop-Location
        }
        if ($exitCode -eq 0) { break }
    }

    # Restore gradle config (release Gradle file locks first — avoids Set-Content / stream errors)
    Push-Location $AndroidDir
    try { & .\gradlew.bat --stop 2>$null } finally { Pop-Location }
    Start-Sleep -Seconds 3

    $content = [System.IO.File]::ReadAllText($gradleProps)
    $content = $content -replace 'reactNativeArchitectures=x86_64', 'reactNativeArchitectures=arm64-v8a'
    Write-ProjectTextFile -Path $gradleProps -Content $content

    $buildContent = [System.IO.File]::ReadAllText($appBuild)
    $buildContent = $buildContent -replace 'abiFilters "x86_64"', 'abiFilters "arm64-v8a"'
    Write-ProjectTextFile -Path $appBuild -Content $buildContent

    $apkPath = Join-Path $ProjectRoot "android\app\build\outputs\apk\release\app-release.apk"
    $destPath = Join-Path $ProjectRoot "ConfidenceCatalyst-release.apk"

    if ($exitCode -ne 0) {
        Write-Host ""
        Write-Host "Final arm64 build failed (exit code $exitCode). Not copying APK." -ForegroundColor Red
        exit $exitCode
    }
    if (-not (Test-Path $apkPath)) {
        Write-Host ""
        Write-Host "Build reported success but APK not found: $apkPath" -ForegroundColor Red
        exit 1
    }
    Copy-Item $apkPath $destPath -Force
    Write-Host ""
    Write-Host "SUCCESS: APK ready for your phone!" -ForegroundColor Green
    Write-Host "Location: $destPath" -ForegroundColor Cyan
} finally {
    Set-Location $ProjectRoot
}
