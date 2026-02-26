
# Auto-Resize and Compress Banner Images on Upload

## The Problem

A 1.5MB high-resolution image is being uploaded as-is to Supabase Storage and served directly to visitors. The sidebar banner only renders at 280px wide, so all those extra pixels are wasted bandwidth that slows page load.

## The Solution

Add client-side image resizing and WebP conversion in the `ImageUpload` component before uploading to Supabase Storage. This happens transparently -- the user drops a 1.5MB PNG and a ~30-50KB WebP gets uploaded.

### How it works:

1. User selects/drops an image (any size)
2. The browser draws it onto an off-screen `<canvas>`, scaled down to fit within max dimensions
3. The canvas exports as WebP at 85% quality (falls back to JPEG if WebP isn't supported)
4. The compressed blob (typically 20-80KB for banners) is uploaded to Supabase Storage

### Resize targets by position:

The `ImageUpload` component already accepts props, so we add optional `maxWidth` and `maxHeight`:

- **Sidebar banners**: 560x800 (2x of 280px display width for retina)
- **Horizontal banners**: 1200x400
- **Default/general**: 1200x800

The `MonetizationSettings` page will pass appropriate dimensions based on the banner position.

## Technical Details

### File: `src/components/admin/ImageUpload.tsx`

Add a `resizeImage` helper function that:
- Creates an off-screen canvas
- Calculates scaled dimensions preserving aspect ratio
- Draws the image and exports as WebP (quality 0.85)
- Returns a `File` object ready for upload
- Always converts to `.webp` extension for the storage path

New props added to `ImageUploadProps`:
- `maxWidth?: number` (default: 1200)
- `maxHeight?: number` (default: 800)

The `uploadFile` function is modified to call `resizeImage(file, maxWidth, maxHeight)` before uploading. The upload status text changes to "Optimizing..." then "Uploading..." to reflect both steps.

### File: `src/pages/admin/MonetizationSettings.tsx`

Pass `maxWidth` and `maxHeight` to the `ImageUpload` component based on the banner's `position` field:
- `sidebar-left` / `sidebar-right`: maxWidth=560, maxHeight=800
- `horizontal-banner`: maxWidth=1200, maxHeight=400
- `in-content` / `footer`: maxWidth=1200, maxHeight=600

### No database or storage changes needed

The compressed WebP files are smaller and upload to the same `content-images` bucket. Storage paths change extension to `.webp` but everything else stays the same.
