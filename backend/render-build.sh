#!/bin/bash

echo "🔧 Starting Render build process..."

# Install dependencies, but allow optional dependencies to fail
echo "📦 Installing dependencies..."
npm install --no-optional

# Try to install canvas if system dependencies are available
echo "🎨 Attempting to install canvas (optional)..."
npm install canvas 2>/dev/null || echo "⚠️  Canvas installation failed - PDF parsing will be disabled"

# Try to install pdf-parse
echo "📄 Attempting to install pdf-parse (optional)..."
npm install pdf-parse 2>/dev/null || echo "⚠️  pdf-parse installation failed - PDF parsing will be disabled"

echo "✅ Build complete!"
