import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { consumeAiCredit, type AiCreditTool } from "./aiCredits";

async function requireAiCredit(userId: number, tool: AiCreditTool) {
  const consumption = await consumeAiCredit(userId, tool);
  if (!consumption.allowed) {
    const message = consumption.reason === "rate_limited"
      ? `Příliš mnoho AI požadavků. Zkuste to znovu za ${consumption.retryAfterSeconds ?? 1} s.`
      : "Měsíční limit AI kreditů byl vyčerpán. Další kredity budou dostupné při příštím obnovení období.";
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message });
  }
  return consumption.status;
}

const engagementTargetCriteriaSchema = z.object({
  hashtags: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  accounts: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
  minLikes: z.number().int().min(0).max(1_000_000_000).optional(),
  maxLikes: z.number().int().min(0).max(1_000_000_000).optional(),
}).strict().superRefine((criteria, validation) => {
  if (criteria.minLikes !== undefined && criteria.maxLikes !== undefined && criteria.minLikes > criteria.maxLikes) {
    validation.addIssue({
      code: "custom",
      path: ["maxLikes"],
      message: "Maximální počet likes musí být alespoň minimální počet likes.",
    });
  }
});

const engagementActionConfigSchema = z.object({
  useAI: z.boolean().optional(),
  commentTemplates: z.array(z.string().trim().min(1).max(5_000)).max(20).optional(),
  dmTemplates: z.array(z.string().trim().min(1).max(5_000)).max(20).optional(),
  maxActionsPerDay: z.number().int().min(1).max(10_000).optional(),
  delayBetweenActions: z.number().int().min(0).max(86_400).optional(),
}).strict();

export const engagementRouter = router({
  // ========== Engagement Campaigns ==========
  campaigns: router({
    list: protectedProcedure.query(({ ctx }) => db.getEngagementCampaigns(ctx.user.id)),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getEngagementCampaignById(input.id, ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        profileId: z.number(),
        name: z.string().min(1).max(255),
        platform: z.enum(['instagram', 'tiktok', 'facebook', 'youtube', 'twitter']),
        type: z.enum(['like', 'comment', 'follow', 'view_story', 'send_dm', 'hashtag_monitor']),
        targetCriteria: engagementTargetCriteriaSchema.optional(),
        actionConfig: engagementActionConfigSchema.optional(),
        actionsTarget: z.number().int().min(1).max(1_000_000).optional(),
      }))
      .mutation(({ ctx, input }) => 
        db.createEngagementCampaign({ ...input, userId: ctx.user.id })
      ),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().trim().min(1).max(255).optional(),
        status: z.enum(['active', 'paused', 'completed', 'error']).optional(),
        targetCriteria: engagementTargetCriteriaSchema.optional(),
        actionConfig: engagementActionConfigSchema.optional(),
        actionsTarget: z.number().int().min(1).max(1_000_000).optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateEngagementCampaign(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteEngagementCampaign(input.id, ctx.user.id)),
  }),

  // ========== Engagement Actions ==========
  actions: router({
    list: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(({ ctx, input }) => db.getEngagementActions(input.campaignId, ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        platform: z.enum(['instagram', 'tiktok', 'facebook', 'youtube', 'twitter']),
        actionType: z.enum(['like', 'comment', 'follow', 'view_story', 'send_dm']),
        targetUrl: z.string().optional(),
        targetUsername: z.string().optional(),
        targetPostId: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => 
        db.createEngagementAction({ ...input, userId: ctx.user.id }, ctx.user.id)
      ),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'completed', 'failed', 'skipped']),
        error: z.string().optional(),
        executedAt: z.date().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateEngagementAction(id, ctx.user.id, data);
      }),
  }),

  // ========== Hashtag Monitors ==========
  hashtags: router({
    list: protectedProcedure.query(({ ctx }) => db.getHashtagMonitors(ctx.user.id)),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getHashtagMonitorById(input.id, ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        platform: z.enum(['instagram', 'tiktok', 'facebook', 'youtube', 'twitter']),
        hashtag: z.string().min(1).max(255),
        autoEngage: z.boolean().optional(),
        engagementActions: z.array(z.enum(['like', 'comment', 'follow'])).optional(),
        commentTemplates: z.array(z.string()).optional(),
        useAI: z.boolean().optional(),
        maxActionsPerDay: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const data = {
          ...input,
          userId: ctx.user.id,
          autoEngage: input.autoEngage ? 1 : 0,
          useAI: input.useAI ? 1 : 0,
        };
        return db.createHashtagMonitor(data);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        autoEngage: z.boolean().optional(),
        engagementActions: z.array(z.enum(['like', 'comment', 'follow'])).optional(),
        commentTemplates: z.array(z.string()).optional(),
        useAI: z.boolean().optional(),
        maxActionsPerDay: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const updateData: any = { ...input };
        if (input.autoEngage !== undefined) updateData.autoEngage = input.autoEngage ? 1 : 0;
        if (input.useAI !== undefined) updateData.useAI = input.useAI ? 1 : 0;
        if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
        return db.updateHashtagMonitor(input.id, ctx.user.id, updateData);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteHashtagMonitor(input.id, ctx.user.id)),
  }),

  // ========== AI Comment Generation ==========
  ai: router({
    generateComment: protectedProcedure
      .input(z.object({
        platform: z.enum(['instagram', 'tiktok', 'facebook', 'youtube', 'twitter']),
        postContent: z.string().min(1).max(5_000),
        postUrl: z.string().url().max(2_000).optional(),
        tone: z.enum(['friendly', 'professional', 'enthusiastic', 'casual', 'supportive']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import('./_core/llm');

        const toneDescriptions = {
          friendly: 'friendly and warm',
          professional: 'professional and polished',
          enthusiastic: 'enthusiastic and energetic',
          casual: 'casual and relaxed',
          supportive: 'supportive and encouraging',
        };

        const tone = input.tone || 'friendly';
        const systemPrompt = `You are an expert social media engagement assistant. Generate a contextually relevant, ${toneDescriptions[tone]} comment for a ${input.platform} post.

Rules:
- Keep it natural and authentic (2-4 sentences max)
- Be specific to the post content
- Use appropriate emojis sparingly (1-2 max)
- Avoid generic phrases like "Great post!" or "Nice!"
- Match the platform's typical comment style
- Be conversational and engaging
- Don't use hashtags in comments`;

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: `Generate a comment for this ${input.platform} post:\n\n${input.postContent}` },
        ];

        const credits = await requireAiCredit(ctx.user.id, "engagement_comment");
        const response = await invokeLLM({ messages });
        const content = response.choices[0]?.message?.content;
        const generatedComment = typeof content === 'string' ? content : 'Great content! 👍';

        // Save to history
        await db.createAICommentHistory({
          userId: ctx.user.id,
          platform: input.platform,
          postUrl: input.postUrl,
          postContent: input.postContent,
          generatedComment,
          wasUsed: 0,
        });

        return { comment: generatedComment, credits };
      }),

    commentHistory: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).optional() }))
      .query(({ ctx, input }) => 
        db.getAICommentHistory(ctx.user.id, input.limit)
      ),

    updateFeedback: protectedProcedure
      .input(z.object({
        id: z.number(),
        feedback: z.enum(['good', 'bad', 'neutral']),
      }))
      .mutation(({ ctx, input }) => 
        db.updateAICommentFeedback(input.id, ctx.user.id, input.feedback)
      ),
  }),
});
