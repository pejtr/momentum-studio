import { eq, and, desc, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, scripts, profiles, executions, containers, templates, 
  InsertScript, InsertProfile, InsertExecution, InsertContainer,
  workspaces, InsertWorkspace, workspaceMembers, InsertWorkspaceMember,
  collaborationSessions, InsertCollaborationSession,
  marketplaceTemplates, InsertMarketplaceTemplate,
  templateReviews, InsertTemplateReview,
  templatePurchases, InsertTemplatePurchase,
  documentations, InsertDocumentation,
  blogPosts, InsertBlogPost,
  blogCategories, InsertBlogCategory,
  blogTags, InsertBlogTag,
  blogComments, InsertBlogComment,
  engagementCampaigns, InsertEngagementCampaign,
  engagementActions, InsertEngagementAction,
  hashtagMonitors, InsertHashtagMonitor,
  aiCommentHistory, InsertAICommentHistory,
  aiConversations, InsertAIConversation
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
export const MAX_LIST_QUERY_LIMIT = 100;

function boundedListLimit(limit: number): number {
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIST_QUERY_LIMIT);
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Scripts ==========
export async function getScriptsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scripts).where(eq(scripts.userId, userId)).orderBy(desc(scripts.updatedAt));
}

export async function getScriptById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scripts).where(and(eq(scripts.id, id), eq(scripts.userId, userId))).limit(1);
  return result[0];
}

export async function createScript(data: InsertScript) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(scripts).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateScript(id: number, userId: number, data: Partial<InsertScript>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(scripts).set(data).where(and(eq(scripts.id, id), eq(scripts.userId, userId)));
}

export async function deleteScript(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(scripts).where(and(eq(scripts.id, id), eq(scripts.userId, userId)));
}

// ========== Profiles ==========
export async function getProfilesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(profiles).where(eq(profiles.userId, userId)).orderBy(desc(profiles.updatedAt));
}

export async function getProfileById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(and(eq(profiles.id, id), eq(profiles.userId, userId))).limit(1);
  return result[0];
}

export async function createProfile(data: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(profiles).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateProfile(id: number, userId: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(profiles).set(data).where(and(eq(profiles.id, id), eq(profiles.userId, userId)));
}

export async function deleteProfile(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(profiles).where(and(eq(profiles.id, id), eq(profiles.userId, userId)));
}

// ========== Executions ==========
export async function getExecutionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(executions).where(eq(executions.userId, userId)).orderBy(desc(executions.createdAt)).limit(boundedListLimit(limit));
}

export async function createExecution(data: InsertExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(executions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getExecutionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(executions).where(and(eq(executions.id, id), eq(executions.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateExecution(id: number, userId: number, data: Partial<InsertExecution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(executions).set(data).where(and(eq(executions.id, id), eq(executions.userId, userId)));
  const [execution] = await db
    .select()
    .from(executions)
    .where(and(eq(executions.id, id), eq(executions.userId, userId)))
    .limit(1);
  return execution;
}

// ========== Containers ==========
export async function getContainersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(containers).where(eq(containers.userId, userId)).orderBy(desc(containers.updatedAt));
}

export async function createContainer(data: InsertContainer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(containers).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateContainer(id: number, userId: number, data: Partial<InsertContainer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(containers).set(data).where(and(eq(containers.id, id), eq(containers.userId, userId)));
}

export async function deleteContainer(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(containers).where(and(eq(containers.id, id), eq(containers.userId, userId)));
}

// ========== Templates ==========
export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).orderBy(templates.platform);
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result[0];
}

// ========== Dashboard Stats ==========
export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalScripts: 0, totalProfiles: 0, totalExecutions: 0, runningInstances: 0, successRate: 0 };
  
  const [scriptCount] = await db.select({ count: sql<number>`count(*)` }).from(scripts).where(eq(scripts.userId, userId));
  const [profileCount] = await db.select({ count: sql<number>`count(*)` }).from(profiles).where(eq(profiles.userId, userId));
  const [execCount] = await db.select({ count: sql<number>`count(*)` }).from(executions).where(eq(executions.userId, userId));
  const [runningCount] = await db.select({ count: sql<number>`count(*)` }).from(executions).where(and(eq(executions.userId, userId), eq(executions.status, "running")));
  const [completedCount] = await db.select({ count: sql<number>`count(*)` }).from(executions).where(and(eq(executions.userId, userId), eq(executions.status, "completed")));
  
  const total = Number(execCount?.count || 0);
  const completed = Number(completedCount?.count || 0);
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    totalScripts: Number(scriptCount?.count || 0),
    totalProfiles: Number(profileCount?.count || 0),
    totalExecutions: total,
    runningInstances: Number(runningCount?.count || 0),
    successRate,
  };
}


