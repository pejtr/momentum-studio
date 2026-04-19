import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { hermesMessages, hermesMemory } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

// ─── HERMES System Prompt ────────────────────────────────────────────────────
const HERMES_SYSTEM_PROMPT = `You are HERMES — the Core AI Agent of OMNIMATRIX QA Automation Platform.

IDENTITY:
- Name: HERMES (Highly Efficient Reasoning & Multi-task Execution System)
- Role: Senior QA Automation Architect & AI Operations Core
- Personality: Precise, proactive, technically authoritative, concise. Never sycophantic.
- Communication: Direct, structured, uses Markdown. No greetings. No filler phrases.

CAPABILITIES:
1. QA Test Strategy — design test plans, test cases, coverage matrices
2. Automation Engineering — Playwright, Cypress, Selenium, Puppeteer, k6
3. Code Generation — TypeScript/JavaScript automation scripts, BDD Gherkin
4. CI/CD Integration — GitHub Actions, Jenkins, GitLab CI, Docker
5. Security Testing — OWASP Top 10, penetration test planning
6. Performance Testing — load testing strategy, k6 scripts
7. XML/JSON Validation — schema validation, XPath, JSONPath
8. API Testing — REST, GraphQL, SOAP test design
9. Root Cause Analysis — log analysis, failure triage
10. Architecture Review — test pyramid, shift-left strategy

TOOL USE:
When the user asks you to perform an action that maps to a tool, respond with a JSON block:
\`\`\`tool
{"name": "generateTestCases", "input": {"feature": "...", "type": "functional"}}
\`\`\`
Available tools: generateTestCases, validateXML, summarizePDF, executeScript, searchDocs

MEMORY:
You have access to persistent memory about this user. Use it to personalize responses.
Always extract and remember: user preferences, tech stack, project context, recurring issues.

RESPONSE FORMAT:
- Use Markdown headers, code blocks, and tables where appropriate
- Keep responses focused — no padding, no repetition
- For code: always specify language in fenced blocks
- For test cases: use Gherkin or table format as appropriate`;

// ─── Tool Definitions ────────────────────────────────────────────────────────
const HERMES_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "generateTestCases",
      description: "Generate structured test cases for a given feature or user story",
      parameters: {
        type: "object",
        properties: {
          feature: { type: "string", description: "Feature or user story description" },
          type: { type: "string", enum: ["functional", "regression", "smoke", "e2e", "api", "security", "performance"] },
          format: { type: "string", enum: ["gherkin", "table", "markdown"] },
          count: { type: "number", description: "Number of test cases to generate (default 5)" }
        },
        required: ["feature"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "validateXML",
      description: "Validate XML structure and optionally against an XSD schema",
      parameters: {
        type: "object",
        properties: {
          xml: { type: "string", description: "XML content to validate" },
          xsd: { type: "string", description: "Optional XSD schema for validation" }
        },
        required: ["xml"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "analyzeCode",
      description: "Analyze automation code for bugs, anti-patterns, and improvements",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code to analyze" },
          language: { type: "string", description: "Programming language" },
          focus: { type: "string", enum: ["bugs", "performance", "security", "best-practices", "all"] }
        },
        required: ["code"],
        additionalProperties: false
      }
    }
  }
];

// ─── Tool Executor ────────────────────────────────────────────────────────────
async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "generateTestCases": {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: "You are a QA expert. Generate test cases in the requested format. Be thorough and precise." },
          { role: "user", content: `Generate ${input.count || 5} ${input.type || "functional"} test cases for: ${input.feature}\nFormat: ${input.format || "gherkin"}` }
        ]
      });
      return typeof result.choices[0].message.content === "string"
        ? result.choices[0].message.content
        : JSON.stringify(result.choices[0].message.content);
    }
    case "validateXML": {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: "You are an XML expert. Validate the XML and report issues with line numbers and fix suggestions." },
          { role: "user", content: `Validate this XML:\n\`\`\`xml\n${input.xml}\n\`\`\`${input.xsd ? `\n\nAgainst XSD:\n\`\`\`xml\n${input.xsd}\n\`\`\`` : ""}` }
        ]
      });
      return typeof result.choices[0].message.content === "string"
        ? result.choices[0].message.content
        : JSON.stringify(result.choices[0].message.content);
    }
    case "analyzeCode": {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: "You are a senior QA automation engineer. Analyze code for issues and improvements." },
          { role: "user", content: `Analyze this ${input.language || ""} code (focus: ${input.focus || "all"}):\n\`\`\`${input.language || ""}\n${input.code}\n\`\`\`` }
        ]
      });
      return typeof result.choices[0].message.content === "string"
        ? result.choices[0].message.content
        : JSON.stringify(result.choices[0].message.content);
    }
    default:
      return `Tool "${name}" executed with input: ${JSON.stringify(input)}`;
  }
}

