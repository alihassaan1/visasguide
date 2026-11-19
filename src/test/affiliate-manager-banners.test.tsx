import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const saved = vi.fn(async (_input: { data: Record<string, unknown> }) => ({ id: '979395b4-cc52-461c-9204-4be1767efecd' }));
  const inserted = vi.fn();
  let banners: Record<string, unknown>[] = [];
  const from = vi.fn((table: string) => {
    const rows = table === 'affiliate_programs' ? [{ id: 'program', name: 'Upflare', slug: 'upflare', partner_id: null, description: null, is_active: true }] : table === 'settings_affiliates' ? banners : [];
    const query = {
      select: () => query,
      eq: () => query,
      order: async () => ({ data: rows, error: null }),
      single: async () => ({ data: { setting_value: {} }, error: null }),
      insert: async (payload: Record<string, unknown>) => {
        inserted(payload);
        banners.push({ ...payload, id: '979395b4-cc52-461c-9204-4be1767efecd', click_count: 0, impressions: 0, image_url: null, start_date: null, end_date: null });
        return { error: null };
      },
      then: (resolve: (result: unknown) => void) => resolve({ data: rows, error: null }),
    };
    return query;
  });
  return { saved, inserted, from, reset: () => { banners = []; } };
});
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@/lib/affiliate-banners.functions', () => ({ saveAffiliateBanner: mocks.saved }));
vi.mock('@/lib/r2-upload.functions', () => ({ uploadImageToR2: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/components/admin/CountryMultiSelect', () => ({ CountryMultiSelect: () => null }));
import AffiliateManager from '@/pages/admin/AffiliateManager';

describe('generic affiliate banner save flow', () => {
  beforeEach(() => { mocks.reset(); mocks.saved.mockClear(); mocks.inserted.mockClear(); mocks.from.mockClear(); });
  it('adds a program-linked banner and saves the supplied Upflare code without GetYourGuide fields', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><AffiliateManager /></QueryClientProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Manage' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Add Banner' }));
    await waitFor(() => expect(mocks.inserted).toHaveBeenCalledWith(expect.objectContaining({ affiliate_program: 'upflare', is_active: false })));
    const tab = await screen.findByRole('tab', { name: 'Script / HTML' });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    fireEvent.focus(tab);
    const code = '<a href="https://app.upflare.com/aff.php?aff=91" target="_blank" rel="sponsored noopener"><img src="https://app.upflare.com/templates/upflare/img/affiliate/upflare-wide.png" width="728" height="90" alt="Domains &amp; web hosting by Upflare"></a>';
    fireEvent.change(screen.getByRole('textbox', { name: 'Affiliate Banner Code' }), { target: { value: code } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mocks.saved).toHaveBeenCalledWith({ data: expect.objectContaining({ html_embed: code, image_url: null, id: '979395b4-cc52-461c-9204-4be1767efecd', positions: ['sidebar-right'] }) }));
    expect(mocks.saved.mock.calls[0]?.[0]?.data).not.toHaveProperty('tour_id');
    expect(mocks.from.mock.calls.filter(([table]) => table === 'site_settings')).toHaveLength(1);
    expect(mocks.from.mock.calls.filter(([table]) => table === 'cities')).toHaveLength(0);
    expect(mocks.from.mock.calls.filter(([table]) => table === 'affiliate_widgets')).toHaveLength(1);
  });
  it.each([
    ['Homepage: Below Hero (Horizontal)', 'homepage-below-hero'],
    ['Homepage: Above Footer (Horizontal)', 'homepage-above-footer'],
  ])('saves a banner selected for %s', async (label, position) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><AffiliateManager /></QueryClientProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Manage' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Add Banner' }));
    const tab = await screen.findByRole('tab', { name: 'Script / HTML' });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    fireEvent.focus(tab);
    fireEvent.change(screen.getByRole('textbox', { name: 'Affiliate Banner Code' }), {
      target: { value: '<script src="https://affiliate.example/banner.js"></script>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sidebar Right' }));
    fireEvent.click(screen.getByRole('button', { name: label }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(mocks.saved).toHaveBeenCalledWith({ data: expect.objectContaining({ positions: [position] }) }));
  });
});