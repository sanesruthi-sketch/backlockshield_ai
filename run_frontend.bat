@echo off
title CampusIQ Frontend
cd /d "%~dp0"
echo ===================================================
echo Starting CampusIQ Frontend (React 18 + Vite)
echo ===================================================

if not exist node_modules (
    echo [1/2] Installing dependencies (first run only, please wait)...
    call npm install
)

echo [2/2] Launching Vite server on http://localhost:3000...
call npm run dev
pause
