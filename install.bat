@echo off
echo ========================================
echo  LMS Telegram Bot - Installation
echo ========================================
echo.

echo [1/5] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/5] Creating environment file...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please edit it with your bot token.
) else (
    echo .env file already exists, skipping...
)

echo.
echo [4/5] Creating uploads directories...
if not exist uploads mkdir uploads
if not exist uploads\materials mkdir uploads\materials

echo.
echo [5/5] Installation complete!
echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo.
echo 1. Edit .env file and add your Telegram Bot Token
echo 2. Run 'npm run dev' to start the backend server
echo 3. In another terminal, run 'cd frontend' and 'npm run dev'
echo 4. Open the mini app in Telegram!
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
pause














