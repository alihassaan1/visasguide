

# Add File Upload + Simplify Monetization Settings UI

## What's Changing

Two improvements to the Monetization Settings page:

1. **Add drag-and-drop image upload** to the ImageUpload component so you can upload banner images directly from your computer (uploaded to the existing `content-images` Supabase storage bucket) instead of only pasting URLs.

2. **Simplify the affiliate banner UI** -- the current layout is dense with everything visible at once. The redesign will use a cleaner two-step flow.

## Detailed Changes

### 1. ImageUpload Component Upgrade (`src/components/admin/ImageUpload.tsx`)

Replace the URL-only input with a dual-mode component:
- **Upload tab**: Drag-and-drop zone + file picker button. Uploads to `content-images` bucket in Supabase Storage, returns the public URL.
- **URL tab**: Keep the existing paste-a-URL input as a fallback.
- Show image preview with a remove button for both modes.
- Add uploading state with a progress indicator.

### 2. Simplified Monetization Page (`src/pages/admin/MonetizationSettings.tsx`)

Streamline the affiliate banner cards:
- **Compact card layout**: Show banner name, position, active toggle, and a small image thumbnail in a single row. Analytics (impressions/clicks/CTR) shown inline as small badges instead of a large block.
- **Move advanced fields into the collapsible**: HTML embed code, targeting, and scheduling all go inside the existing "Targeting Options" collapsible (renamed to "Advanced Settings").
- **Image upload prominent**: The banner image upload (with the new drag-and-drop) becomes the primary visual element of each card, not hidden behind an `html_embed` conditional.
- **Cleaner header**: Remove the raw Input for the banner name and use an inline-editable text field that looks like a heading until clicked.

### 3. Copy the uploaded banner image

Copy `user-uploads://bazar.id_banner.png` to `src/assets/banners/bazar-id-banner.png` so it's available in the project. However, since the banner should be added through the admin UI (uploaded to Supabase Storage), this is just for reference -- the actual workflow will be uploading via the new drag-and-drop UI.

## Technical Details

### Files to create/modify:

| File | Change |
|------|--------|
| `src/components/admin/ImageUpload.tsx` | Add file upload via Supabase Storage (`content-images` bucket), drag-and-drop zone, tab toggle between Upload/URL modes |
| `src/pages/admin/MonetizationSettings.tsx` | Simplify card layout: compact rows, inline analytics badges, move HTML embed + targeting into single "Advanced Settings" collapsible, make image upload prominent |

### Upload flow:
1. User drops/selects an image file
2. File is uploaded to `content-images` bucket with path `banners/{timestamp}-{filename}`
3. Public URL is returned and saved to `image_url` field
4. Preview shown immediately

### No database or migration changes needed
The existing `content-images` storage bucket is already public and has the right configuration. The `image_url` column on `settings_affiliates` already stores the URL string.

