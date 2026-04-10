@echo off
REM Wrapper to add -d keepdepfile to ninja, fixing "deleting depfile: Permission denied" on Windows.
REM Skip keepdepfile for -t (tool) invocations to avoid "failed recompaction: Permission denied".

set "NINJA_EXE="
if defined ANDROID_HOME set "NINJA_EXE=%ANDROID_HOME%\cmake\3.22.1\bin\ninja.exe"
if not defined NINJA_EXE if defined ANDROID_SDK_ROOT set "NINJA_EXE=%ANDROID_SDK_ROOT%\cmake\3.22.1\bin\ninja.exe"
if not defined NINJA_EXE set "NINJA_EXE=%LOCALAPPDATA%\Android\Sdk\cmake\3.22.1\bin\ninja.exe"

if not exist "%NINJA_EXE%" (
  echo ninja-wrapper: Ninja not found at %NINJA_EXE%
  echo Set ANDROID_HOME or ANDROID_SDK_ROOT to your Android SDK path.
  exit /b 1
)

REM Skip keepdepfile when -t (tool) is used: %1=-C %2=path %3=-t for "ninja -C dir -t restat"
set "USE_KEEPDEPFILE=1"
if "%1"=="-t" set "USE_KEEPDEPFILE=0"
if "%3"=="-t" set "USE_KEEPDEPFILE=0"
if %USE_KEEPDEPFILE%==1 (
  "%NINJA_EXE%" -d keepdepfile %*
) else (
  "%NINJA_EXE%" %*
)
rem ConfidenceSpark workspace batch
