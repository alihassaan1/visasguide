import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface AuditRow {
  id: string;
  created_at: string;
  table_name: string;
  record_id: string | null;
  action: string;
  changed_by: string | null;
  changed_by_email: string | null;
  actor_role: string | null;
  old_values: any;
  new_values: any;
  changed_fields: string[] | null;
  ddl_command: string | null;
  ddl_object: string | null;
  notes: string | null;
}

const TABLES = [
  "all",
  "site_settings",
  "affiliate_programs",
  "settings_affiliates",
  "affiliate_widgets",
  "user_roles",
  "admin_users",
  "rss_feeds",
  "platform_accounts",
];

export default function AuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (tableFilter !== "all") q = q.eq("table_name", tableFilter);
    const { data, error } = await q;
    if (!error && data) setRows(data as AuditRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableFilter]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.table_name.toLowerCase().includes(s) ||
      (r.changed_by_email ?? "").toLowerCase().includes(s) ||
      (r.ddl_command ?? "").toLowerCase().includes(s) ||
      (r.ddl_object ?? "").toLowerCase().includes(s) ||
      (r.changed_fields ?? []).join(",").toLowerCase().includes(s)
    );
  });

  const actionColor = (a: string) =>
    a === "insert" ? "default" : a === "update" ? "secondary" : a === "delete" ? "destructive" : "outline";

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Admin Audit Log</h1>
        <p className="text-muted-foreground">Every configuration and policy change is recorded here.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All tables" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search email, field, DDL object..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entries ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">When</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Table / Object</th>
                  <th className="p-2">Who</th>
                  <th className="p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isOpen = expanded === r.id;
                  const details =
                    r.action === "ddl"
                      ? `${r.ddl_command ?? ""} ${r.ddl_object ?? ""}`
                      : r.changed_fields?.length
                      ? r.changed_fields.join(", ")
                      : r.action === "insert"
                      ? "new record"
                      : r.action === "delete"
                      ? "record removed"
                      : "";
                  return (
                    <>
                      <tr
                        key={r.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                      >
                        <td className="p-2 whitespace-nowrap">
                          {format(new Date(r.created_at), "MMM d, yyyy HH:mm:ss")}
                        </td>
                        <td className="p-2">
                          <Badge variant={actionColor(r.action) as any}>{r.action}</Badge>
                        </td>
                        <td className="p-2 font-mono text-xs">{r.table_name}</td>
                        <td className="p-2">
                          {r.changed_by_email ? (
                            <span>{r.changed_by_email}</span>
                          ) : (
                            <span className="text-muted-foreground italic">
                              {r.actor_role ?? "system"}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground">{details}</td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-muted/30">
                          <td colSpan={5} className="p-3">
                            <div className="grid md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <div className="font-semibold mb-1">Old values</div>
                                <pre className="bg-background p-2 rounded-sm max-h-64 overflow-auto">
                                  {JSON.stringify(r.old_values, null, 2) || "—"}
                                </pre>
                              </div>
                              <div>
                                <div className="font-semibold mb-1">New values</div>
                                <pre className="bg-background p-2 rounded-sm max-h-64 overflow-auto">
                                  {JSON.stringify(r.new_values, null, 2) || "—"}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {!filtered.length && !loading && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No audit entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
