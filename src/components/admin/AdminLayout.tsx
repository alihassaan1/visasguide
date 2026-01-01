import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RedirectTarget = "/admin/auth" | "/" | null;

export function AdminLayout() {
  const { toast } = useToast();
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [redirectTo, setRedirectTo] = useState<RedirectTarget>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setRedirectTo("/admin/auth");
          return;
        }

        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (rolesError) throw rolesError;

        if (!roles || roles.length === 0) {
          if (!cancelled) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin panel.",
              variant: "destructive",
            });
            setRedirectTo("/");
          }
          return;
        }

        if (!cancelled) setRedirectTo(null);
      } catch {
        if (!cancelled) setRedirectTo("/admin/auth");
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    };

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
