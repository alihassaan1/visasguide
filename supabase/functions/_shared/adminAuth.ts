import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * Verifies the caller is an authenticated admin.
 * Returns null on success; otherwise a Response to return directly.
 */
export async function requireAdmin(req: Request, corsHeaders: Record<string, string> = {}): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Use service role to check role (RLS on user_roles restricts reads)
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roles) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return null;
}

/**
 * Escape user-supplied text before embedding in HTML.
 */
export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validate a redirect URL is within our allowed origins.
 */
const ALLOWED_REDIRECT_HOSTS = [
  "visas.guide",
  "www.visas.guide",
  "visasguide.lovable.app",
];

export function isAllowedRedirect(target: string, extraHosts: string[] = []): boolean {
  try {
    const u = new URL(target);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    const allow = [...ALLOWED_REDIRECT_HOSTS, ...extraHosts];
    return allow.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}
