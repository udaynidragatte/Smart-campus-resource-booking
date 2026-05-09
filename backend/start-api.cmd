@echo off
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" src\server.js > api.log 2>&1
