@echo off
cls
echo ============================================
echo  LMS Telegram Bot - Start with ngrok
echo ============================================
echo.
echo This script will help you set up everything!
echo.
echo REQUIREMENTS:
echo 1. Frontend must be running on port 5173
echo 2. You need a free ngrok account (https://ngrok.com)
echo 3. You need your bot token from @BotFather
echo.
pause
echo.

echo [Step 1] Installing ngrok...
call npm install -g ngrok
if %errorlevel% neq 0 (
    echo Error installing ngrok. Please install manually.
    pause
    exit /b 1
)
echo ✓ ngrok installed!
echo.

echo [Step 2] ngrok Authentication
echo.
echo Please visit: https://dashboard.ngrok.com/get-started/your-authtoken
echo Copy your authtoken and paste it here:
echo.
set /p NGROK_TOKEN="Enter your ngrok authtoken: "
echo.
echo Configuring ngrok...
call ngrok config add-authtoken %NGROK_TOKEN%
echo ✓ ngrok authenticated!
echo.

echo [Step 3] Starting ngrok tunnel...
echo.
echo ============================================
echo  IMPORTANT INSTRUCTIONS:
echo ============================================
echo.
echo 1. ngrok will start and show you an HTTPS URL
echo    Example: https://abc123.ngrok-free.app
echo.
echo 2. COPY that HTTPS URL!
echo.
echo 3. Open your .env file and update:
echo    WEBAPP_URL=https://your-ngrok-url.ngrok-free.app
echo.
echo 4. Restart your backend server (Terminal 2)
echo    Press Ctrl+C, then run: npm run dev
echo.
echo 5. Update @BotFather:
echo    - Send /myapps
echo    - Select your app
echo    - Edit Web App URL
echo    - Enter your ngrok HTTPS URL
echo.
echo 6. Test in Telegram!
echo    - Send /start to your bot
echo    - Click "Open LMS"
echo.
echo ============================================
echo.
echo Starting ngrok now...
echo Press Ctrl+C when you're done testing.
echo.
pause

ngrok http 5173



