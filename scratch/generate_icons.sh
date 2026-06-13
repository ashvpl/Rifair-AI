#!/bin/bash
set -e

WORKSPACE_DIR="/Users/ayushpatil/Documents/Rifair AI"
LOGO_SRC="$WORKSPACE_DIR/Rifair_ai_logo-removebg-preview.png"

echo "Generating favicon sizes from: $LOGO_SRC"

# 1. Generate local sizes in the workspace root
sips -z 32 32 "$LOGO_SRC" --out "$WORKSPACE_DIR/favicon.ico"
sips -z 96 96 "$LOGO_SRC" --out "$WORKSPACE_DIR/favicon-96x96.png"
sips -z 180 180 "$LOGO_SRC" --out "$WORKSPACE_DIR/apple-touch-icon.png"
sips -z 192 192 "$LOGO_SRC" --out "$WORKSPACE_DIR/web-app-manifest-192x192.png"
sips -z 512 512 "$LOGO_SRC" --out "$WORKSPACE_DIR/web-app-manifest-512x512.png"

# 2. Copy/overwrite to frontend/app
cp "$WORKSPACE_DIR/favicon.ico" "$WORKSPACE_DIR/frontend/app/favicon.ico"

# 3. Copy/overwrite to frontend/public
cp "$WORKSPACE_DIR/favicon.ico" "$WORKSPACE_DIR/frontend/public/favicon.ico"
cp "$WORKSPACE_DIR/favicon-96x96.png" "$WORKSPACE_DIR/frontend/public/favicon-96x96.png"
cp "$WORKSPACE_DIR/apple-touch-icon.png" "$WORKSPACE_DIR/frontend/public/apple-touch-icon.png"
cp "$WORKSPACE_DIR/web-app-manifest-192x192.png" "$WORKSPACE_DIR/frontend/public/web-app-manifest-192x192.png"
cp "$WORKSPACE_DIR/web-app-manifest-512x512.png" "$WORKSPACE_DIR/frontend/public/web-app-manifest-512x512.png"

# 4. Copy favicon.svg from root to frontend/public just in case they differ
cp "$WORKSPACE_DIR/favicon.svg" "$WORKSPACE_DIR/frontend/public/favicon.svg"

echo "All favicons generated and copied successfully!"
