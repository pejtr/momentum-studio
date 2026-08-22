import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { engagementRouter } from "./engagementRouter";
import { appRouter } from "./routers";

const context: TrpcContext = {
  user: {
    id: 990007,
    openId: "pagination-bounds-test",
    email: "pagination@example.test",
    name: "Pagination Test",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("list pagination bounds", () => {
  it("rejects oversized and zero execution limits before querying the database", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.executions.list({ limit: 101 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.executions.list({ limit: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects non-integer marketplace and AI conversation limits", async () => {
    const caller = appRouter.createCaller(context);

    await expect(caller.marketplace.list({ limit: 1.5 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.ai.getHistory({ limit: 100.5 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects oversized engagement history limits", async () => {
    const caller = engagementRouter.createCaller(context);

    await expect(caller.ai.commentHistory({ limit: 101 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
