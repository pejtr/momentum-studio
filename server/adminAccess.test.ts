import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";
import { notifyOwner } from "./_core/notification";

function createContext(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role
      ? {
          id: role === "admin" ? 990090 : 990091,
          openId: `rbac-test-${role}`,
          email: `${role}@example.test`,
          name: `RBAC ${role}`,
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin procedure access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects anonymous callers before the owner notification is sent", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.system.notifyOwner({ title: "Audit", content: "Denied" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("rejects standard users before the owner notification is sent", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.system.notifyOwner({ title: "Audit", content: "Denied" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("allows an admin caller through the guarded owner notification procedure", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.system.notifyOwner({ title: "Audit", content: "Allowed" })).resolves.toEqual({
      success: true,
    });
    expect(notifyOwner).toHaveBeenCalledWith({ title: "Audit", content: "Allowed" });
  });
});
