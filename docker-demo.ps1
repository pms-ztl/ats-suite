# ==========================================================================
#  docker-demo.ps1  -  Bring the WHOLE app online with only Docker, print URL.
#  Fresh machine needs only Docker Desktop. No Node, no npm.
#    1. Create .env from .env.example (you set OPENROUTER_API_KEY once).
#    2. docker compose up (builds all images first run, ~20-30 min).
#    3. Print + save the public tunnel URL.
# ==========================================================================
$ErrorActionPreference = "Continue"
$repo = $PSScriptRoot
Set-Location $repo
$compose = "docker-compose.demo.yml"

if (-not (Test-Path "$repo\.env")) {
  Copy-Item "$repo\.env.example" "$repo\.env" -ErrorAction SilentlyContinue
  Write-Host "Created .env from .env.example." -ForegroundColor Yellow
  Write-Host "Open .env, set OPENROUTER_API_KEY, then run this again." -ForegroundColor Yellow
  Read-Host "Press Enter to exit"; exit 1
}

Write-Host "==> Building + starting the full stack (first run builds images, ~20-30 min)..." -ForegroundColor Cyan
docker compose -f $compose up -d --build

Write-Host "==> Waiting for the public tunnel URL..." -ForegroundColor Cyan
$url = $null
for ($i=0; $i -lt 60; $i++) {
  Start-Sleep 5
  $logs = (docker compose -f $compose logs cloudflared 2>$null) -join "`n"
  $m = [regex]::Match($logs, 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($m.Success) { $url = $m.Value; break }
}
if ($url) {
  Set-Content "$repo\CURRENT-DEMO-URL.txt" $url -Encoding ascii
  Write-Host ""
  Write-Host "===================================================================" -ForegroundColor Green
  Write-Host "   YOUR DEMO IS LIVE AT:" -ForegroundColor Green
  Write-Host "       $url" -ForegroundColor White
  Write-Host "   (saved to CURRENT-DEMO-URL.txt)" -ForegroundColor DarkGray
  Write-Host "   Login: priya@pinnacle.demo / PinnacleDemo123!" -ForegroundColor DarkGray
  Write-Host "   Stop:  docker compose -f docker-compose.demo.yml down" -ForegroundColor DarkGray
  Write-Host "===================================================================" -ForegroundColor Green
} else {
  Write-Host "Tunnel URL not ready yet. Check: docker compose -f $compose logs cloudflared" -ForegroundColor Yellow
}
Read-Host "Press Enter to close (the stack keeps running)"
