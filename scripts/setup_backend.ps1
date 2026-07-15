# Backend setup script for Windows PowerShell
Write-Host "Setting up backend..." -ForegroundColor Green

Set-Location "$PSScriptRoot\..\backend"

Write-Host "Creating virtual environment..."
python -m venv venv
& .\venv\Scripts\Activate.ps1

Write-Host "Installing dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host ""
Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host "Activate the virtual environment with: .\backend\venv\Scripts\Activate.ps1"
Write-Host "Then run: cd backend && uvicorn app.main:app --reload --port 8000"
