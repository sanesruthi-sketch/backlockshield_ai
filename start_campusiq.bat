@echo off
title CampusIQ Launcher
cd /d "%~dp0"
echo ===================================================
echo   CampusIQ — AI Student Success Platform
echo   HacXLerate 2026 · Team DEBUG MASTERS
echo ===================================================
echo.
echo Launching MongoDB Atlas Backend server in Terminal 1...
start "CampusIQ MongoDB Backend (Port 5000)" cmd /k "run_backend.bat"

echo Launching Frontend server in Terminal 2...
start "CampusIQ Frontend (Port 3000)" cmd /k "run_frontend.bat"

echo.
echo ===================================================
echo Both servers have been launched!
echo Opening browser at http://localhost:3000 in 4 seconds...
echo ===================================================
timeout /t 4 >nul
start http://localhost:3000
