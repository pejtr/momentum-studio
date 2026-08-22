import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990025,
      openId: "documentation-input-bounds",
      email: "documentation-input-bounds@example.test",
      name: "Documentation Input Bounds",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("documentation input bounds", () => {
  it("rejects invalid script and document resource identifiers before access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.documentation.list({ scriptId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.documentation.generate({ scriptId: -1, title: "QA documentation" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects oversized titles and document body edits before database writes", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.documentation.update({ id: 1, title: "x".repeat(256) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.documentation.update({ id: 1, content: "x".repeat(16_001) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
