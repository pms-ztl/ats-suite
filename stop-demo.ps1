# ==========================================================================
#  stop-demo.ps1  -  Take the demo OFFLINE (stops the public tunnel).
#  The local app keeps running; only the public URL goes away.
# ==========================================================================
$n = (Get-Process cloudflared -ErrorAction SilentlyContinue | Measure-Object).Count
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if ($n -gt 0) { Write-Host "Demo is now OFFLINE - the public link no longer works." -ForegroundColor Yellow }
else { Write-Host "No tunnel was running. Demo was already offline." -ForegroundColor DarkGray }
Write-Host "The local app on this PC keeps running. Run start-demo again to get a fresh public link."
