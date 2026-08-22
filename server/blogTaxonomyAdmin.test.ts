import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createCategoryMock, createTagMock, getCategoriesMock, getTagsMock } = vi.hoisted(() => ({
  createCategoryMock: vi.fn().mockResolvedValue({ id: 1 }),
  createTagMock: vi.fn().mockResolvedValue({ id: 2 }),
  getCategoriesMock: vi.fn().mockResolvedValue([]),
  getTagsMock: vi.fn().mockResolvedValue([]),
}));

vi.mock("./db", () => ({
  createBlogCategory: createCategoryMock,
  createBlogTag: createTagMock,
  getBlogCategories: getCategoriesMock,
  getBlogTags: getTagsMock,
}));

import { blogRouter } from "./blogRouter";

function createContext(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: role === "admin" ? 990012 : 990013,
      openId: `blog-taxonomy-${role}`,
      email: `${role}@example.test`,
      name: `Blog ${role}`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("blog taxonomy administration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects anonymous and standard-user taxonomy mutations", async () => {
    const anonymous = blogRouter.createCaller(createContext(null));
    const standardUser = blogRouter.createCaller(createContext("user"));

    await expect(anonymous.createCategory({ name: "QA", slug: "qa" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(standardUser.createTag({ name: "Security", slug: "security" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(createCategoryMock).not.toHaveBeenCalled();
    expect(createTagMock).not.toHaveBeenCalled();
  });

  it("allows an admin to mutate taxonomy while keeping reads public", async () => {
    const admin = blogRouter.createCaller(createContext("admin"));
    const publicCaller = blogRouter.createCaller(createContext(null));

    await expect(admin.createCategory({ name: "QA", slug: "qa" })).resolves.toEqual({ id: 1 });
    await expect(admin.createTag({ name: "Security", slug: "security" })).resolves.toEqual({ id: 2 });
    await expect(publicCaller.categories()).resolves.toEqual([]);
    await expect(publicCaller.tags()).resolves.toEqual([]);
  });
});
