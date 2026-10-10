@echo off
title CampusIQ MongoDB Atlas API Server (Port 5000)
cd /d "%~dp0"
echo ===================================================
echo CampusIQ MongoDB Atlas Server
echo Connection: blai.dxi8wl7.mongodb.net
echo Database: students
echo Collection: datas
echo ===================================================

if not exist node_modules (
    echo Installing dependencies (first run only, please wait)...
    call npm install
)

node server.js
pause
