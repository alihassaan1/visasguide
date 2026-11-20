import { z } from 'zod';
import { normalizeImageUrl, validateAffiliateEmbed } from './affiliate-embed';
import { BANNER_POSITIONS } from './banner-placements';

export const bannerSaveSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  target_url: z.string().trim().max(4096),
  html_embed: z.string().max(100_000).nullable(),
  image_url: z.string().max(4096).nullable(),
  positions: z.array(z.enum(BANNER_POSITIONS)).min(1).max(BANNER_POSITIONS.length),
  priority: z.number().int(),
  target_countries: z.array(z.string().max(100)).max(250),
  exclude_countries: z.array(z.string().max(100)).max(250),
  target_page_patterns: z.array(z.string().max(500)).max(100),
  start_date: z.string().datetime().nullable(),
  end_date: z.string().datetime().nullable(),
  affiliate_program: z.string().trim().max(100).nullable().optional(),
}).transform((data, context) => {
  const code = data.html_embed?.trim() || null;
  let image: string | null = null;
  let target = '';
  try {
    if (code) {
      const error = validateAffiliateEmbed(code);
      if (error) throw new Error(error);
    } else {
      image = normalizeImageUrl(data.image_url || '');
      if (!image) throw new Error('Add a banner image or affiliate script before saving.');
    }
    target = normalizeImageUrl(data.target_url);
    if (!code && !target) throw new Error('Add the banner target URL.');
  } catch (error) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : 'Invalid banner creative.' });
    return z.NEVER;
  }
  return { ...data, target_url: target, html_embed: code, image_url: image, position: data.positions[0] };
});