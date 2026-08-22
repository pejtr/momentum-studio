import { and, eq, lt, sql } from "drizzle-orm";
import { aiCreditAccounts, aiCreditUsage } from "../drizzle/schema";
import { getDb } from "./db";
import { aiRequestRateLimiter } from "./aiRateLimit";

export const AI_CREDIT_TOOLS = [
  "hermes",
  "pdf_summary",
  "test_case_generation",
  "xml_validation",
] as const;

export type AiCreditTool = (typeof AI_CREDIT_TOOLS)[number];

const DEFAULT_MONTHLY_ALLOWANCE = 30;

function getCurrentPeriodStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function getNextPeriodStart(periodStart: Date) {
  return new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + 1, 1));
}

async function ensureAccount(userId: number, periodStart: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db
    .insert(aiCreditAccounts)
    .values({
      userId,
      monthlyAllowance: DEFAULT_MONTHLY_ALLOWANCE,
      usedCredits: 0,
      periodStart,
    })
    .onDuplicateKeyUpdate({ set: { userId } });

  const account = await db
    .select()
    .from(aiCreditAccounts)
    .where(eq(aiCreditAccounts.userId, userId))
    .limit(1);

  if (!account[0]) throw new Error("AI credit account could not be initialized");
  return { db, account: account[0] };
}

async function getCurrentAccount(userId: number) {
  const currentPeriodStart = getCurrentPeriodStart();
  const { db, account } = await ensureAccount(userId, currentPeriodStart);

  if (account.periodStart < currentPeriodStart) {
    await db
      .update(aiCreditAccounts)
      .set({ periodStart: currentPeriodStart, usedCredits: 0 })
      .where(and(eq(aiCreditAccounts.id, account.id), lt(aiCreditAccounts.periodStart, currentPeriodStart)));
  }

  const refreshed = await db
    .select()
    .from(aiCreditAccounts)
    .where(eq(aiCreditAccounts.userId, userId))
    .limit(1);

  if (!refreshed[0]) throw new Error("AI credit account could not be loaded");
  return { db, account: refreshed[0] };
}

export type AiCreditStatus = {
  allowance: number;
  used: number;
  remaining: number;
  periodStart: Date;
  nextResetAt: Date;
};

function toStatus(account: {
  monthlyAllowance: number;
  usedCredits: number;
  periodStart: Date;
}): AiCreditStatus {
  return {
    allowance: account.monthlyAllowance,
    used: account.usedCredits,
    remaining: Math.max(0, account.monthlyAllowance - account.usedCredits),
    periodStart: account.periodStart,
    nextResetAt: getNextPeriodStart(account.periodStart),
  };
}

export async function getAiCreditStatus(userId: number): Promise<AiCreditStatus> {
  const { account } = await getCurrentAccount(userId);
  return toStatus(account);
}

export type AiCreditConsumption =
  | { allowed: true; status: AiCreditStatus }
  | { allowed: false; status: AiCreditStatus; reason: "exhausted" | "rate_limited"; retryAfterSeconds?: number };

/**
 * Reserves one server-owned credit before an AI request. The conditional update
 * prevents concurrent requests from exceeding a user's monthly allowance.
 */
export async function consumeAiCredit(
  userId: number,
  tool: AiCreditTool
): Promise<AiCreditConsumption> {
  const { db, account } = await getCurrentAccount(userId);
  const rateLimit = aiRequestRateLimiter.check(String(userId));
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      status: toStatus(account),
      reason: "rate_limited",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }
  const updateResult = await db
    .update(aiCreditAccounts)
    .set({ usedCredits: sql`${aiCreditAccounts.usedCredits} + 1` })
    .where(
      and(
        eq(aiCreditAccounts.id, account.id),
        sql`${aiCreditAccounts.usedCredits} < ${aiCreditAccounts.monthlyAllowance}`
      )
    );

  const updated = await db
    .select()
    .from(aiCreditAccounts)
    .where(eq(aiCreditAccounts.id, account.id))
    .limit(1);

  if (!updated[0]) throw new Error("AI credit account could not be updated");
  const status = toStatus(updated[0]);
  const affectedRows = Number(updateResult[0]?.affectedRows ?? 0);

  if (affectedRows !== 1) return { allowed: false, status, reason: "exhausted" };

  try {
    await db.insert(aiCreditUsage).values({
      userId,
      accountId: account.id,
      tool,
      credits: 1,
      periodStart: updated[0].periodStart,
    });
  } catch (error) {
    await db
      .update(aiCreditAccounts)
      .set({ usedCredits: sql`GREATEST(${aiCreditAccounts.usedCredits} - 1, 0)` })
      .where(eq(aiCreditAccounts.id, account.id));
    throw error;
  }

  return { allowed: true, status };
}
