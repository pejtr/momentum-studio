import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";
import { engagementRouter } from "./engagementRouter";
import { aiCommentHistory } from "../drizzle/schema";
import { createAICommentHistory, getDb } from "./db";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";

const OWNER_ID = TEST_USER_IDS.engagementOwner;
const OTHER_USER_ID = TEST_USER_IDS.engagementOther;

function createContext(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `engagement-owner-test-${userId}`,
      email: `engagement-${userId}@example.test`,
      name: `Engagement ${userId}`,
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

beforeEach(async () => {
  await cleanupTestUserData(OWNER_ID);
  await cleanupTestUserData(OTHER_USER_ID);
});
afterEach(async () => {
  await cleanupTestUserData(OWNER_ID);
  await cleanupTestUserData(OTHER_USER_ID);
});

describe("engagement ownership", () => {
  it("does not expose or mutate another user's campaigns, actions, or hashtag monitors", async () => {
    const owner = engagementRouter.createCaller(createContext(OWNER_ID));
    const otherUser = engagementRouter.createCaller(createContext(OTHER_USER_ID));

    const campaign = await owner.campaigns.create({
      profileId: 1,
      name: "Owner-only engagement campaign",
      platform: "instagram",
      type: "comment",
    });
    const action = await owner.actions.create({
      campaignId: campaign.id,
      platform: "instagram",
      actionType: "comment",
      content: "Owner action",
    });
    const monitor = await owner.hashtags.create({ platform: "instagram", hashtag: "owneronly" });

    await expect(otherUser.campaigns.get({ id: campaign.id })).resolves.toBeUndefined();
    await expect(otherUser.campaigns.update({ id: campaign.id, name: "Hijacked" })).resolves.toBeUndefined();
    await expect(otherUser.actions.list({ campaignId: campaign.id })).resolves.toEqual([]);
    await expect(otherUser.actions.update({ id: action!.id, status: "completed" })).resolves.toBeUndefined();
    await expect(otherUser.hashtags.get({ id: monitor.id })).resolves.toBeUndefined();
    await expect(otherUser.hashtags.update({ id: monitor.id, isActive: false })).resolves.toBeUndefined();

    const ownerCampaign = await owner.campaigns.get({ id: campaign.id });
    const ownerMonitor = await owner.hashtags.get({ id: monitor.id });
    expect(ownerCampaign).toMatchObject({ name: "Owner-only engagement campaign", userId: OWNER_ID });
    expect(ownerMonitor).toMatchObject({ hashtag: "owneronly", userId: OWNER_ID });
  });

  it("does not allow another user to update AI comment feedback", async () => {
    const owner = engagementRouter.createCaller(createContext(OWNER_ID));
    const otherUser = engagementRouter.createCaller(createContext(OTHER_USER_ID));
    const entry = await createAICommentHistory({
      userId: OWNER_ID,
      platform: "instagram",
      postContent: "Owner-only comment history",
      generatedComment: "Owner comment",
      wasUsed: 0,
    });

    await otherUser.ai.updateFeedback({ id: entry.id, feedback: "bad" });
    const db = await getDb();
    const [persisted] = await db!.select().from(aiCommentHistory).where(eq(aiCommentHistory.id, entry.id));
    expect(persisted).toMatchObject({ userId: OWNER_ID, feedback: null });

    await owner.ai.updateFeedback({ id: entry.id, feedback: "good" });
    const [ownedFeedback] = await db!.select().from(aiCommentHistory).where(eq(aiCommentHistory.id, entry.id));
    expect(ownedFeedback).toMatchObject({ userId: OWNER_ID, feedback: "good" });
  });
});
