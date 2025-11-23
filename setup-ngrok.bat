@echo off
echo ========================================
echo  Setting up ngrok for development
echo ========================================
echo.
echo Installing ngrok globally...
npm install -g ngrok
echo.
echo Starting ngrok tunnel to port 5173...
echo.
echo IMPORTANT: Copy the HTTPS URL that appears below
echo and update your .env file:
echo   WEBAPP_URL=https://YOUR-NGROK-URL.ngrok.io
echo.
echo Then restart your backend server!
echo.
echo Press Ctrl+C to stop ngrok when done testing.
echo.
pause
ngrok http 5173

