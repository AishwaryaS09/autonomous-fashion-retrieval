#!/bin/bash
# Frontend setup script for Linux/macOS
set -e

echo "Setting up frontend..."

cd "$(dirname "$0")/../frontend"

echo "Installing dependencies..."
npm install

echo ""
echo "Frontend setup complete!"
echo "Run: cd frontend && npm run dev"
