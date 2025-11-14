#!/bin/bash
# Test Vercel build locally before deploying

echo "=========================================="
echo "Testing Vercel Build Locally"
echo "=========================================="
echo ""

# Check Node version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo ""

# Navigate to frontend
cd frontend

# Clean everything
echo "Cleaning node_modules and lock files..."
rm -rf node_modules package-lock.json dist
echo "✓ Cleaned"
echo ""

# Install dependencies
echo "Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "✗ Installation failed"
    exit 1
fi
echo "✓ Installation successful"
echo ""

# Build
echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "✗ Build failed"
    exit 1
fi
echo "✓ Build successful"
echo ""

# Check output
if [ -d "dist" ]; then
    echo "✓ dist folder created"
    echo "Build output size:"
    du -sh dist
    echo ""
    echo "Files in dist:"
    ls -lh dist
else
    echo "✗ dist folder not found"
    exit 1
fi

echo ""
echo "=========================================="
echo "Build test completed successfully!"
echo "You can now deploy to Vercel"
echo "=========================================="
