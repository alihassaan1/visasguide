import { render, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useVisitorLocation } from '@/hooks/useVisitorLocation';
import { useDetectedCountry } from '@/hooks/useDetectedCountry';

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
function Consumers() {
  useVisitorLocation(); useVisitorLocation(); useVisitorLocation(); useDetectedCountry();
  return null;
}
describe('shared optional visitor location', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllGlobals());
  it('makes one request for concurrent banners and passport detection', async () => {
    const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ country_code: 'PK', country_name: 'Pakistan', city: 'Karachi' }) }));
    vi.stubGlobal('fetch', fetch);
    const client = new QueryClient();
    render(<Consumers />, { wrapper: wrapper(client) });
    await waitFor(() => expect(client.getQueryData(['visitor-location'])).toEqual({ countryCode: 'PK', countryName: 'Pakistan', city: 'Karachi' }));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('does not retry failed requests on remount', async () => {
    const fetch = vi.fn(async () => { throw new Error('blocked'); });
    vi.stubGlobal('fetch', fetch);
    const client = new QueryClient();
    const first = renderHook(useVisitorLocation, { wrapper: wrapper(client) });
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));
    first.unmount();
    const next = renderHook(useVisitorLocation, { wrapper: wrapper(client) });
    await waitFor(() => expect(next.result.current.isLoading).toBe(false));
    expect(next.result.current.countryCode).toBe('');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('still resolves when browser storage is unavailable', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ country_code: 'GB' }) })));
    const hook = renderHook(useVisitorLocation, { wrapper: wrapper(new QueryClient()) });
    await waitFor(() => expect(hook.result.current.countryCode).toBe('GB'));
    get.mockRestore(); set.mockRestore();
  });
});