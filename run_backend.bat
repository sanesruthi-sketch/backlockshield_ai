@echo off
title CampusIQ MongoDB Backend (Port 5000)
cd /d "%~dp0"
echo ===================================================
echo Starting CampusIQ MongoDB Backend API Server
echo Host: http://localhost:5000
echo MongoDB Atlas: blai.dxi8wl7.mongodb.net
echo Target Database: students
echo Target Collection: datas
echo ===================================================

if not exist node_modules (
    echo Installing dependencies (first run only, please wait)...
    call npm install
)

node server.js
pause
