import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const orderCalls: Array<[string, { ascending: boolean }]> = [];
  const rangeCalls: Array<[number, number]> = [];

  function makeQuery() {
    const query: any = {
      select: vi.fn(() => query),
      order: vi.fn((column: string, options: { ascending: boolean }) => {
        orderCalls.push([column, options]);
        return query;
      }),
      range: vi.fn((from: number, to: number) => {
        rangeCalls.push([from, to]);
        return Promise.resolve({
          data: [
            {
              id: "1",
              title: "Busiest page",
              slug: "busiest-page",
              is_published: true,
              is_featured: false,
              scheduled_at: null,
              view_count: 900,
              created_at: "2026-01-05T00:00:00Z",
              author_id: null,
            },
          ],
          error: null,
          count: 1,
        });
      }),
      or: vi.fn(() => query),
    };
    return query;
  }

  const supabaseMock = {
    from: vi.fn(() => makeQuery()),
    rpc: vi.fn(() =>
      Promise.resolve({ data: { total: 1, published: 1, views: 900 }, error: null })
    ),
  };

  return { orderCalls, rangeCalls, supabaseMock };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: mocks.supabaseMock }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/indexnow.functions", () => ({ submitToIndexNow: vi.fn() }));
vi.mock("@/lib/router-compat", () => ({ useNavigate: () => vi.fn() }));

import ContentManager from "@/pages/admin/ContentManager";

const { orderCalls, rangeCalls, supabaseMock } = mocks;

describe("Content Manager table sorting", () => {
  beforeEach(() => {
    orderCalls.length = 0;
    rangeCalls.length = 0;
    supabaseMock.from.mockClear();
    supabaseMock.rpc.mockClear();
  });

  it("asks the database for the newest pages first on load", async () => {
    render(<ContentManager />);
    await waitFor(() => expect(screen.getByText("Busiest page")).toBeInTheDocument());

    expect(orderCalls[0]).toEqual(["created_at", { ascending: false }]);
  });

  it("sorts by view count when the Views header is clicked, then flips on the next click", async () => {
    render(<ContentManager />);
    await waitFor(() => expect(screen.getByText("Busiest page")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /views/i }));
    await waitFor(() =>
      expect(orderCalls.at(-1)).toEqual(["view_count", { ascending: false }])
    );

    fireEvent.click(screen.getByRole("button", { name: /views/i }));
    await waitFor(() =>
      expect(orderCalls.at(-1)).toEqual(["view_count", { ascending: true }])
    );
  });

  it("sorts by title when the Title header is clicked", async () => {
    render(<ContentManager />);
    await waitFor(() => expect(screen.getByText("Busiest page")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /title/i }));
    await waitFor(() => expect(orderCalls.at(-1)).toEqual(["title", { ascending: true }]));
  });

  it("returns to the first page when sorting changes", async () => {
    render(<ContentManager />);
    await waitFor(() => expect(screen.getByText("Busiest page")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /views/i }));
    await waitFor(() =>
      expect(orderCalls.at(-1)).toEqual(["view_count", { ascending: false }])
    );

    expect(rangeCalls.at(-1)).toEqual([0, 49]);
  });
});
