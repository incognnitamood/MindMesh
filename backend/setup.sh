#!/bin/bash

echo "Setting up Cognitive Map Generator Backend..."
echo

echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Failed to create virtual environment"
    exit 1
fi

echo
echo "Activating virtual environment..."
source venv/bin/activate

echo
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies"
    exit 1
fi

echo
echo "Setup complete!"
echo
echo "Next steps:"
echo "1. Get your Groq API key from https://console.groq.com"
echo
echo "2. Create a .env file in the backend directory with:"
echo "   LLM_API_KEY=your_groq_api_key_here"
echo "   LLM_BASE_URL=https://api.groq.com/openai/v1"
echo "   LLM_MODEL=llama-3.3-70b-versatile"
echo "   Note: Default is configured for Groq Llama 3.3"
echo
echo "3. Activate the virtual environment: source venv/bin/activate"
echo
echo "4. Run the server: uvicorn main:app --reload --port 8000"
echo

