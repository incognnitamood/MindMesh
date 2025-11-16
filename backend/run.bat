@echo off
echo Starting Cognitive Map Generator Backend...
echo.

if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please run setup.bat first to set up the environment.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --port 8000

