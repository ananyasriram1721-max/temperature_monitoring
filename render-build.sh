#!/usr/bin/env bash
set -o errexit

# 1. Build Frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# 2. Move build files to backend/static
# Note: Based on your screenshot, Vite usually outputs to 'dist'
echo "Moving files to backend/static..."
rm -rf ../backend/static/*
cp -r dist/* ../backend/static/

# 3. Install backend dependencies
echo "Installing backend dependencies..."
cd ../backend
pip install -r requirements.txt