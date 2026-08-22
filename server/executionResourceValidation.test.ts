import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990027,
      openId: "execution-resource-bounds",
      email: "execution-resource-bounds@example.test",
      name: "Execution Resource Bounds",
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

describe("execution resource identifier bounds", () => {
  it("rejects invalid script and profile IDs before execution startup", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.execution.execute({ scriptId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.execution.execute({ scriptId: 1, profileId: -1 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects invalid execution IDs before lifecycle or report operations", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.execution.stop({ executionId: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.reports.exportPDF({ executionId: -1 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
