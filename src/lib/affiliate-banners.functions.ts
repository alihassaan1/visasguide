import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bannerSaveSchema } from './affiliate-banner-data';

export const saveAffiliateBanner = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bannerSaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc('has_role', {
      _user_id: context.userId, _role: 'admin',
    });
    if (roleError || !isAdmin) throw new Error('Admin access is required to save banners.');
    const { id, ...updates } = data;
    const { data: saved, error } = await context.supabase.from('settings_affiliates')
      .update(updates).eq('id', id).select('id').single();
    if (error || !saved) throw new Error('Banner could not be saved. Please try again.');
    return { id: saved.id };
  });