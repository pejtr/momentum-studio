import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { afterEach, beforeEach } from "vitest";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";

const TEST_USER_ID = TEST_USER_IDS.blog;

beforeEach(async () => cleanupTestUserData(TEST_USER_ID));
afterEach(async () => cleanupTestUserData(TEST_USER_ID));

function createAuthContext() {
  const ctx = {
    user: { id: TEST_USER_ID, openId: "omnimatrix-test-blog", name: "Test User", role: "admin" as const },
    req: {} as any,
    res: {} as any,
  };
  return { ctx, caller: appRouter.createCaller(ctx) };
}

describe("Blog System", () => {
  it("lists published blog posts", async () => {
    const { caller } = createAuthContext();
    const posts = await caller.blog.list({ status: "published" });
    
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("retrieves blog post by slug", async () => {
    const { caller } = createAuthContext();
    const post = await caller.blog.getBySlug({ slug: "browser-automation-testing-guide-2026" });
    
    expect(post).toBeDefined();
    expect(post?.title).toContain("Browser Automation");
    expect(post?.status).toBe("published");
  });

  it("creates a new blog post", async () => {
    const { caller } = createAuthContext();
    const newPost = await caller.blog.create({
      title: "Test Blog Post",
      slug: `test-post-${Date.now()}`,
      content: "<p>This is a test post</p>",
      excerpt: "Test excerpt",
      status: "draft",
    });
    
    expect(newPost).toBeDefined();
    expect(newPost.id).toBeDefined();
  });

  it("updates an existing blog post", async () => {
    const { caller } = createAuthContext();
    
    // First create a post
    const created = await caller.blog.create({
      title: "Update Test",
      slug: `update-test-${Date.now()}`,
      content: "<p>Original content</p>",
      excerpt: "Original excerpt",
    });
    
    // Then update it
    const updated = await caller.blog.update({
      id: created.id,
      title: "Updated Title",
      content: "<p>Updated content</p>",
    });
    
    expect(updated?.title).toBe("Updated Title");
    expect(updated?.content).toContain("Updated content");
  });

  it("retrieves blog categories", async () => {
    const { caller } = createAuthContext();
    const categories = await caller.blog.categories();
    
    expect(Array.isArray(categories)).toBe(true);
  });

  it("retrieves blog tags", async () => {
    const { caller } = createAuthContext();
    const tags = await caller.blog.tags();
    
    expect(Array.isArray(tags)).toBe(true);
  });
});
