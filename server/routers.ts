import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { getHardwareSettings, saveHardwareSettings } from "./db";
import { broadcastExecutionNotification } from "./_core/websocket";
import * as os from "os";
import { blogRouter } from "./blogRouter";
import { dockerRouter } from "./dockerRouter";
import { engagementRouter } from "./engagementRouter";
import { hermesRouter } from "./routers/hermes";
import { consumeAiCredit, getAiCreditStatus, type AiCreditTool } from "./aiCredits";
import { generateTestCasesWithHermes, summarizePdfWithHermes, validateXmlWithHermes } from "./hermesQaTools";
import { decryptProfileSecrets, encryptProfileSecrets } from "./profileSecrets";

async function requireAiCredit(userId: number, tool: AiCreditTool) {
  const consumption = await consumeAiCredit(userId, tool);
  if (!consumption.allowed) {
    const message = consumption.reason === "rate_limited"
      ? `Příliš mnoho AI požadavků. Zkuste to znovu za ${consumption.retryAfterSeconds ?? 1} s.`
      : "Měsíční limit AI kreditů byl vyčerpán. Další kredity budou dostupné při příštím obnovení období.";
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message,
    });
  }
  return consumption.status;
}

const scriptNodeDataSchema = z.record(z.string().trim().min(1).max(100), z.unknown())
  .refine((data) => Object.keys(data).length <= 50, {
    message: "Data uzlu mohou obsahovat nejvýše 50 položek.",
  })
  .refine((data) => {
    try {
      return JSON.stringify(data).length <= 20_000;
    } catch {
      return false;
    }
  }, {
    message: "Data uzlu nesmí překročit 20 000 znaků JSON.",
  });

const scriptNodeSchema = z.object({
  id: z.string().trim().min(1).max(128),
  type: z.string().trim().min(1).max(100),
  position: z.object({
    x: z.number().finite().min(-1_000_000).max(1_000_000),
    y: z.number().finite().min(-1_000_000).max(1_000_000),
  }).strict(),
  data: scriptNodeDataSchema,
}).strict();

const scriptEdgeSchema = z.object({
  id: z.string().trim().min(1).max(128),
  source: z.string().trim().min(1).max(128),
  target: z.string().trim().min(1).max(128),
  label: z.string().trim().max(1_000).optional(),
  type: z.string().trim().max(100).optional(),
}).strict();

const scriptNodesSchema = z.array(scriptNodeSchema).max(500);
const scriptEdgesSchema = z.array(scriptEdgeSchema).max(1_000);

const MAX_LEGACY_AI_INPUT_CHARS = 50_000;

const profileNameSchema = z.string().trim().min(1).max(255);
const proxyHostSchema = z.string().trim().min(1).max(255);
const proxyCredentialSchema = z.string().max(255);
const userAgentSchema = z.string().trim().min(1).max(2_000);
const profileCredentialsSchema = z.record(
  z.string().trim().min(1).max(100),
  z.string().max(5_000),
).refine((credentials) => Object.keys(credentials).length <= 50, {
  message: "Credential mapa může obsahovat nejvýše 50 položek.",
});
const documentationTitleSchema = z.string().trim().min(1).max(255);
const documentationContentSchema = z.string().max(16_000);
const positiveResourceIdSchema = z.number().int().positive();

export function redactProfileSecrets<T extends { proxyPassword?: unknown; credentials?: unknown }>(profile: T) {
  const { proxyPassword, credentials, ...safeProfile } = profile;
  return {
    ...safeProfile,
    hasProxyPassword: Boolean(proxyPassword),
    hasCredentials: credentials !== null && credentials !== undefined,
  };
}

