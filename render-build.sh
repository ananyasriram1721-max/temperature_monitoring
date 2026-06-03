#!/usr/bin/env bash
set -o errexit

# Install frontend dependencies and build
cd frontend
npm install
npm run build

# Move build files to backend/static
cp -r dist/* ../backend/static/

# Install backend dependencies
cd ../backend
pip install -r requirements.txt