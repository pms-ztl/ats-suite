@echo off
REM Take the CDC ATS demo offline (stops all containers, keeps your data).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0docker-demo-stop.ps1"
pause
