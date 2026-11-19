import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/page-data.functions', () => ({
  getContentPageData: mocks.get, getCountryGuideData: mocks.get, getVisaRequirementData: mocks.get,
  getBlogArticleData: mocks.get, getCityPageData: mocks.get, getPublicListingData: mocks.get,
}));
import { loadPublicDetail } from '@/lib/public-route-data';
import { seedQueries } from '@/lib/seedQueries';

describe('public detail request caching', () => {
  beforeEach(() => mocks.get.mockReset());
  it('reuses the same detail request on repeat navigation', async () => {
    mocks.get.mockResolvedValue(JSON.stringify([[['content-page', 'guide'], { title: 'Guide', content: '<p>Guide</p>' }]]));
    const client = new QueryClient();
    const first = await loadPublicDetail(client, 'content', 'guide');
    const second = await loadPublicDetail(client, 'content', 'guide');
    expect(first.path).toBe('/guide');
    expect(second.title).toBe(first.title);
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });
  it('refreshes detail content without replacing fresh shared countries', () => {
    const client = new QueryClient();
    client.setQueryData(['shared', 'countries'], [{ slug: 'france', name: 'France' }]);
    client.setQueryData(['content-page', 'guide'], { title: 'Old' });
    seedQueries(client, [[['shared', 'countries'], []], [['content-page', 'guide'], { title: 'Updated' }]]);
    expect(client.getQueryData(['shared', 'countries'])).toEqual([{ slug: 'france', name: 'France' }]);
    expect(client.getQueryData(['content-page', 'guide'])).toEqual({ title: 'Updated' });
  });
});