@echo off
echo Starting LMS Bot in Development Mode...
echo.
echo Backend will run on http://localhost:3000
echo Frontend will run on http://localhost:5173
echo.
echo Press Ctrl+C to stop the servers
echo.

start "LMS Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start "LMS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Check the new terminal windows for logs
echo.
pause



