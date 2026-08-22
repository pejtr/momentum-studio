import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990027,
      openId: "core-resource-id-validation",
      email: "core-resource-id-validation@example.test",
      name: "Core Resource ID Validation",
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

describe("core CRUD resource identifiers", () => {
  it("rejects invalid script, profile and execution resource identifiers before data access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.scripts.get({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.profiles.get({ id: -1 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.executions.create({ scriptId: 1.5 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.executions.create({ scriptId: 1, profileId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
