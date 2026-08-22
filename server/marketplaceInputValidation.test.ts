import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990024,
      openId: "marketplace-input-bounds",
      email: "marketplace-input-bounds@example.test",
      name: "Marketplace Input Bounds",
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

describe("marketplace input bounds", () => {
  it("rejects oversized template metadata and invalid price before writes", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.marketplace.create({
      name: "QA template",
      description: "x".repeat(10_001),
      platform: "multi",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.marketplace.create({
      name: "QA template",
      platform: "multi",
      price: -1,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid public filters and oversized review content", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.marketplace.list({ category: "x".repeat(101) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.marketplace.addReview({
      templateId: 1,
      rating: 5,
      comment: "x".repeat(5_001),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
