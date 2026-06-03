#!/usr/bin/env bash
set -o errexit

# 1. Build Frontend
echo "Building frontend..."
cd frontend
rm -rf dist  # Force delete old build
npm install
npm run build

# 2. Move build files to backend/static
echo "Moving files to backend/static..."
mkdir -p ../backend/static
rm -rf ../backend/static/*
cp -r dist/* ../backend/static/

# 3. Install backend dependencies
echo "Installing backend dependencies..."
cd ../backend
pip install -r requirements.txt