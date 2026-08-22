import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990028,
      openId: "collaboration-input-bounds",
      email: "collaboration-input-bounds@example.test",
      name: "Collaboration Input Bounds",
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

describe("collaboration input bounds", () => {
  it("rejects invalid workspace and script IDs before owner-scoped access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.collaboration.getMembers({ workspaceId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.collaboration.getActiveSessions({ scriptId: -1 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects oversized workspace metadata and out-of-range session state", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.collaboration.createWorkspace({
      name: "QA collaboration",
      description: "x".repeat(10_001),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.collaboration.updateSession({
      scriptId: 1,
      cursorPosition: { x: 1_000_001, y: 0 },
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.collaboration.updateSession({ scriptId: 1, selectedNodeId: "x".repeat(129) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
