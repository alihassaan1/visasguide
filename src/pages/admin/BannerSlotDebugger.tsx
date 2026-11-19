import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BANNER_POSITIONS, bannerMatchesPosition, type BannerPosition } from '@/lib/banner-placements';

const POSITIONS = BANNER_POSITIONS;

const SAMPLE_ROUTES = [
  "/",
  "/countries/jordan",
  "/jordan/amman",
  "/schengen-visa-guide",
  "/processing-times",
  "/passport-index",
  "/news",
  "/blog/some-post",
];

interface Banner {
  id: string;
  name: string;
  is_active: boolean;
  position: string | null;
  positions: string[] | null;
  priority: number | null;
  target_countries: string[] | null;
  exclude_countries: string[] | null;
  target_page_patterns: string[] | null;
  start_date: string | null;
  end_date: string | null;
  impressions: number | null;
  click_count: number;
}

function matchesPattern(url: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${regexPattern}$`, "i").test(url);
}

function eligible(b: Banner, country: string, path: string): { ok: boolean; reason?: string } {
  if (!b.is_active) return { ok: false, reason: "inactive" };
  const now = new Date();
  if (b.start_date && new Date(b.start_date) > now) return { ok: false, reason: "not started" };
  if (b.end_date && new Date(b.end_date) < now) return { ok: false, reason: "expired" };
  if (b.target_countries?.length && (!country || !b.target_countries.includes(country)))
    return { ok: false, reason: `country not in target [${b.target_countries.join(",")}]` };
  if (b.exclude_countries?.length && country && b.exclude_countries.includes(country))
    return { ok: false, reason: "country excluded" };
  if (b.target_page_patterns?.length) {
    const hit = b.target_page_patterns.some((p) => matchesPattern(path, p));
    if (!hit) return { ok: false, reason: `no pattern match (${b.target_page_patterns.join(", ")})` };
  }
  return { ok: true };
}

function bannerSlots(b: Banner): string[] {
  const set = new Set<string>();
  (b.positions || []).forEach((p) => set.add(p));
  if (b.position) set.add(b.position);
  return Array.from(set);
}

export default function BannerSlotDebugger() {
  const [country, setCountry] = useState("");
  const [customPath, setCustomPath] = useState("");

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banner-debug-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings_affiliates").select("*");
      if (error) throw error;
      return (data || []) as Banner[];
    },
  });

  const routes = useMemo(() => {
    const r = [...SAMPLE_ROUTES];
    if (customPath && !r.includes(customPath)) r.unshift(customPath);
    return r;
  }, [customPath]);

  // Per-route selected banner per slot (weighted highest-priority deterministic pick)
  function pickForSlot(path: string, slot: BannerPosition): Banner | null {
    const candidates = banners
      .filter((b) => bannerMatchesPosition(b, slot, path))
      .filter((b) => eligible(b, country, path).ok)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return candidates[0] || null;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Banner Slot Debugger</h1>
        <p className="text-sm text-muted-foreground">
          Preview which banner would win each slot per route. Highest-priority eligible banner shown
          (live site uses weighted random — priority weights the roll).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="country">Visitor country code (ISO-2)</Label>
            <Input
              id="country"
              placeholder="e.g. US, AE, IN (blank = no country)"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().trim())}
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="path">Add custom route</Label>
            <Input
              id="path"
              placeholder="/your/path"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slot winners per route</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading banners…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  {POSITIONS.map((p) => (
                    <TableHead key={p}>{p}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route}>
                    <TableCell className="font-mono text-xs">{route}</TableCell>
                    {POSITIONS.map((slot) => {
                      const winner = pickForSlot(route, slot);
                      return (
                        <TableCell key={slot}>
                          {winner ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{winner.name}</div>
                              <div className="text-xs text-muted-foreground">
                                priority {winner.priority ?? 0} · {winner.impressions ?? 0} imp ·{" "}
                                {winner.click_count} clk
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Targeting</TableHead>
                <TableHead>Stats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => {
                const slots = bannerSlots(b);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>
                      <Badge variant={b.is_active ? "default" : "secondary"}>
                        {b.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {slots.length ? (
                          slots.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">none</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{b.priority ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.target_countries?.length ? `target: ${b.target_countries.join(",")}` : "all countries"}
                      {b.exclude_countries?.length ? ` · excl: ${b.exclude_countries.join(",")}` : ""}
                      {b.target_page_patterns?.length
                        ? ` · pages: ${b.target_page_patterns.join(", ")}`
                        : " · all pages"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {b.impressions ?? 0} imp / {b.click_count} clk
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
