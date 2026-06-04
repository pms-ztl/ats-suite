@echo off
REM Double-click this file (or run it in cmd) to put the CDC ATS demo online.
REM It prints the public URL in the window and saves it to CURRENT-DEMO-URL.txt
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-demo.ps1"
