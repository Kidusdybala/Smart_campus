@echo off
echo 🔄 Restarting ML Service with MongoDB connection...

REM Kill any existing ML service processes
taskkill /f /im python.exe /fi "WINDOWTITLE eq ML Service*" >nul 2>&1
taskkill /f /im python.exe /fi "IMAGENAME eq python.exe" >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start the ML service
echo 🚀 Starting ML Service...
cd /d "%~dp0"
python app.py

echo ✅ ML Service restarted!
echo 🔍 Check http://localhost:5002/health for connection status
pause