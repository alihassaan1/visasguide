import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => {
  const from = vi.fn(() => ({ select: () => Promise.resolve({ data: [
    { setting_key: 'footer_links', setting_value: { popular_destinations: [], visa_types: [], resources: [] } },
    { setting_key: 'social_links', setting_value: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' } },
    { setting_key: 'analytics_settings', setting_value: { google_analytics_id: 'G-TEST' } },
  ], error: null }) }));
  return { from };
});
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }));
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import { PixelStatusDashboard } from '@/components/admin/PixelStatusDashboard';

describe('admin shared configuration reads', () => {
  it('loads settings once for both the editor and pixel summary', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><SiteSettingsManager /><PixelStatusDashboard /></QueryClientProvider>);
    await screen.findByDisplayValue('G-TEST');
    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.from).toHaveBeenCalledWith('site_settings');
  });
});