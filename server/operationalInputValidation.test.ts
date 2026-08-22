import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990029,
      openId: "operational-input-bounds",
      email: "operational-input-bounds@example.test",
      name: "Operational Input Bounds",
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

describe("operational input bounds", () => {
  it("rejects invalid execution status identifiers and oversized error messages", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.executions.updateStatus({ id: 0, status: "failed" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.executions.updateStatus({
      id: 1,
      status: "failed",
      error: "x".repeat(5_001),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid container connection and lifecycle identifiers before writes", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.containers.create({ name: "Worker", host: "worker.local", port: 65_536 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.containers.update({ id: -1, name: "Worker" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.containers.delete({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
