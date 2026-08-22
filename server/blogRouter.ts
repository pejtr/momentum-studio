import { z } from "zod";
import { adminProcedure, router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

const blogSlugSchema = z.string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug musí obsahovat malá písmena, číslice a pomlčky.");

const blogTitleSchema = z.string().trim().min(1).max(255);
const blogContentSchema = z.string().trim().min(1).max(100_000);
const blogExcerptSchema = z.string().trim().max(1_000);
const blogCommentSchema = z.string().trim().min(1).max(5_000);
const taxonomyNameSchema = z.string().trim().min(1).max(100);
const positiveResourceIdSchema = z.number().int().positive();
const featuredImageUrlSchema = z.string().url().max(500).refine(
  (value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  },
  "Obrázek článku musí používat bezpečný HTTP(S) protokol."
);

export const blogRouter = router({
  // Public procedures
  list: publicProcedure.query(() => db.getBlogPosts("published")),

  getBySlug: publicProcedure.input(z.object({
    slug: blogSlugSchema,
  })).query(async ({ input }) => {
    const post = await db.getBlogPostBySlug(input.slug);
    if (post) {
      await db.incrementBlogPostViews(post.id);
    }
    return post;
  }),

  get: publicProcedure.input(z.object({
    id: positiveResourceIdSchema,
  })).query(({ input }) => db.getBlogPostById(input.id)),

  getOwn: protectedProcedure.input(z.object({ id: positiveResourceIdSchema })).query(({ ctx, input }) =>
    db.getBlogPostForAuthor(input.id, ctx.user.id)
  ),

  categories: publicProcedure.query(() => db.getBlogCategories()),

  tags: publicProcedure.query(() => db.getBlogTags()),

  comments: publicProcedure.input(z.object({
    postId: positiveResourceIdSchema,
  })).query(({ input }) => db.getBlogComments(input.postId)),

  // Protected procedures (require authentication)
  create: protectedProcedure.input(z.object({
    title: blogTitleSchema,
    slug: blogSlugSchema,
    content: blogContentSchema,
    excerpt: blogExcerptSchema.optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    publishedAt: z.date().optional(),
    featuredImage: featuredImageUrlSchema.optional(),
    metaDescription: z.string().trim().max(320).optional(),
    keywords: z.string().trim().max(1_000).optional(),
  })).mutation(({ ctx, input }) => {
    return db.createBlogPost({
      ...input,
      authorId: ctx.user.id,
    });
  }),

  update: protectedProcedure.input(z.object({
    id: positiveResourceIdSchema,
    title: blogTitleSchema.optional(),
    slug: blogSlugSchema.optional(),
    content: blogContentSchema.optional(),
    excerpt: blogExcerptSchema.optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    publishedAt: z.date().optional(),
    featuredImage: featuredImageUrlSchema.optional(),
    metaDescription: z.string().trim().max(320).optional(),
    keywords: z.string().trim().max(1_000).optional(),
  })).mutation(({ ctx, input }) => {
    const { id, ...data } = input;
    return db.updateBlogPost(id, ctx.user.id, data);
  }),

  delete: protectedProcedure.input(z.object({
    id: positiveResourceIdSchema,
  })).mutation(({ ctx, input }) => {
    return db.deleteBlogPost(input.id, ctx.user.id);
  }),

  // Comment management
  addComment: protectedProcedure.input(z.object({
    postId: positiveResourceIdSchema,
    content: blogCommentSchema,
  })).mutation(({ ctx, input }) => {
    return db.createBlogComment({
      ...input,
      userId: ctx.user.id,
      status: "pending",
    });
  }),

  approveComment: protectedProcedure.input(z.object({
    id: positiveResourceIdSchema,
  })).mutation(({ ctx, input }) => {
    return db.updateBlogCommentStatus(input.id, ctx.user.id, "approved");
  }),

  rejectComment: protectedProcedure.input(z.object({
    id: positiveResourceIdSchema,
  })).mutation(({ ctx, input }) => {
    return db.updateBlogCommentStatus(input.id, ctx.user.id, "rejected");
  }),

  deleteComment: protectedProcedure.input(z.object({
    id: positiveResourceIdSchema,
  })).mutation(({ ctx, input }) => {
    return db.deleteBlogComment(input.id, ctx.user.id);
  }),

  // Category management
  createCategory: adminProcedure.input(z.object({
    name: taxonomyNameSchema,
    slug: blogSlugSchema.max(100),
    description: z.string().trim().max(1_000).optional(),
  })).mutation(({ input }) => {
    return db.createBlogCategory(input);
  }),

  // Tag management
  createTag: adminProcedure.input(z.object({
    name: taxonomyNameSchema,
    slug: blogSlugSchema.max(100),
  })).mutation(({ input }) => {
    return db.createBlogTag(input);
  }),
});
