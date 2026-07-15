#!/bin/bash
# Backend setup script for Linux/macOS
set -e

echo "Setting up backend..."

cd "$(dirname "$0")/../backend"

echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "Backend setup complete!"
echo "Activate the virtual environment with: source backend/venv/bin/activate"
echo "Then run: cd backend && uvicorn app.main:app --reload --port 8000"
