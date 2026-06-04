# ==========================================================================
#  start-demo.ps1  -  Bring the CDC ATS demo ONLINE and print its public URL.
#
#  ONE command does all of this:
#    1. Starts infrastructure (Postgres / Redis / NATS) via Docker.
#    2. Starts the backend services if they are not already running.
#    3. Starts the frontend (production build) on http://localhost:3000.
#    4. Opens a free Cloudflare tunnel and PRINTS THE PUBLIC URL in the window.
#    5. Saves the URL to CURRENT-DEMO-URL.txt so you can read it any time.
#
#  The app stays online until you reboot or run stop-demo.ps1.
#  No Claude needed to find the URL - it is printed here and saved to the file.
#
#  ONE-TIME setup per machine (not per run):
#    - Docker Desktop installed and running
#    - Node.js 20+  and a one-time `npm install` in this folder
#    - A `.env` file in this folder holding your keys (OPENROUTER_API_KEY, etc.)
#    cloudflared installs itself automatically if missing.
#
#  RUN IT:
#    Double-click start-demo.bat   (easiest)
#    or in a terminal:  powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
# ==========================================================================

$ErrorActionPreference = "Continue"
$repo = $PSScriptRoot
Set-Location $repo

function Test-Port([int]$p) {
  try { return (Test-NetConnection -ComputerName localhost -Port $p -WarningAction SilentlyContinue).TcpTestSucceeded }
  catch { return $false }
}
function Section($m) { Write-Host ""; Write-Host "==> $m" -ForegroundColor Cyan }

Section "CDC ATS demo launcher"

# --- 1. Find (or install) cloudflared ------------------------------------
$cf = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $cf) {
  foreach ($p in @("C:\Program Files (x86)\cloudflared\cloudflared.exe","C:\Program Files\cloudflared\cloudflared.exe")) {
    if (Test-Path $p) { $cf = $p; break }
  }
}
if (-not $cf) {
  Section "Installing cloudflared (one-time)..."
  winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements --disable-interactivity | Out-Null
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
  $cf = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
  if (-not $cf) { foreach ($p in @("C:\Program Files (x86)\cloudflared\cloudflared.exe","C:\Program Files\cloudflared\cloudflared.exe")) { if (Test-Path $p) { $cf = $p; break } } }
}
if (-not $cf) { Write-Host "ERROR: cloudflared is not installed and auto-install failed. Get it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ then re-run." -ForegroundColor Red; Read-Host "Press Enter to exit"; exit 1 }

# --- 2. Infrastructure (Postgres / Redis / NATS) -------------------------
Section "Starting infrastructure (Postgres / Redis / NATS)..."
docker compose -f infra/docker-compose.yml up -d 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "    infra ok" -ForegroundColor Green }
else { Write-Host "    WARNING: could not start infra. Is Docker Desktop running?" -ForegroundColor Yellow }

# --- 3. Backend services -------------------------------------------------
if (Test-Port 4000) {
  Write-Host "    backend already running on :4000" -ForegroundColor Green
} else {
  Section "Starting backend services (~30-60s)..."
  Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev:backend" -WorkingDirectory $repo -WindowStyle Minimized
  for ($i=0; $i -lt 90; $i++) { if (Test-Port 4000) { break }; Start-Sleep 2 }
  if (Test-Port 4000) { Write-Host "    backend up" -ForegroundColor Green } else { Write-Host "    WARNING: gateway :4000 not up yet; continuing anyway." -ForegroundColor Yellow }
}

# --- 4. Frontend (production build) --------------------------------------
if (Test-Port 3000) {
  Write-Host "    frontend already running on :3000" -ForegroundColor Green
} else {
  Section "Starting frontend..."
  $env:NEXT_PUBLIC_API_URL = "/api"
  $env:GATEWAY_ORIGIN = "http://localhost:4000"
  if (-not (Test-Path "$repo\apps\frontend\.next")) {
    Write-Host "    building frontend (first run, ~2-3 min)..."
    Push-Location "$repo\apps\frontend"; cmd /c "npm run build"; Pop-Location
  }
  Start-Process -FilePath "npm.cmd" -ArgumentList "run","start" -WorkingDirectory "$repo\apps\frontend" -WindowStyle Minimized
  for ($i=0; $i -lt 40; $i++) { if (Test-Port 3000) { break }; Start-Sleep 2 }
  if (Test-Port 3000) { Write-Host "    frontend up" -ForegroundColor Green } else { Write-Host "    WARNING: frontend :3000 not up yet." -ForegroundColor Yellow }
}

# --- 5. Public tunnel ----------------------------------------------------
Section "Opening public tunnel..."
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 1
$log = "$repo\.cloudflared-demo.log"
Remove-Item "$log","$log.err" -Force -ErrorAction SilentlyContinue
Start-Process -FilePath $cf -ArgumentList "tunnel","--url","http://localhost:3000" -RedirectStandardOutput $log -RedirectStandardError "$log.err" -WindowStyle Hidden
$url = $null
for ($i=0; $i -lt 30; $i++) {
  Start-Sleep 2
  $txt = (Get-Content "$log","$log.err" -ErrorAction SilentlyContinue) -join "`n"
  $m = [regex]::Match($txt, 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($m.Success) { $url = $m.Value; break }
}

# --- 6. Show the URL -----------------------------------------------------
if ($url) {
  Set-Content -Path "$repo\CURRENT-DEMO-URL.txt" -Value $url -Encoding ascii
  Write-Host ""
  Write-Host "===================================================================" -ForegroundColor Green
  Write-Host "   YOUR DEMO IS LIVE AT:" -ForegroundColor Green
  Write-Host ""
  Write-Host "       $url" -ForegroundColor White
  Write-Host ""
  Write-Host "   (also saved in CURRENT-DEMO-URL.txt next to this script)" -ForegroundColor DarkGray
  Write-Host "   Login:  priya@pinnacle.demo  /  PinnacleDemo123!" -ForegroundColor DarkGray
  Write-Host "   Super:  super@cdc-ats.demo   /  DemoSuper-2026!" -ForegroundColor DarkGray
  Write-Host "-------------------------------------------------------------------" -ForegroundColor Green
  Write-Host "   Keep this machine ON. To take the demo offline: stop-demo.bat" -ForegroundColor DarkGray
  Write-Host "   If the link will not open on THIS PC, turn on your browser's" -ForegroundColor DarkGray
  Write-Host "   'Secure DNS' (set to Cloudflare). Others open it normally." -ForegroundColor DarkGray
  Write-Host "===================================================================" -ForegroundColor Green
  Write-Host ""
} else {
  Write-Host "ERROR: the tunnel did not return a URL. See $log.err" -ForegroundColor Red
}
Read-Host "Press Enter to close this window (the demo keeps running in the background)"
