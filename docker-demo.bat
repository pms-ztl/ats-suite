@echo off
REM Bring the whole CDC ATS app online with only Docker, and print the public URL.
REM Requires Docker Desktop running. First run builds all images (~20-30 min).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0docker-demo.ps1"