// ========== Workspaces & Collaboration ==========
export async function getWorkspacesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).orderBy(desc(workspaces.updatedAt));
}

export async function createWorkspace(data: InsertWorkspace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workspaces).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getWorkspaceMembers(workspaceId: number, ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, ownerId)))
    .limit(1);
  if (!workspace) return [];
  return db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
}

export async function addWorkspaceMember(data: InsertWorkspaceMember, ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(and(eq(workspaces.id, data.workspaceId), eq(workspaces.ownerId, ownerId)))
    .limit(1);
  if (!workspace) return undefined;
  const result = await db.insert(workspaceMembers).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getActiveSessions(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const script = await getScriptById(scriptId, userId);
  if (!script) return [];
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return db.select().from(collaborationSessions)
    .where(and(eq(collaborationSessions.scriptId, scriptId), gt(collaborationSessions.lastActiveAt, fiveMinutesAgo)));
}

export async function upsertCollaborationSession(data: InsertCollaborationSession, ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const script = await getScriptById(data.scriptId, ownerId);
  if (!script) return false;
  await db.insert(collaborationSessions).values(data).onDuplicateKeyUpdate({
    set: { cursorPosition: data.cursorPosition, selectedNodeId: data.selectedNodeId, lastActiveAt: new Date() }
  });
  return true;
}

// ========== Marketplace ==========
export async function getMarketplaceTemplates(filters?: { 
  category?: string; 
  platform?: string; 
  limit?: number;
  sortBy?: string;
  minRating?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(marketplaceTemplates.status, 'published')];
  if (filters?.category) conditions.push(eq(marketplaceTemplates.category, filters.category));
  if (filters?.platform) conditions.push(eq(marketplaceTemplates.platform, filters.platform as any));
  // Note: Rating filtering would require JOIN with reviews table
  // For now, we'll sort by review count as a proxy
  
  let orderByClause;
  switch (filters?.sortBy) {
    case 'rating':
      orderByClause = desc(marketplaceTemplates.reviewCount);
      break;
    case 'recent':
      orderByClause = desc(marketplaceTemplates.createdAt);
      break;
    case 'price':
      orderByClause = marketplaceTemplates.price;
      break;
    case 'downloads':
    default:
      orderByClause = desc(marketplaceTemplates.downloads);
      break;
  }
  
  return db.select().from(marketplaceTemplates)
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(boundedListLimit(filters?.limit ?? 50));
}

export async function getPublishedMarketplaceTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(marketplaceTemplates)
    .where(and(eq(marketplaceTemplates.id, id), eq(marketplaceTemplates.status, "published")))
    .limit(1);
  return result[0];
}

export async function getMarketplaceTemplateForCreator(id: number, creatorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(marketplaceTemplates)
    .where(and(eq(marketplaceTemplates.id, id), eq(marketplaceTemplates.creatorId, creatorId)))
    .limit(1);
  return result[0];
}

export async function createMarketplaceTemplate(data: InsertMarketplaceTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(marketplaceTemplates).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateMarketplaceTemplate(id: number, creatorId: number, data: Partial<InsertMarketplaceTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketplaceTemplates).set(data).where(and(eq(marketplaceTemplates.id, id), eq(marketplaceTemplates.creatorId, creatorId)));
}

export async function incrementTemplateDownloads(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketplaceTemplates).set({ downloads: sql`downloads + 1` }).where(eq(marketplaceTemplates.id, id));
}

export async function getTemplateReviews(templateId: number) {
  const db = await getDb();
  if (!db) return [];
  const [template] = await db
    .select({ id: marketplaceTemplates.id })
    .from(marketplaceTemplates)
    .where(and(eq(marketplaceTemplates.id, templateId), eq(marketplaceTemplates.status, "published")))
    .limit(1);
  if (!template) return [];
  return db.select().from(templateReviews).where(eq(templateReviews.templateId, templateId)).orderBy(desc(templateReviews.createdAt));
}