export const appRouter = router({
  system: systemRouter,
  blog: blogRouter,
  docker: dockerRouter,
  engagement: engagementRouter,
  hermes: hermesRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Scripts CRUD
  scripts: router({
    list: protectedProcedure.query(({ ctx }) => db.getScriptsByUser(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ ctx, input }) => db.getScriptById(input.id, ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().trim().max(10_000).optional(),
      nodes: scriptNodesSchema.optional(),
      edges: scriptEdgesSchema.optional(),
    })).mutation(({ ctx, input }) => db.createScript({ ...input, userId: ctx.user.id, nodes: input.nodes || [], edges: input.edges || [] })),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().trim().max(10_000).optional(),
      nodes: scriptNodesSchema.optional(),
      edges: scriptEdgesSchema.optional(),
      status: z.enum(["draft", "ready", "running", "paused", "error"]).optional(),
    })).mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return db.updateScript(id, ctx.user.id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => db.deleteScript(input.id, ctx.user.id)),
  }),

  // Profiles CRUD
  profiles: router({
    list: protectedProcedure.query(async ({ ctx }) => (await db.getProfilesByUser(ctx.user.id)).map(redactProfileSecrets)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const profile = await db.getProfileById(input.id, ctx.user.id);
      return profile ? redactProfileSecrets(profile) : undefined;
    }),
    create: protectedProcedure.input(z.object({
      name: profileNameSchema,
      platform: z.enum(["twitter", "instagram", "facebook", "tiktok", "youtube", "custom"]).optional(),
      proxyHost: proxyHostSchema.optional(),
      proxyPort: z.number().int().min(1).max(65_535).optional(),
      proxyUsername: proxyCredentialSchema.optional(),
      proxyPassword: proxyCredentialSchema.optional(),
      userAgent: userAgentSchema.optional(),
      credentials: profileCredentialsSchema.optional(),
    })).mutation(({ ctx, input }) => {
      const protectedInput = encryptProfileSecrets({
        ...input,
        credentials: input.credentials as Record<string, string> | undefined,
      });
      return db.createProfile({ ...protectedInput, userId: ctx.user.id });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: profileNameSchema.optional(),
      platform: z.enum(["twitter", "instagram", "facebook", "tiktok", "youtube", "custom"]).optional(),
      proxyHost: proxyHostSchema.nullable().optional(),
      proxyPort: z.number().int().min(1).max(65_535).nullable().optional(),
      proxyUsername: proxyCredentialSchema.nullable().optional(),
      proxyPassword: proxyCredentialSchema.nullable().optional(),
      userAgent: userAgentSchema.nullable().optional(),
      credentials: profileCredentialsSchema.optional(),
      status: z.enum(["active", "inactive", "banned", "warming"]).optional(),
    })).mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return db.updateProfile(id, ctx.user.id, encryptProfileSecrets(data) as any);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => db.deleteProfile(input.id, ctx.user.id)),
  }),

  // Executions
  executions: router({
    list: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional()).query(({ ctx, input }) => db.getExecutionsByUser(ctx.user.id, input?.limit)),
    create: protectedProcedure.input(z.object({
      scriptId: z.number(),
      profileId: z.number().optional(),
      stepsTotal: z.number().optional(),
    })).mutation(({ ctx, input }) => db.createExecution({
      ...input,
      userId: ctx.user.id,
      status: "queued",
      startedAt: new Date(),
      stepsCompleted: 0,
      stepsTotal: input.stepsTotal || 0,
    })),
    updateStatus: protectedProcedure.input(z.object({
      id: positiveResourceIdSchema,
      status: z.enum(["queued", "running", "completed", "failed"]),
      error: z.string().trim().min(1).max(5_000).optional(),
    })).mutation(async ({ ctx, input }) => {
      const execution = await db.updateExecution(input.id, ctx.user.id, {
        status: input.status,
        error: input.error,
        completedAt: input.status === "completed" || input.status === "failed" ? new Date() : undefined,
      });

      // Broadcast notification
      if (execution && (input.status === "completed" || input.status === "failed")) {
        const message = input.status === "completed"
          ? `Automation completed successfully`
          : `Automation failed: ${input.error || "Unknown error"}`;

        broadcastExecutionNotification({
          executionId: execution.id,
          scriptId: execution.scriptId,
          status: input.status,
          message,
          timestamp: Date.now(),
          userId: ctx.user.id,
        });
      }

      return execution;
    }),
  }),

  // Containers
  containers: router({
    list: protectedProcedure.query(({ ctx }) => db.getContainersByUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(255),
      host: z.string().trim().min(1).max(255),
      port: z.number().int().min(1).max(65_535),
    })).mutation(({ ctx, input }) => db.createContainer({ ...input, userId: ctx.user.id })),
    update: protectedProcedure.input(z.object({
      id: positiveResourceIdSchema,
      name: z.string().trim().min(1).max(255).optional(),
      status: z.enum(["running", "stopped", "error", "deploying"]).optional(),
    })).mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return db.updateContainer(id, ctx.user.id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: positiveResourceIdSchema })).mutation(({ ctx, input }) => db.deleteContainer(input.id, ctx.user.id)),
  }),

  // Templates
  templates: router({
    list: publicProcedure.query(() => db.getAllTemplates()),
    get: publicProcedure.input(z.object({ id: positiveResourceIdSchema })).query(({ input }) => db.getTemplateById(input.id)),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure.query(({ ctx }) => db.getDashboardStats(ctx.user.id)),
  }),

  // Collaboration
  collaboration: router({
    workspaces: protectedProcedure.query(({ ctx }) => db.getWorkspacesByUser(ctx.user.id)),
    createWorkspace: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(255),
      description: z.string().trim().max(10_000).optional(),
    })).mutation(({ ctx, input }) => db.createWorkspace({ ...input, ownerId: ctx.user.id })),
    getMembers: protectedProcedure.input(z.object({ workspaceId: positiveResourceIdSchema })).query(({ ctx, input }) => db.getWorkspaceMembers(input.workspaceId, ctx.user.id)),
    addMember: protectedProcedure.input(z.object({
      workspaceId: positiveResourceIdSchema,
      userId: positiveResourceIdSchema,
      role: z.enum(["owner", "editor", "viewer"]),
    })).mutation(({ ctx, input }) => db.addWorkspaceMember(input, ctx.user.id)),
    getActiveSessions: protectedProcedure.input(z.object({ scriptId: positiveResourceIdSchema })).query(({ ctx, input }) => db.getActiveSessions(input.scriptId, ctx.user.id)),
    updateSession: protectedProcedure.input(z.object({
      scriptId: positiveResourceIdSchema,
      cursorPosition: z.object({
        x: z.number().finite().min(-1_000_000).max(1_000_000),
        y: z.number().finite().min(-1_000_000).max(1_000_000),
      }).strict().optional(),
      selectedNodeId: z.string().trim().min(1).max(128).optional(),
    })).mutation(({ ctx, input }) => db.upsertCollaborationSession({ ...input, userId: ctx.user.id }, ctx.user.id)),
  }),

  // Marketplace
  marketplace: router({
    list: publicProcedure.input(z.object({
      category: z.string().trim().min(1).max(100).optional(),
      platform: z.enum(["twitter", "instagram", "facebook", "tiktok", "youtube", "multi"]).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      sortBy: z.enum(["downloads", "rating", "recent", "price"]).optional(),
      minRating: z.number().min(1).max(5).optional(),
    }).optional()).query(({ input }) => db.getMarketplaceTemplates(input)),
    get: publicProcedure.input(z.object({ id: positiveResourceIdSchema })).query(({ input }) => db.getPublishedMarketplaceTemplateById(input.id)),
    getOwn: protectedProcedure.input(z.object({ id: positiveResourceIdSchema })).query(({ ctx, input }) =>
      db.getMarketplaceTemplateForCreator(input.id, ctx.user.id)
    ),
    create: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(255),
      description: z.string().trim().max(10_000).optional(),
      category: z.string().trim().min(1).max(100).optional(),
      platform: z.enum(["twitter", "instagram", "facebook", "tiktok", "youtube", "multi"]),
      nodes: scriptNodesSchema.optional(),
      edges: scriptEdgesSchema.optional(),
      price: z.number().int().min(0).max(1_000_000).optional(),
    })).mutation(({ ctx, input }) => db.createMarketplaceTemplate({ ...input, creatorId: ctx.user.id, nodes: input.nodes || [], edges: input.edges || [] })),
    publish: protectedProcedure.input(z.object({ id: positiveResourceIdSchema })).mutation(({ ctx, input }) => 
      db.updateMarketplaceTemplate(input.id, ctx.user.id, { status: "published" })
    ),
    purchase: protectedProcedure.input(z.object({ templateId: positiveResourceIdSchema })).mutation(async ({ ctx, input }) => {
      const template = await db.getPublishedMarketplaceTemplateById(input.templateId);
      if (!template) throw new Error("Template not found");
      await db.createTemplatePurchase({ templateId: input.templateId, userId: ctx.user.id, price: template.price });
      await db.incrementTemplateDownloads(input.templateId);
      return { success: true };
    }),
    getReviews: publicProcedure.input(z.object({ templateId: positiveResourceIdSchema })).query(({ input }) => db.getTemplateReviews(input.templateId)),
    addReview: protectedProcedure.input(z.object({
      templateId: z.number().int().positive(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(1).max(5_000).optional(),
    })).mutation(async ({ ctx, input }) => {
      const review = await db.createEligibleTemplateReview({ ...input, userId: ctx.user.id });
      if (!review) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Recenzi lze přidat pouze k publikované šabloně, kterou nevytvořil aktuální uživatel." });
      }
      return review;
    }),
    hasPurchased: protectedProcedure.input(z.object({ templateId: positiveResourceIdSchema })).query(({ ctx, input }) => 
      db.hasUserPurchased(input.templateId, ctx.user.id)
    ),
  }),

  // Documentation
  documentation: router({
    list: protectedProcedure.input(z.object({ scriptId: z.number().int().positive() })).query(({ ctx, input }) => db.getDocumentationsByScript(input.scriptId, ctx.user.id)),
    generate: protectedProcedure.input(z.object({
      scriptId: z.number().int().positive(),
      title: documentationTitleSchema,
      format: z.enum(["markdown", "html", "pdf"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const script = await db.getScriptById(input.scriptId, ctx.user.id);
      if (!script) throw new Error("Script not found");
      
      // Generate markdown documentation from script nodes
      const content = generateDocumentationContent(script);
      
      return db.createDocumentation({
        scriptId: input.scriptId,
        userId: ctx.user.id,
        title: input.title,
        content,
        format: input.format || "markdown",
      });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      title: documentationTitleSchema.optional(),
      content: documentationContentSchema.optional(),
    })).mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return db.updateDocumentation(id, ctx.user.id, data);
    }),
  }),

  // Execution Engine
  execution: router({
    execute: protectedProcedure.input(z.object({
      scriptId: positiveResourceIdSchema,
      profileId: positiveResourceIdSchema.optional(),
      config: z.object({
        browser: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
        headless: z.boolean().default(true),
      }).optional(),
    })).mutation(async ({ ctx, input }) => {
      const script = await db.getScriptById(input.scriptId, ctx.user.id);
      if (!script) throw new Error('Script not found');

      const storedProfile = input.profileId ? await db.getProfileById(input.profileId, ctx.user.id) : null;
      const profile = storedProfile ? decryptProfileSecrets(storedProfile) : null;

      // Convert workflow nodes to execution steps
      const steps = (script.nodes as any[]).map(node => ({
        type: node.type,
        selector: node.data.selector,
        value: node.data.value,
        url: node.data.url,
        timeout: node.data.timeout,
      }));

      // Create execution record
      const executionId = await db.createExecution({
        scriptId: input.scriptId,
        profileId: input.profileId,
        userId: ctx.user.id,
        status: 'running',
        logs: [],
      });

      // Execute in background (simplified for now)
      // In production, this would use a job queue
      setTimeout(async () => {
        try {
          const { PlaywrightExecutor } = await import('./playwright-executor');
          const executor = new PlaywrightExecutor();

          await executor.initialize({
            browser: input.config?.browser || 'chromium',
            headless: input.config?.headless ?? true,
            proxy: profile && profile.proxyHost ? {
              server: `${profile.proxyHost}:${profile.proxyPort}`,
              username: profile.proxyUsername || undefined,
              password: profile.proxyPassword || undefined,
            } : undefined,
          });

          const result = await executor.execute(steps);
          await executor.cleanup();

          await db.updateExecution(executionId.id, ctx.user.id, {
            status: result.success ? 'completed' : 'failed',
            logs: result.logs.map((msg, idx) => ({ timestamp: Date.now(), level: 'info' as const, message: msg })),
            error: result.error,
            duration: result.duration,
          });
        } catch (error) {
          await db.updateExecution(executionId.id, ctx.user.id, {
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }, 100);

      return { executionId };
    }),

    stop: protectedProcedure.input(z.object({ executionId: positiveResourceIdSchema })).mutation(async ({ ctx, input }) => {
      await db.updateExecution(input.executionId, ctx.user.id, { status: 'cancelled' });
      return { success: true };
    }),
  }),

  // PDF Report Export
  reports: router({
    exportPDF: protectedProcedure.input(z.object({
      executionId: positiveResourceIdSchema,
      sections: z.object({
        executionDetails: z.boolean().optional().default(true),
        logs: z.boolean().optional().default(true),
        metrics: z.boolean().optional().default(true),
        screenshots: z.boolean().optional().default(true),
      }).optional(),
    })).mutation(async ({ ctx, input }) => {
      const { generatePDFReport } = await import('./pdf-generator');
      
      const execution = await db.getExecutionById(input.executionId, ctx.user.id);
      if (!execution) throw new Error('Execution not found');
      
      const script = await db.getScriptById(execution.scriptId, ctx.user.id);
      if (!script) throw new Error('Script not found');
      
      const logs = execution.logs || [];
      const totalSteps = logs.length;
      const failedSteps = logs.filter((l: any) => l.level === 'error').length;
      const successfulSteps = totalSteps - failedSteps;
      
      const sections = input.sections || {
        executionDetails: true,
        logs: true,
        metrics: true,
        screenshots: true,
      };
      
      const pdfBuffer = await generatePDFReport({
        title: 'Automation Execution Report',
        executionId: execution.id,
        scriptName: script.name,
        status: execution.status,
        startTime: new Date(execution.createdAt),
        endTime: execution.completedAt ? new Date(execution.completedAt) : new Date(),
        duration: execution.duration || 0,
        logs: sections.logs ? logs : [],
        metrics: sections.metrics ? {
          totalSteps,
          successfulSteps,
          failedSteps,
          successRate: totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0,
        } : undefined,
        sections,
      });
      
      return {
        pdf: pdfBuffer.toString('base64'),
        filename: `execution-${execution.id}-report.pdf`,
      };
    }),
  }),

  // AI Workflow Generator
  ai: router({
    credits: protectedProcedure.query(({ ctx }) => getAiCreditStatus(ctx.user.id)),
    chat: protectedProcedure.input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(10_000),
      })).min(1).max(50),
      systemPrompt: z.string().max(5_000).optional(),
      persona: z.enum(['marketing', 'technical', 'general']).optional(),
      saveToHistory: z.boolean().optional(),
    }).superRefine((input, validation) => {
      const totalChars = (input.systemPrompt?.length ?? 0)
        + input.messages.reduce((total, message) => total + message.content.length, 0);
      if (totalChars > MAX_LEGACY_AI_INPUT_CHARS) {
        validation.addIssue({
          code: "custom",
          message: `Celkový AI chat kontext nesmí překročit ${MAX_LEGACY_AI_INPUT_CHARS} znaků.`,
        });
      }
    })).mutation(async ({ ctx, input }) => {
      const { invokeLLM } = await import('./_core/llm');

      // Define persona-specific system prompts
      const personaPrompts = {
        marketing: `You are a QA automation marketing expert focused on ROI and business outcomes. You:
- Emphasize time savings, cost reduction, and conversion rate improvements
- Use business language with concrete metrics (e.g., "reduce testing time by 70%")
- Provide practical examples and case studies
- Focus on competitive advantages and market positioning
- Highlight engagement metrics, viral growth strategies, and social media automation ROI
- Speak in terms of campaigns, conversions, and customer acquisition costs`,
        
        technical: `You are a senior QA automation engineer with deep expertise in testing frameworks. You:
- Use precise technical terminology (Playwright, Cypress, Selenium, Puppeteer)
- Provide code examples and best practices
- Focus on debugging, troubleshooting, and performance optimization
- Explain architecture patterns and testing strategies
- Reference specific APIs, selectors, and automation techniques
- Help with script optimization, error handling, and CI/CD integration`,
        
        general: `You are an expert QA automation assistant. You help users with:
- Creating and debugging automation scripts
- Optimizing workflows and testing strategies
- Providing practical advice for automation challenges
- Explaining concepts clearly and concisely
- Offering step-by-step guidance for implementation`
      };

      const selectedPersona = input.persona || 'general';
      const personaSystemPrompt = personaPrompts[selectedPersona];
      
      const messages = [
        { role: 'system' as const, content: input.systemPrompt || personaSystemPrompt },
        ...input.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ];

      const credits = await requireAiCredit(ctx.user.id, "ai_chat");
      const response = await invokeLLM({ messages });
      const content = response.choices[0]?.message?.content;
      const responseContent = typeof content === 'string' ? content : 'Sorry, I could not generate a response.';

      // Save conversation to history if requested
      if (input.saveToHistory) {
        const userMessage = input.messages[input.messages.length - 1];
        if (userMessage) {
          await db.createAIConversation({
            userId: ctx.user.id,
            role: 'user',
            content: userMessage.content,
            persona: selectedPersona,
          });
        }
        
        await db.createAIConversation({
          userId: ctx.user.id,
          role: 'assistant',
          content: responseContent,
          persona: selectedPersona,
        });
      }

      return { content: responseContent, credits };
    }),
    
    getHistory: protectedProcedure.input(z.object({
      limit: z.number().int().min(1).max(100).optional(),
    })).query(({ ctx, input }) => 
      db.getAIConversationHistory(ctx.user.id, input.limit)
    ),
    
    clearHistory: protectedProcedure.mutation(({ ctx }) => 
      db.clearAIConversationHistory(ctx.user.id)
    ),
    generateWorkflow: protectedProcedure.input(z.object({
      prompt: z.string().min(1).max(5_000),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(5_000),
      })).max(20).optional(),
    }).superRefine((input, validation) => {
      const totalChars = input.prompt.length
        + (input.conversationHistory?.reduce((total, message) => total + message.content.length, 0) ?? 0);
      if (totalChars > MAX_LEGACY_AI_INPUT_CHARS) {
        validation.addIssue({
          code: "custom",
          message: `Celkový AI workflow kontext nesmí překročit ${MAX_LEGACY_AI_INPUT_CHARS} znaků.`,
        });
      }
    })).mutation(async ({ ctx, input }) => {
      const { invokeLLM } = await import('./_core/llm');

      const systemPrompt = `You are an expert automation engineer. Generate a workflow based on the user's description.
Return a JSON object with:
- "explanation": A brief explanation of the workflow
- "workflow": An object with "nodes" array containing steps

Each node should have:
- "id": unique string
- "type": one of "navigate", "click", "fill", "wait", "screenshot", "assert"
- "data": object with relevant fields (url, selector, value, timeout)

Example:
{
  "explanation": "This workflow logs into Twitter and posts a tweet.",
  "workflow": {
    "nodes": [
      { "id": "1", "type": "navigate", "data": { "url": "https://twitter.com/login" } },
      { "id": "2", "type": "fill", "data": { "selector": "input[name='username']", "value": "user@example.com" } }
    ]
  }
}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...(input.conversationHistory || []).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: input.prompt },
      ];

      const credits = await requireAiCredit(ctx.user.id, "workflow_generation");
      const response = await invokeLLM({
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'workflow_generation',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                explanation: { type: 'string' },
                workflow: {
                  type: 'object',
                  properties: {
                    nodes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          type: { type: 'string' },
                          data: { type: 'object', additionalProperties: true },
                        },
                        required: ['id', 'type', 'data'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['nodes'],
                  additionalProperties: false,
                },
              },
              required: ['explanation', 'workflow'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      const result = JSON.parse(typeof content === 'string' ? content : '{}');
      return { ...result, credits };
    }),

    // PDF Summarizer for QA documentation
    summarizePDF: protectedProcedure
      .input(z.object({
        filename: z.string().trim().min(1).max(255),
        fileBase64: z.string().min(1).max(22_500_000),
      }))
      .mutation(async ({ ctx, input }) => {
        const credits = await requireAiCredit(ctx.user.id, "pdf_summary");
        const summary = await summarizePdfWithHermes(input);
        return { summary, credits };
      }),

    // Test Case Generator
    generateTestCases: protectedProcedure
      .input(z.object({
        featureDescription: z.string().min(10).max(5000),
        testType: z.enum(['functional', 'regression', 'smoke', 'e2e', 'api']).default('functional'),
        format: z.enum(['gherkin', 'table', 'markdown']).default('gherkin'),
      }))
      .mutation(async ({ ctx, input }) => {
        const credits = await requireAiCredit(ctx.user.id, "test_case_generation");
        const testCases = await generateTestCasesWithHermes(input);
        return { testCases, credits };
      }),

    // XML Validator with AI insights
    validateXML: protectedProcedure
      .input(z.object({
        xmlContent: z.string().min(1).max(100000),
        xsdContent: z.string().max(100000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const credits = await requireAiCredit(ctx.user.id, "xml_validation");
        const result = await validateXmlWithHermes(input);
        return { result, credits };
      }),
  }),

  // System Metrics (real data via Node.js os module)
  metrics: router({
    system: protectedProcedure.query(() => {
      const cpus = os.cpus();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = Math.round((usedMem / totalMem) * 100);

      // CPU load: average across all cores from os.loadavg (1-min)
      const loadAvg1 = os.loadavg()[0];
      const cpuCount = cpus.length || 1;
      const cpuPercent = Math.min(100, Math.round((loadAvg1 / cpuCount) * 100));

      return {
        cpu: {
          cores: cpuCount,
          loadPercent: cpuPercent,
          loadAvg: { m1: loadAvg1, m5: os.loadavg()[1], m15: os.loadavg()[2] },
        },
        memory: {
          totalMB: Math.round(totalMem / 1024 / 1024),
          usedMB: Math.round(usedMem / 1024 / 1024),
          freeMB: Math.round(freeMem / 1024 / 1024),
          usedPercent: memPercent,
        },
        uptime: {
          seconds: os.uptime(),
          formatted: formatUptime(os.uptime()),
        },
        timestamp: Date.now(),
      };
    }),

    // Hardware settings: save/load custom CPU/GPU labels per user
    getHardwareSettings: protectedProcedure.query(({ ctx }) =>
      getHardwareSettings(ctx.user.id)
    ),
    saveHardwareSettings: protectedProcedure
      .input(z.object({
        cpuLabel: z.string().max(100).optional(),
        gpuLabel: z.string().max(100).optional(),
        gpuVramGB: z.number().min(0).max(256).optional(),
      }))
      .mutation(({ ctx, input }) =>
        saveHardwareSettings(ctx.user.id, input)
      ),
  }),
});

// Helper function to generate documentation content from script
function generateDocumentationContent(script: any): string {
  const lines = [
    `# ${script.name}`,
    ``,
    script.description ? `${script.description}` : '',
    ``,
    `## Workflow Steps`,
    ``,
  ];

  const nodes = script.nodes || [];
  nodes.forEach((node: any, index: number) => {
    lines.push(`### Step ${index + 1}: ${node.data.label || node.type}`);
    lines.push(``);
    lines.push(`**Type:** ${node.type}`);
    if (node.data.url) lines.push(`**URL:** ${node.data.url}`);
    if (node.data.selector) lines.push(`**Selector:** \`${node.data.selector}\``);
    if (node.data.value) lines.push(`**Value:** ${node.data.value}`);
    if (node.data.wait) lines.push(`**Wait:** ${node.data.wait}ms`);
    lines.push(``);
  });

  lines.push(`## Metadata`);
  lines.push(``);
  lines.push(`- **Created:** ${new Date(script.createdAt).toLocaleDateString()}`);
  lines.push(`- **Last Updated:** ${new Date(script.updatedAt).toLocaleDateString()}`);
  lines.push(`- **Total Steps:** ${nodes.length}`);
  lines.push(`- **Status:** ${script.status}`);

  return lines.filter(Boolean).join('\n');
}

export type AppRouter = typeof appRouter;

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
