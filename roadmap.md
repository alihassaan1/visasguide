# Google indexing repair

- [x] Repair initial HTML loading across public content route families.
- [x] Add server-rendered page-specific metadata and canonical URLs; handle missing pages and legacy URLs correctly.
- [x] Verify report URLs and representative routes without JavaScript, and run regression tests.
- [x] Report publishing and Google recrawl requirements without promising rankings.

# Article spacing repair

- [x] Remove empty content spacers and standardize public article spacing without changing saved content.
- [x] Verify affected guides, news, country and visa pages at desktop and mobile widths.

# Article text formatting

- [x] Standardize public article text colors, bold headings and sizes, including pasted formatting.
- [x] Verify the reported article and representative templates on desktop and mobile.
## R2 CDN Migration (cdn.visas.guide)
- [x] Store R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY secrets
- [ ] Verify S3 API access + find bucket name
- [ ] Server upload function → R2 (future images)
- [ ] Switch ImageUpload.tsx to R2
- [ ] Migrate existing images (public/, src/assets, Supabase storage) to R2
- [ ] Update image URL references
