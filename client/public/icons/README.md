# PWA Icons

This folder should contain the following PNG icons for the PWA:

## Required Icons:
- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels  
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels (required for PWA install prompt)
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels (required for PWA)

## How to Generate Icons:

### Option 1: Online Generator
1. Go to https://pwa-asset-generator.nicepkg.cn/ or https://www.pwabuilder.com/imageGenerator
2. Upload your logo (SVG or PNG with transparent background)
3. Download the generated icon pack
4. Extract to this folder

### Option 2: Figma/Design Tool
1. Create a 512x512 canvas
2. Design your app icon (recommended: rounded corners, simple design)
3. Export at all required sizes
4. Save to this folder with the naming convention above

### Option 3: Command Line (ImageMagick)
```bash
# If you have ImageMagick installed
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
# ... and so on for all sizes
```

## Icon Design Guidelines:
- **Primary Color**: Use #0f766e (teal-700) as the main background color
- **Icon Style**: Simple, recognizable at small sizes
- **Format**: PNG with transparency or solid background
- **Shape**: Square with rounded corners (maskable)

## Current Status:
⚠️ Placeholder icons needed - add your actual app icons here for full PWA functionality.
