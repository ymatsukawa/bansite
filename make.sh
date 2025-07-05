#!/bin/bash

# Build script for Ban List Chrome Extension

set -e

echo "Building Ban List Chrome Extension..."

# Create build directory
BUILD_DIR="build"
DIST_DIR="dist"
SRC_DIR="src"

# Clean previous builds
rm -rf "$BUILD_DIR"
rm -rf "$DIST_DIR"

# Create build directory
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

# Copy source files to build directory
cp -r "$SRC_DIR"/* "$BUILD_DIR"/

# Get version from manifest.json
VERSION=$(grep '"version"' "$BUILD_DIR/manifest.json" | sed 's/.*"version": "\([^"]*\)".*/\1/')

# Create zip file
ZIP_NAME="ban-list-v${VERSION}.zip"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/$ZIP_NAME" .
cd ..

echo "Extension built successfully!"
echo "ZIP file created: $DIST_DIR/$ZIP_NAME"
echo "Build directory: $BUILD_DIR"

# List contents
echo -e "\nBuild contents:"
ls -la "$BUILD_DIR"

echo -e "\nDistribution files:"
ls -la "$DIST_DIR"