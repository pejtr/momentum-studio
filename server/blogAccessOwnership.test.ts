import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { cleanupTestUserData, TEST_USER_IDS } from "./testDataIsolation";

const OWNER_ID = TEST_USER_IDS.blogOwner;
const OTHER_USER_ID = TEST_USER_IDS.blogOther;

function createContext(userId: number | null): TrpcContext {
  return {
    user: userId === null ? null : {
      id: userId,
      openId: `blog-access-test-${userId}`,
      email: `blog-${userId}@example.test`,
      name: `Blog ${userId}`,
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

describe("blog publication and ownership", () => {
  it("does not expose drafts or permit another user to modify the author's post", async () => {
    const owner = appRouter.createCaller(createContext(OWNER_ID));
    const otherUser = appRouter.createCaller(createContext(OTHER_USER_ID));
    const publicCaller = appRouter.createCaller(createContext(null));
    const draft = await owner.blog.create({
      title: "Owner-only draft",
      slug: "owner-only-draft",
      content: "This draft is private.",
      status: "draft",
    });

    await expect(publicCaller.blog.get({ id: draft.id })).resolves.toBeUndefined();
    await expect(publicCaller.blog.getBySlug({ slug: "owner-only-draft" })).resolves.toBeUndefined();
    await expect(otherUser.blog.getOwn({ id: draft.id })).resolves.toBeUndefined();
    await expect(otherUser.blog.update({ id: draft.id, title: "Hijacked" })).resolves.toBeUndefined();

    await expect(owner.blog.getOwn({ id: draft.id })).resolves.toMatchObject({
      id: draft.id,
      title: "Owner-only draft",
      status: "draft",
      authorId: OWNER_ID,
    });
  });

  it("allows only the parent post author to moderate its comments", async () => {
    const owner = appRouter.createCaller(createContext(OWNER_ID));
    const otherUser = appRouter.createCaller(createContext(OTHER_USER_ID));
    const publicCaller = appRouter.createCaller(createContext(null));
    const post = await owner.blog.create({
      title: "Published owner post",
      slug: "published-owner-post",
      content: "Comments are moderated by the post author.",
      status: "published",
    });
    const comment = await otherUser.blog.addComment({ postId: post.id, content: "Please approve me." });

    await expect(publicCaller.blog.comments({ postId: post.id })).resolves.toEqual([]);
    await expect(otherUser.blog.approveComment({ id: comment!.id })).resolves.toBeUndefined();
    await expect(owner.blog.approveComment({ id: comment!.id })).resolves.toEqual({ id: comment!.id });
    await expect(publicCaller.blog.comments({ postId: post.id })).resolves.toHaveLength(1);
  });
});
