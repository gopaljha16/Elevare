#!/bin/bash
set -e

echo "🚀 Starting Render Frontend Build..."
echo "=================================="

# Display versions
echo "📦 Environment Info:"
echo "   Node: $(node -v)"
echo "   NPM: $(npm -v)"
echo ""

# Navigate to frontend directory
cd frontend

# Clean previous builds and caches
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json dist .vite npm-cache
echo "   ✅ Cleaned"
echo ""

# Clear npm cache
echo "🗑️  Clearing npm cache..."
npm cache clean --force
echo "   ✅ Cache cleared"
echo ""

# Install exact versions (no upgrades)
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ Installation failed"
    exit 1
fi
echo "   ✅ Dependencies installed"
echo ""

# Display environment variables (without values for security)
echo "🔐 Environment Variables Check:"
if [ -n "$VITE_API_URL" ]; then
    echo "   ✅ VITE_API_URL is set"
else
    echo "   ⚠️  VITE_API_URL not set - will use fallback"
fi

if [ -n "$VITE_BACKEND_URL" ]; then
    echo "   ✅ VITE_BACKEND_URL is set"
else
    echo "   ⚠️  VITE_BACKEND_URL not set - will use fallback"
fi

if [ -n "$VITE_FRONTEND_URL" ]; then
    echo "   ✅ VITE_FRONTEND_URL is set"
else
    echo "   ⚠️  VITE_FRONTEND_URL not set - will use fallback"
fi
echo ""

# Build the application
echo "🔨 Building frontend..."
NODE_ENV=production npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "   ✅ Build successful"
echo ""

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build Output Verified:"
    echo "   Directory: dist/"
    echo "   Size: $(du -sh dist | cut -f1)"
    echo "   Files: $(find dist -type f | wc -l)"
    echo ""
    echo "📁 Main files:"
    ls -lh dist/*.html 2>/dev/null || echo "   (HTML files in subdirectories)"
    echo ""
else
    echo "❌ dist folder not found!"
    exit 1
fi

echo "=================================="
echo "✅ Frontend build completed successfully!"
echo "=================================="
