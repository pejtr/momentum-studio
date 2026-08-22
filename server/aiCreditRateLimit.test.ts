import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

const { rateCheckMock } = vi.hoisted(() => ({ rateCheckMock: vi.fn() }));

vi.mock("./aiRateLimit", () => ({
  aiRequestRateLimiter: { check: rateCheckMock },
}));

import { consumeAiCredit } from "./aiCredits";
import { aiCreditUsage } from "../drizzle/schema";
import { getDb } from "./db";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";

const TEST_USER_ID = TEST_USER_IDS.credits;

beforeEach(async () => {
  rateCheckMock.mockReset();
  rateCheckMock.mockReturnValue({ allowed: false, retryAfterSeconds: 37 });
  await cleanupTestUserData(TEST_USER_ID);
});

afterEach(async () => cleanupTestUserData(TEST_USER_ID));

describe("AI credit rate limiting", () => {
  it("rejects a throttled request without spending a credit", async () => {
    const result = await consumeAiCredit(TEST_USER_ID, "hermes");
    const db = await getDb();
    const usage = await db?.select().from(aiCreditUsage).where(eq(aiCreditUsage.userId, TEST_USER_ID));

    expect(result).toMatchObject({
      allowed: false,
      reason: "rate_limited",
      retryAfterSeconds: 37,
      status: { allowance: 30, used: 0, remaining: 30 },
    });
    expect(usage).toHaveLength(0);
  });
});
