#!/bin/bash
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean any existing node_modules and lock files
echo "Cleaning frontend dependencies..."
cd frontend
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps flag
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

# Build the frontend
echo "Building frontend..."
npm run build

echo "Build completed successfully!"