export async function createEligibleTemplateReview(data: InsertTemplateReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [template] = await db
    .select({ id: marketplaceTemplates.id, creatorId: marketplaceTemplates.creatorId })
    .from(marketplaceTemplates)
    .where(and(eq(marketplaceTemplates.id, data.templateId), eq(marketplaceTemplates.status, "published")))
    .limit(1);
  if (!template || template.creatorId === data.userId) return undefined;
  const result = await db.insert(templateReviews).values(data);
  return { id: Number(result[0].insertId) };
}

export async function createTemplatePurchase(data: InsertTemplatePurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(templatePurchases).values(data);
  return { id: Number(result[0].insertId) };
}

export async function hasUserPurchased(templateId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(templatePurchases)
    .where(and(eq(templatePurchases.templateId, templateId), eq(templatePurchases.userId, userId))).limit(1);
  return result.length > 0;
}

// ========== Documentation ==========
export async function getDocumentationsByScript(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const script = await getScriptById(scriptId, userId);
  if (!script) return [];
  return db.select().from(documentations).where(eq(documentations.scriptId, scriptId)).orderBy(desc(documentations.version));
}

export async function createDocumentation(data: InsertDocumentation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documentations).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateDocumentation(id: number, userId: number, data: Partial<InsertDocumentation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documentations).set(data).where(and(eq(documentations.id, id), eq(documentations.userId, userId)));
}


// ========== Blog Posts ==========
export async function getBlogPosts(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(blogPosts).where(eq(blogPosts.status, status as any)).orderBy(desc(blogPosts.publishedAt));
  }
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published"))).limit(1);
  return result[0];
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(and(eq(blogPosts.id, id), eq(blogPosts.status, "published"))).limit(1);
  return result[0];
}

export async function getBlogPostForAuthor(id: number, authorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(and(eq(blogPosts.id, id), eq(blogPosts.authorId, authorId))).limit(1);
  return result[0];
}

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateBlogPost(id: number, authorId: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(data).where(and(eq(blogPosts.id, id), eq(blogPosts.authorId, authorId)));
  return getBlogPostForAuthor(id, authorId);
}

export async function deleteBlogPost(id: number, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(and(eq(blogPosts.id, id), eq(blogPosts.authorId, authorId)));
}

export async function incrementBlogPostViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(blogPosts).set({ viewCount: sql`${blogPosts.viewCount} + 1` }).where(eq(blogPosts.id, id));
}

// ========== Blog Categories ==========
export async function getBlogCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogCategories).orderBy(blogCategories.name);
}

export async function createBlogCategory(data: InsertBlogCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogCategories).values(data);
  return { id: Number(result[0].insertId) };
}

// ========== Blog Tags ==========
export async function getBlogTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogTags).orderBy(blogTags.name);
}

export async function createBlogTag(data: InsertBlogTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogTags).values(data);
  return { id: Number(result[0].insertId) };
}

// ========== Blog Comments ==========
export async function getBlogComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  const post = await getBlogPostById(postId);
  if (!post) return [];
  return db.select().from(blogComments).where(and(eq(blogComments.postId, postId), eq(blogComments.status, "approved"))).orderBy(desc(blogComments.createdAt));
}

export async function createBlogComment(data: InsertBlogComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const post = await getBlogPostById(data.postId);
  if (!post) return undefined;
  const result = await db.insert(blogComments).values(data);
  return { id: Number(result[0].insertId) };
}

async function getBlogCommentForPostAuthor(id: number, authorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [comment] = await db.select().from(blogComments).where(eq(blogComments.id, id)).limit(1);
  if (!comment) return undefined;
  const post = await getBlogPostForAuthor(comment.postId, authorId);
  return post ? comment : undefined;
}

export async function updateBlogCommentStatus(id: number, authorId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!(await getBlogCommentForPostAuthor(id, authorId))) return undefined;
  await db.update(blogComments).set({ status: status as any }).where(eq(blogComments.id, id));
  return { id };
}

export async function deleteBlogComment(id: number, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!(await getBlogCommentForPostAuthor(id, authorId))) return undefined;
  await db.delete(blogComments).where(eq(blogComments.id, id));
  return { id };
}


// ========== Engagement Campaigns ==========
export async function getEngagementCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(engagementCampaigns).where(eq(engagementCampaigns.userId, userId)).orderBy(desc(engagementCampaigns.createdAt));
}

