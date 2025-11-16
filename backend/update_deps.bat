@echo off
echo Updating backend dependencies...
echo.

if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Upgrading pip...
pip install --upgrade pip

echo.
echo Installing/updating dependencies...
pip install --upgrade -r requirements.txt

echo.
echo Dependencies updated successfully!
echo.
pause


