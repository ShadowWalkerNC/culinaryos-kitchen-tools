@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 or later from https://nodejs.org and open this launcher again.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24)process.exit(1)"
if errorlevel 1 (
  echo This toolkit requires Node.js 24 or later.
  pause
  exit /b 1
)
pushd "%~dp0.."
if not exist node_modules\@modelcontextprotocol\sdk (
  echo Installing the locked runtime dependencies. Your kitchen records stay outside this folder.
  call npm ci --omit=dev --no-audit --no-fund
  if errorlevel 1 (
    popd
    pause
    exit /b 1
  )
)
if not defined KITCHEN_WORKSPACE set "KITCHEN_WORKSPACE=%LOCALAPPDATA%\OpenKitchenToolkit"
echo Open http://127.0.0.1:3101 in your browser. Keep this window open for enabled schedules.
node dist\cli\cli.js local-serve --workspace "%KITCHEN_WORKSPACE%"
popd
endlocal
