import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

type AccessClient = {
  auth: { getUser: () => PromiseLike<{ data: { user: { id: string } | null }; error: unknown }> };
  rpc: (name: "has_role", input: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: unknown; error: unknown }>;
};

/** A saved browser flag or a signed-in non-admin must never enable the counter. */
export async function verifyAdminViewCountAccess(client: AccessClient): Promise<boolean> {
  try {
    const user = await client.auth.getUser();
    if (user.error || !user.data.user) return false;
    const role = await client.rpc("has_role", { _user_id: user.data.user.id, _role: "admin" });
    return !role.error && role.data === true;
  } catch {
    return false;
  }
}

// One check and auth subscription shared by all counters; no session data in SSR.
const listeners = new Set<() => void>();
let allowed = false;
let revision = 0;
let cleanup: (() => void) | undefined;

function publish(value: boolean) {
  if (allowed === value) return;
  allowed = value;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    const check = async () => {
      const current = ++revision;
      const result = await verifyAdminViewCountAccess(supabase);
      if (current === revision && listeners.size) publish(result);
    };
    void check();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      ++revision;
      publish(false);
      if (timer) clearTimeout(timer);
      // Do not call Supabase methods inside its auth event callback.
      if (event !== "SIGNED_OUT") timer = setTimeout(() => { void check(); }, 0);
    });
    cleanup = () => { subscription.unsubscribe(); if (timer) clearTimeout(timer); };
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      ++revision;
      cleanup?.();
      cleanup = undefined;
      allowed = false;
    }
  };
}

export function useAdminViewCounts() {
  return useSyncExternalStore(subscribe, () => allowed, () => false);
}