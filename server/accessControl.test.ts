import { describe, expect, it } from "vitest";
import { canAccessAdminRoute, getAccessibleMenuItems } from "../client/src/lib/accessControl";

describe("role-aware frontend access", () => {
  it("allows only administrators through the privileged-route decision", () => {
    expect(canAccessAdminRoute(null)).toBe(false);
    expect(canAccessAdminRoute({ role: "user" })).toBe(false);
    expect(canAccessAdminRoute({ role: "admin" })).toBe(true);
  });

  it("removes administrator-only menu items for standard users", () => {
    const items = [
      { path: "/", requiresAdmin: false },
      { path: "/docker", requiresAdmin: true },
    ];

    expect(getAccessibleMenuItems(items, { role: "user" }).map((item) => item.path)).toEqual(["/"]);
    expect(getAccessibleMenuItems(items, { role: "admin" }).map((item) => item.path)).toEqual(["/", "/docker"]);
  });
});
