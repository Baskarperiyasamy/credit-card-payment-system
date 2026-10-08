@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo Ledgerly Credit Card Payment System
echo ==============================================
echo.
echo Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop is not running. Start Docker Desktop and run this file again.
  pause
  exit /b 1
)

echo Starting all services...
docker compose up --build -d
if errorlevel 1 (
  echo.
  echo Docker failed to start the project.
  pause
  exit /b 1
)

echo.
echo Waiting for services...
timeout /t 12 /nobreak >nul

echo.
echo Main application: http://localhost:3000
echo Django API:       http://localhost:8000/api/docs/
echo Django Admin:     http://localhost:8000/admin/
echo FastAPI Swagger:   http://localhost:8001/docs
echo Mailpit:           http://localhost:8025
echo.
start "" http://localhost:3000
start "" http://localhost:8025
pause
