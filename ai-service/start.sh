#!/bin/bash

# Flask AI Service Startup Script

echo "Starting Flask AI Deepfake Detection Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the Flask service
echo "Starting Flask service on port 5001..."
export PORT=5001
export DEBUG=false
python app.py
