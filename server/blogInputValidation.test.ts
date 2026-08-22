import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 990018 : 990019,
      openId: `blog-input-${role}`,
      email: `blog-input-${role}@example.test`,
      name: `Blog Input ${role}`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("blog input bounds", () => {
  it("rejects an oversized article title before attempting a write", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.blog.create({
      title: "t".repeat(256),
      slug: "valid-article-slug",
      content: "Valid article body.",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects oversized comments and invalid public slugs", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.blog.addComment({ postId: 1, content: "c".repeat(5_001) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(caller.blog.getBySlug({ slug: "Invalid Slug" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("rejects malformed taxonomy slugs even for administrators", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.blog.createCategory({
      name: "QA Architecture",
      slug: "qa architecture",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unsafe featured image URL protocols before attempting a write", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.blog.create({
      title: "Safe image URL validation",
      slug: "safe-image-url-validation",
      content: "Valid article body.",
      featuredImage: "javascript:alert(1)",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
