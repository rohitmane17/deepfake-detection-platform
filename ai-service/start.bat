@echo off
REM Flask AI Service Startup Script for Windows

echo Starting Flask AI Deepfake Detection Service...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the Flask service
echo Starting Flask service on port 5001...
set PORT=5001
set DEBUG=false
python app.py
