import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990023,
      openId: "script-graph-bounds",
      email: "script-graph-bounds@example.test",
      name: "Script Graph Bounds",
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

describe("script graph input bounds", () => {
  it("rejects excessive graph node and edge collections before a script write", async () => {
    const caller = appRouter.createCaller(createContext());
    const node = { id: "node", type: "action", position: { x: 0, y: 0 }, data: {} };
    const edge = { id: "edge", source: "node", target: "node" };

    await expect(caller.scripts.create({
      name: "Oversized graph",
      nodes: Array.from({ length: 501 }, () => node),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.scripts.update({
      id: 1,
      edges: Array.from({ length: 1_001 }, () => edge),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects oversized node metadata and malformed graph identifiers", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.scripts.create({
      name: "Large node data",
      nodes: [{
        id: "node-1",
        type: "action",
        position: { x: 0, y: 0 },
        data: { prompt: "x".repeat(20_001) },
      }],
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.scripts.create({
      name: "Invalid edge",
      edges: [{ id: "edge-1", source: "", target: "next" }],
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
