import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { aiCreditAccounts, aiCreditUsage } from "../drizzle/schema";
import { consumeAiCredit, getAiCreditStatus } from "./aiCredits";
import { getDb } from "./db";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const TEST_USER_ID = TEST_USER_IDS.credits;

function currentPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

beforeEach(async () => cleanupTestUserData(TEST_USER_ID));
afterEach(async () => cleanupTestUserData(TEST_USER_ID));

describe("AI credit usage", () => {
  it("does not expose credit status to an anonymous caller", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} },
      res: { clearCookie: () => {} },
    } as TrpcContext);

    await expect(caller.ai.credits()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("initializes an isolated monthly allowance for the authenticated user", async () => {
    const status = await getAiCreditStatus(TEST_USER_ID);

    expect(status).toMatchObject({ allowance: 30, used: 0, remaining: 30 });
    expect(status.periodStart).toEqual(currentPeriodStart());
  });

  it("atomically consumes one credit and writes a user-owned audit record", async () => {
    const consumption = await consumeAiCredit(TEST_USER_ID, "xml_validation");

    expect(consumption.allowed).toBe(true);
    if (!consumption.allowed) return;
    expect(consumption.status).toMatchObject({ allowance: 30, used: 1, remaining: 29 });

    const db = await getDb();
    const usage = await db?.select().from(aiCreditUsage).where(eq(aiCreditUsage.userId, TEST_USER_ID));

    expect(usage).toHaveLength(1);
    expect(usage?.[0]).toMatchObject({ tool: "xml_validation", credits: 1, userId: TEST_USER_ID });
  });

  it("does not exceed an exhausted allocation or create a new usage record", async () => {
    const db = await getDb();
    await db?.insert(aiCreditAccounts).values({
      userId: TEST_USER_ID,
      monthlyAllowance: 1,
      usedCredits: 1,
      periodStart: currentPeriodStart(),
    });

    const consumption = await consumeAiCredit(TEST_USER_ID, "hermes");
    const usage = await db?.select().from(aiCreditUsage).where(eq(aiCreditUsage.userId, TEST_USER_ID));

    expect(consumption.allowed).toBe(false);
    expect(consumption.status).toMatchObject({ allowance: 1, used: 1, remaining: 0 });
    expect(usage).toHaveLength(0);
  });
});
