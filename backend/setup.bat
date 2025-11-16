@echo off
echo Setting up Cognitive Map Generator Backend...
echo.

echo Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Get your Groq API key from https://console.groq.com
echo.
echo 2. Create a .env file in the backend directory with:
echo    LLM_API_KEY=your_groq_api_key_here
echo    LLM_BASE_URL=https://api.groq.com/openai/v1
echo    LLM_MODEL=llama-3.3-70b-versatile
echo    Note: Default is configured for Groq Llama 3.3
echo.
echo 3. Activate the virtual environment: venv\Scripts\activate
echo.
echo 4. Run the server: uvicorn main:app --reload --port 8000
echo.
pause

