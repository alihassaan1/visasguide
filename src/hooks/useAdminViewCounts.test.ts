import { describe, expect, it, vi } from "vitest";
import { verifyAdminViewCountAccess } from "./useAdminViewCounts";

function client(userId: string | null, role: unknown = false, error: unknown = null) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null }, error: null }) },
    rpc: vi.fn().mockResolvedValue({ data: role, error }),
  };
}

describe("View counts are admin-only", () => {
  it("hides counts from signed-out visitors", async () => {
    const visitor = client(null);
    expect(await verifyAdminViewCountAccess(visitor)).toBe(false);
    expect(visitor.rpc).not.toHaveBeenCalled();
  });
  it("hides counts from signed-in non-admins", async () => {
    expect(await verifyAdminViewCountAccess(client("regular-user", false))).toBe(false);
  });
  it("allows only a backend-verified admin", async () => {
    const admin = client("admin-user", true);
    expect(await verifyAdminViewCountAccess(admin)).toBe(true);
    expect(admin.rpc).toHaveBeenCalledWith("has_role", { _user_id: "admin-user", _role: "admin" });
  });
  it("hides counts when role verification fails", async () => {
    expect(await verifyAdminViewCountAccess(client("admin-user", true, new Error("Unavailable")))).toBe(false);
  });
});