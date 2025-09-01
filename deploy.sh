#!/bin/bash

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Copy build to root for easy deployment
cp -r dist ../public

echo "✅ Deployment ready!"
echo "📁 Frontend build: ./public"
echo "🔧 Backend: Ready for Railway/Render"