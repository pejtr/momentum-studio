import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

export const blogRouter = router({
  // Public procedures
  list: publicProcedure.query(() => db.getBlogPosts("published")),

  getBySlug: publicProcedure.input(z.object({
    slug: z.string(),
  })).query(async ({ input }) => {
    const post = await db.getBlogPostBySlug(input.slug);
    if (post) {
      await db.incrementBlogPostViews(post.id);
    }
    return post;
  }),

  get: publicProcedure.input(z.object({
    id: z.number(),
  })).query(({ input }) => db.getBlogPostById(input.id)),

  getOwn: protectedProcedure.input(z.object({ id: z.number() })).query(({ ctx, input }) =>
    db.getBlogPostForAuthor(input.id, ctx.user.id)
  ),

  categories: publicProcedure.query(() => db.getBlogCategories()),

  tags: publicProcedure.query(() => db.getBlogTags()),

  comments: publicProcedure.input(z.object({
    postId: z.number(),
  })).query(({ input }) => db.getBlogComments(input.postId)),

  // Protected procedures (require authentication)
  create: protectedProcedure.input(z.object({
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    excerpt: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    publishedAt: z.date().optional(),
    featuredImage: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.string().optional(),
  })).mutation(({ ctx, input }) => {
    return db.createBlogPost({
      ...input,
      authorId: ctx.user.id,
    });
  }),

  update: protectedProcedure.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    slug: z.string().optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    publishedAt: z.date().optional(),
    featuredImage: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.string().optional(),
  })).mutation(({ ctx, input }) => {
    const { id, ...data } = input;
    return db.updateBlogPost(id, ctx.user.id, data);
  }),

  delete: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(({ ctx, input }) => {
    return db.deleteBlogPost(input.id, ctx.user.id);
  }),

  // Comment management
  addComment: protectedProcedure.input(z.object({
    postId: z.number(),
    content: z.string(),
  })).mutation(({ ctx, input }) => {
    return db.createBlogComment({
      ...input,
      userId: ctx.user.id,
      status: "pending",
    });
  }),

  approveComment: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(({ ctx, input }) => {
    return db.updateBlogCommentStatus(input.id, ctx.user.id, "approved");
  }),

  rejectComment: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(({ ctx, input }) => {
    return db.updateBlogCommentStatus(input.id, ctx.user.id, "rejected");
  }),

  deleteComment: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(({ ctx, input }) => {
    return db.deleteBlogComment(input.id, ctx.user.id);
  }),

  // Category management
  createCategory: protectedProcedure.input(z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
  })).mutation(({ input }) => {
    return db.createBlogCategory(input);
  }),

  // Tag management
  createTag: protectedProcedure.input(z.object({
    name: z.string(),
    slug: z.string(),
  })).mutation(({ input }) => {
    return db.createBlogTag(input);
  }),
});
