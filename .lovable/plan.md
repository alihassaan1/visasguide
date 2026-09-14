# Remove long dashes from public content

## What will change
- Replace Unicode em dashes and en dashes in existing published articles, guides, SEO titles, descriptions, and excerpts.
- Preserve meaning by converting em dashes to commas and en dashes to standard hyphens, including numeric ranges.
- Update the main article-generation and RSS-rewrite flows so future content cannot save these characters.
- Remove the existing prompt instructions that explicitly tell the writer to use em dashes.
- Normalize hand-written public content templates used to create visa and ETIAS pages.

## Verification
- Recount affected database records and confirm none remain in public article fields.
- Check the edited generation paths and the latest preview build status.

## Technical details
- Apply output normalization after AI responses, not only prompt rules, so punctuation is cleaned even if a model ignores instructions.
- Limit database updates to visitor-facing text fields; URLs, image paths, admin labels, and source material remain unchanged.
