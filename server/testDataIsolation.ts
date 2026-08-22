import { eq } from "drizzle-orm";
import {
  blogComments,
  blogPosts,
  collaborationSessions,
  containers,
  documentations,
  executions,
  marketplaceTemplates,
  profiles,
  scripts,
  templatePurchases,
  templateReviews,
  workspaceMembers,
  workspaces,
  aiCreditAccounts,
  aiCreditUsage,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Reserved, high numeric IDs used only by the test suite. They are deliberately
 * distinct from production identities so cleanup never touches user content.
 */
export const TEST_USER_IDS = {
  features: 990001,
  newFeatures: 990002,
  blog: 990003,
  credits: 990004,
  executionOwnership: 990005,
} as const;

/**
 * Removes only records owned by one reserved test identity. The order preserves
 * referential integrity if database constraints are enabled in a future deploy.
 */
export async function cleanupTestUserData(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(aiCreditUsage).where(eq(aiCreditUsage.userId, userId));
  await db.delete(aiCreditAccounts).where(eq(aiCreditAccounts.userId, userId));

  await db.delete(templatePurchases).where(eq(templatePurchases.userId, userId));
  await db.delete(templateReviews).where(eq(templateReviews.userId, userId));
  await db.delete(marketplaceTemplates).where(eq(marketplaceTemplates.creatorId, userId));

  await db.delete(documentations).where(eq(documentations.userId, userId));
  await db.delete(collaborationSessions).where(eq(collaborationSessions.userId, userId));
  await db.delete(executions).where(eq(executions.userId, userId));
  await db.delete(containers).where(eq(containers.userId, userId));
  await db.delete(profiles).where(eq(profiles.userId, userId));
  await db.delete(scripts).where(eq(scripts.userId, userId));

  await db.delete(workspaceMembers).where(eq(workspaceMembers.userId, userId));
  await db.delete(workspaces).where(eq(workspaces.ownerId, userId));

  await db.delete(blogComments).where(eq(blogComments.userId, userId));
  await db.delete(blogPosts).where(eq(blogPosts.authorId, userId));
}
