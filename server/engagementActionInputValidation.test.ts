import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990026,
      openId: "engagement-action-bounds",
      email: "engagement-action-bounds@example.test",
      name: "Engagement Action Bounds",
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

describe("engagement action and monitor input bounds", () => {
  it("rejects invalid action targets and oversized errors before writes", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.engagement.actions.create({
      campaignId: 1,
      platform: "instagram",
      actionType: "comment",
      targetUrl: "not-a-url",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.actions.update({
      id: 1,
      status: "failed",
      error: "x".repeat(5_001),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects excessive monitor templates, action lists and daily limits", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.engagement.hashtags.create({
      platform: "instagram",
      hashtag: "qa",
      commentTemplates: Array.from({ length: 21 }, () => "Template"),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.hashtags.update({
      id: 1,
      engagementActions: ["like", "comment", "follow", "like"],
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.hashtags.update({ id: 1, maxActionsPerDay: 10_001 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
