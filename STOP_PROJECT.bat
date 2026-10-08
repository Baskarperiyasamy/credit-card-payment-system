@echo off
setlocal
cd /d "%~dp0"
echo Stopping Ledgerly services...
docker compose down
if errorlevel 1 pause
