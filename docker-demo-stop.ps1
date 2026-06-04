# ==========================================================================
#  docker-demo-stop.ps1  -  Take the demo OFFLINE.
#  Stops all containers (frontend + backend + infra + tunnel).
#  Your data is KEPT (the seeded tenants/candidates stay for next time).
#  To also wipe data, run: docker compose -f docker-compose.demo.yml down -v
# ==========================================================================
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot
docker compose -f docker-compose.demo.yml down
Write-Host ""
Write-Host "Demo is OFFLINE. Your data was kept." -ForegroundColor Yellow
Write-Host "Start it again any time by double-clicking docker-demo.bat" -ForegroundColor DarkGray
