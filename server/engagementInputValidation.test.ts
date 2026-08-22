import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990021,
      openId: "engagement-input-bounds",
      email: "engagement-input-bounds@example.test",
      name: "Engagement Input Bounds",
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

describe("engagement campaign input bounds", () => {
  it("rejects unstructured campaign update payloads before a database operation", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.engagement.campaigns.update({
      id: 1,
      targetCriteria: { arbitraryPayload: "not allowed" },
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.campaigns.update({
      id: 1,
      actionConfig: { commentTemplates: ["x".repeat(5_001)] },
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects inverted target ranges and excessive collections", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.engagement.campaigns.create({
      profileId: 1,
      name: "QA engagement check",
      platform: "instagram",
      type: "comment",
      targetCriteria: { minLikes: 100, maxLikes: 10 },
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.campaigns.update({
      id: 1,
      targetCriteria: { hashtags: Array.from({ length: 31 }, (_, index) => `qa-${index}`) },
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid campaign, profile and AI feedback identifiers before data access", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.engagement.campaigns.get({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.campaigns.create({
      profileId: -1,
      name: "QA engagement check",
      platform: "instagram",
      type: "comment",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.engagement.ai.updateFeedback({ id: 1.5, feedback: "good" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