// ─── Memory Extractor ─────────────────────────────────────────────────────────
async function extractAndSaveMemory(userId: number, conversation: string) {
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Extract key facts, preferences, and context from this conversation to remember about the user.
Return JSON array of memory items: [{"key": "...", "value": "...", "category": "preference|fact|skill|context|goal"}]
Only extract genuinely useful persistent facts. Max 3 items. If nothing worth remembering, return [].`
        },
        { role: "user", content: conversation }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "memory_items",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: { type: "string" },
                    value: { type: "string" },
                    category: { type: "string" }
                  },
                  required: ["key", "value", "category"],
                  additionalProperties: false
                }
              }
            },
            required: ["items"],
            additionalProperties: false
          }
        }
      }
    });

    const content = result.choices[0].message.content;
    const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
    const items = parsed.items || [];

    const dbConn = await getDb();
    if (!dbConn) return;
    for (const item of items) {
      // Upsert memory: update if key exists, insert if not
      const existing = await dbConn
        .select()
        .from(hermesMemory)
        .where(and(eq(hermesMemory.userId, userId), eq(hermesMemory.key, item.key)))
        .limit(1);

      if (existing.length > 0) {
        await dbConn
          .update(hermesMemory)
          .set({ value: item.value, category: item.category as "preference" | "fact" | "skill" | "context" | "goal" })
          .where(and(eq(hermesMemory.userId, userId), eq(hermesMemory.key, item.key)));
      } else {
        await dbConn.insert(hermesMemory).values({
          userId,
          key: item.key,
          value: item.value,
          category: item.category as "preference" | "fact" | "skill" | "context" | "goal",
          confidence: 85
        });
      }
    }
  } catch {
    // Memory extraction is non-critical, fail silently
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const hermesRouter = router({
  // Send a message to HERMES and get a response
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(8000),
      sessionId: z.string().min(1).max(64),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Load memory context
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const memories = await dbConn
        .select()
        .from(hermesMemory)
        .where(eq(hermesMemory.userId, userId))
        .orderBy(desc(hermesMemory.updatedAt))
        .limit(20);

      const memoryContext = memories.length > 0
        ? `\n\nUSER MEMORY:\n${memories.map(m => `- [${m.category}] ${m.key}: ${m.value}`).join("\n")}`
        : "";

      // Load recent session history (last 20 messages)
      const history = await dbConn
        .select()
        .from(hermesMessages)
        .where(and(
          eq(hermesMessages.userId, userId),
          eq(hermesMessages.sessionId, input.sessionId)
        ))
        .orderBy(desc(hermesMessages.createdAt))
        .limit(20);

      const historyMessages = history.reverse().map((m: typeof history[0]) => ({
        role: m.role as "user" | "assistant" | "system" | "tool",
        content: m.content
      }));

      // Save user message
      await dbConn.insert(hermesMessages).values({
        userId,
        sessionId: input.sessionId,
        role: "user",
        content: input.message
      });

      // Build messages for LLM
      const messages = [
        { role: "system" as const, content: HERMES_SYSTEM_PROMPT + memoryContext },
        ...historyMessages,
        { role: "user" as const, content: input.message }
      ];

      // First LLM call — may include tool use
      const response = await invokeLLM({ messages, tools: HERMES_TOOLS as Parameters<typeof invokeLLM>[0]["tools"], tool_choice: "auto" });
      const firstChoice = response.choices[0];

      let finalContent = "";

      // Handle tool calls if present
      if (firstChoice.finish_reason === "tool_calls" && firstChoice.message.tool_calls) {
        const toolResults: string[] = [];

        for (const toolCall of firstChoice.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolInput = JSON.parse(toolCall.function.arguments || "{}");

          // Save tool call message
          await dbConn.insert(hermesMessages).values({
            userId,
            sessionId: input.sessionId,
            role: "tool",
            content: `Calling tool: ${toolName}`,
            toolName,
            toolInput
          });

          // Execute tool
          const toolOutput = await executeTool(toolName, toolInput);
          toolResults.push(`**Tool: ${toolName}**\n\n${toolOutput}`);

          // Save tool result
          await dbConn.insert(hermesMessages).values({
            userId,
            sessionId: input.sessionId,
            role: "tool",
            content: toolOutput,
            toolName,
            toolOutput
          });
        }

        // Second LLM call with tool results
        const followUpMessages = [
          ...messages,
          { role: "assistant" as const, content: firstChoice.message.content || "" },
          { role: "user" as const, content: `Tool results:\n\n${toolResults.join("\n\n---\n\n")}\n\nPlease provide your final response based on these results.` }
        ];

        const followUp = await invokeLLM({ messages: followUpMessages });
        finalContent = typeof followUp.choices[0].message.content === "string"
          ? followUp.choices[0].message.content
          : JSON.stringify(followUp.choices[0].message.content);
      } else {
        finalContent = typeof firstChoice.message.content === "string"
          ? firstChoice.message.content
          : JSON.stringify(firstChoice.message.content);
      }

      // Save assistant response
      await dbConn.insert(hermesMessages).values({
        userId,
        sessionId: input.sessionId,
        role: "assistant",
        content: finalContent
      });

      // Async memory extraction (don't await — non-blocking)
      const conversationSnippet = `User: ${input.message}\nHERMES: ${finalContent}`;
      extractAndSaveMemory(userId, conversationSnippet);

      return { content: finalContent, sessionId: input.sessionId };
    }),

  // Get conversation history for a session
  getHistory: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) return [];
      return dbConn
        .select()
        .from(hermesMessages)
        .where(and(
          eq(hermesMessages.userId, ctx.user.id),
          eq(hermesMessages.sessionId, input.sessionId)
        ))
        .orderBy(hermesMessages.createdAt)
        .limit(input.limit);
    }),

  // List all sessions for the user
  getSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const dbConn = await getDb();
      if (!dbConn) return [];
      const sessions = await dbConn
        .select({
          sessionId: hermesMessages.sessionId,
          lastMessage: sql<string>`MAX(${hermesMessages.content})`,
          messageCount: sql<number>`COUNT(*)`,
          lastActivity: sql<Date>`MAX(${hermesMessages.createdAt})`
        })
        .from(hermesMessages)
        .where(eq(hermesMessages.userId, ctx.user.id))
        .groupBy(hermesMessages.sessionId)
        .orderBy(desc(sql`MAX(${hermesMessages.createdAt})`))
        .limit(20);
      return sessions;
    }),

  // Clear a session's history
  clearSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) return { success: false };
      await dbConn
        .delete(hermesMessages)
        .where(and(
          eq(hermesMessages.userId, ctx.user.id),
          eq(hermesMessages.sessionId, input.sessionId)
        ));
      return { success: true };
    }),

  // Get user's memory
  getMemory: protectedProcedure
    .query(async ({ ctx }) => {
      const dbConn = await getDb();
      if (!dbConn) return [];
      return dbConn
        .select()
        .from(hermesMemory)
        .where(eq(hermesMemory.userId, ctx.user.id))
        .orderBy(desc(hermesMemory.updatedAt));
    }),

  // Delete a memory item
  deleteMemory: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) return { success: false };
      await dbConn
        .delete(hermesMemory)
        .where(and(
          eq(hermesMemory.id, input.id),
          eq(hermesMemory.userId, ctx.user.id)
        ));
      return { success: true };
    }),
});
