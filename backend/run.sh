#!/bin/bash

echo "Starting Cognitive Map Generator Backend..."
echo

if [ ! -d "venv" ]; then
    echo "Virtual environment not found!"
    echo "Please run setup.sh first to set up the environment."
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo
echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo

uvicorn main:app --reload --port 8000

