import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990020,
      openId: "hermes-query-bounds",
      email: "hermes-query-bounds@example.test",
      name: "HERMES Query Bounds",
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

describe("HERMES query bounds", () => {
  it("rejects malformed or oversized session identifiers before history access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.hermes.getHistory({ sessionId: "invalid session", limit: 50 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.hermes.clearSession({ sessionId: "x".repeat(65) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects out-of-range history and memory list requests", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.hermes.getHistory({ sessionId: "valid_session-1", limit: 101 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.hermes.getMemory({ limit: 101 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects non-positive memory identifiers before deletion", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.hermes.deleteMemory({ id: 0 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
