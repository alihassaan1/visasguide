

# Newsletter Email Redesign Plan

## Issues Identified

1. **Broken blog images**: Featured image URLs are relative paths (e.g., `/blog/middle-east-air-travel-disruptions.jpg`) which don't resolve in email clients. Must be prefixed with `https://visas.guide`.

2. **Sponsor section broken**: Banner ad images are displayed as tiny 56x56 thumbnails in a text-heavy layout. They should display as full-width clickable banner images (same as the website sidebar), labeled "Our Sponsors" instead of "Travel Essentials".

3. **Article links (best practice)**: For secondary articles below the featured card, simple text links with a bottom border are the email best practice. Cards add visual weight and compete with the featured story. The current list style is correct -- just needs minor polish (no changes needed here).

4. **Country destinations section**: The flag emoji rendering depends on the email client and can look inconsistent. We can add a subtle CTA button per country card for better click-through.

## Changes

### File: `supabase/functions/send-newsletter-template/_templates/newsletter.tsx`

**Fix 1 -- Prepend base URL to relative image paths**
- In the featured story image and any blog post image, check if `featured_image_url` starts with `/` and prepend `https://visas.guide`
- This fixes the broken image alt-text showing instead of the actual image

**Fix 2 -- Redesign sponsor/affiliate section**
- Change heading from "Travel Essentials" / "Recommended by our travel experts" to "Our Sponsors"
- Replace the current 56x56 thumbnail + text row layout with a full-width image display per sponsor
- Each sponsor renders as: full-width clickable `<Img>` (same banner image from the database), no description text, just the image with a small "Sponsored" label above
- Remove the `dealImg`, `dealName`, `dealDesc`, `dealArrow` styles
- Add new `sponsorImg` style: `width: 100%, borderRadius: 8px, display: block`

**Fix 3 -- Improve country destination cards**
- Add a small "View Guide →" text link inside each destination card for a clearer CTA
- Keep the existing flag + name + visa-free count layout (it renders well)

### File: `supabase/functions/send-newsletter-template/index.ts`

**Fix 4 -- Pass full image URLs for affiliates**
- The `image_url` values from the database are already absolute Supabase storage URLs, so no change needed there
- For blog posts, transform relative `featured_image_url` to absolute URLs before passing to the template (belt-and-suspenders approach)

### Deployment
- Redeploy the `send-newsletter-template` edge function after changes

## Summary of Visual Changes

| Section | Before | After |
|---------|--------|-------|
| Featured image | Broken (relative URL) | Loads correctly |
| Secondary articles | Text list | Same (best practice) |
| Sponsors | Tiny thumbnail + text | Full-width banner image |
| Sponsor label | "Travel Essentials" | "Our Sponsors" |
| Country cards | Flag + name | Same + "View Guide →" CTA |

