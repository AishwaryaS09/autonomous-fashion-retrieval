# Frontend setup script for Windows PowerShell
Write-Host "Setting up frontend..." -ForegroundColor Green

Set-Location "$PSScriptRoot\..\frontend"

Write-Host "Installing dependencies..."
npm install

Write-Host ""
Write-Host "Frontend setup complete!" -ForegroundColor Green
Write-Host "Run: cd frontend && npm run dev"