export async function getEngagementCampaignById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(engagementCampaigns).where(and(eq(engagementCampaigns.id, id), eq(engagementCampaigns.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEngagementCampaign(data: InsertEngagementCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(engagementCampaigns).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateEngagementCampaign(id: number, userId: number, data: Partial<InsertEngagementCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(engagementCampaigns).set(data).where(and(eq(engagementCampaigns.id, id), eq(engagementCampaigns.userId, userId)));
  return getEngagementCampaignById(id, userId);
}

export async function deleteEngagementCampaign(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(engagementCampaigns).where(and(eq(engagementCampaigns.id, id), eq(engagementCampaigns.userId, userId)));
}

// ========== Engagement Actions ==========
export async function getEngagementActions(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  const campaign = await getEngagementCampaignById(campaignId, userId);
  if (!campaign) return [];
  return db.select().from(engagementActions).where(eq(engagementActions.campaignId, campaignId)).orderBy(desc(engagementActions.createdAt));
}

export async function createEngagementAction(data: InsertEngagementAction, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const campaign = await getEngagementCampaignById(data.campaignId, userId);
  if (!campaign) return undefined;
  const result = await db.insert(engagementActions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateEngagementAction(id: number, userId: number, data: Partial<InsertEngagementAction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [action] = await db.select().from(engagementActions).where(eq(engagementActions.id, id)).limit(1);
  if (!action || !(await getEngagementCampaignById(action.campaignId, userId))) return undefined;
  await db.update(engagementActions).set(data).where(eq(engagementActions.id, id));
  return { id };
}

// ========== Hashtag Monitors ==========
export async function getHashtagMonitors(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hashtagMonitors).where(eq(hashtagMonitors.userId, userId)).orderBy(desc(hashtagMonitors.createdAt));
}

export async function getHashtagMonitorById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hashtagMonitors).where(and(eq(hashtagMonitors.id, id), eq(hashtagMonitors.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createHashtagMonitor(data: InsertHashtagMonitor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hashtagMonitors).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateHashtagMonitor(id: number, userId: number, data: Partial<InsertHashtagMonitor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(hashtagMonitors).set(data).where(and(eq(hashtagMonitors.id, id), eq(hashtagMonitors.userId, userId)));
  return getHashtagMonitorById(id, userId);
}

export async function deleteHashtagMonitor(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(hashtagMonitors).where(and(eq(hashtagMonitors.id, id), eq(hashtagMonitors.userId, userId)));
}

// ========== AI Comment History ==========
export async function getAICommentHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiCommentHistory).where(eq(aiCommentHistory.userId, userId)).orderBy(desc(aiCommentHistory.createdAt)).limit(boundedListLimit(limit));
}

export async function createAICommentHistory(data: InsertAICommentHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiCommentHistory).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateAICommentFeedback(id: number, userId: number, feedback: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiCommentHistory).set({ feedback: feedback as any }).where(and(eq(aiCommentHistory.id, id), eq(aiCommentHistory.userId, userId)));
}


// ========== AI Conversation Memory ==========
export async function getAIConversationHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(aiConversations.createdAt).limit(boundedListLimit(limit));
}

export async function createAIConversation(data: InsertAIConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiConversations).values(data);
  return { id: Number(result[0].insertId) };
}

export async function clearAIConversationHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(aiConversations).where(eq(aiConversations.userId, userId));
}


// ========== Hardware Settings (in-memory per-user store) ==========
// Stored in memory for simplicity - persists for server lifetime
// For production, add a hardware_settings table to the schema
const hardwareSettingsStore = new Map<number, {
  cpuLabel?: string;
  gpuLabel?: string;
  gpuVramGB?: number;
  updatedAt: number;
}>();

export async function getHardwareSettings(userId: number) {
  const settings = hardwareSettingsStore.get(userId);
  return settings ?? { cpuLabel: null, gpuLabel: null, gpuVramGB: null, updatedAt: null };
}

export async function saveHardwareSettings(
  userId: number,
  data: { cpuLabel?: string; gpuLabel?: string; gpuVramGB?: number }
) {
  const existing = hardwareSettingsStore.get(userId) ?? {};
  const updated = {
    ...existing,
    ...(data.cpuLabel !== undefined ? { cpuLabel: data.cpuLabel } : {}),
    ...(data.gpuLabel !== undefined ? { gpuLabel: data.gpuLabel } : {}),
    ...(data.gpuVramGB !== undefined ? { gpuVramGB: data.gpuVramGB } : {}),
    updatedAt: Date.now(),
  };
  hardwareSettingsStore.set(userId, updated);
  return updated;
}
