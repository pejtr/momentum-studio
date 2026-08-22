import { Router, Request, Response } from "express";
import { invokeLLMStream } from "./_core/llm";
import { getDb } from "./db";
import { hermesMessages, hermesMemory } from "../drizzle/schema";
import { and, eq, desc } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { consumeAiCredit } from "./aiCredits";

// ─── HERMES System Prompt (same as in hermes.ts) ─────────────────────────────
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

RESPONSE FORMAT:
- Use Markdown headers, code blocks, and tables where appropriate
- Keep responses focused — no padding, no repetition
- For code: always specify language in fenced blocks
- For test cases: use Gherkin or table format as appropriate`;

export const hermesStreamRouter = Router();

/**
 * POST /api/hermes/stream
 * Body: { message: string, sessionId: string }
 * Returns: SSE stream of text/event-stream
 */
hermesStreamRouter.post("/api/hermes/stream", async (req: Request, res: Response) => {
  // HERMES conversations and long-term memory are private user data. Do not
  // allow anonymous streams or cross-user access via guessed session IDs.
  let userId: number;
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    userId = user.id;
  } catch {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { message, sessionId } = req.body as { message?: string; sessionId?: string };

  if (!message || !sessionId) {
    res.status(400).json({ error: "message and sessionId are required" });
    return;
  }

  try {
    const consumption = await consumeAiCredit(userId, "hermes");
    if (!consumption.allowed) {
      const error = consumption.reason === "rate_limited"
        ? `Příliš mnoho AI požadavků. Zkuste to znovu za ${consumption.retryAfterSeconds ?? 1} s.`
        : "Měsíční limit AI kreditů byl vyčerpán. Další kredity budou dostupné při příštím obnovení období.";
      res.status(429).json({
        error,
        credits: consumption.status,
      });
      return;
    }
  } catch (error) {
    console.error("[HERMES SSE] Credit accounting error:", error);
    res.status(503).json({ error: "AI kreditní služba je dočasně nedostupná." });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
  res.flushHeaders();

  const sendEvent = (event: string, data: string) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const db = await getDb();
  if (!db) {
    sendEvent("error", "Database unavailable");
    res.end();
    return;
  }
  const abortController = new AbortController();

  // Abort if client disconnects
  req.on("close", () => abortController.abort());

  try {
    // Load conversation history (last 20 messages)
    const history = await db
      .select()
      .from(hermesMessages)
      .where(and(
        eq(hermesMessages.sessionId, sessionId),
        eq(hermesMessages.userId, userId)
      ))
      .orderBy(desc(hermesMessages.createdAt))
      .limit(20);

    const historyMessages = history
      .reverse()
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Load memory context
    let memoryContext = "";
    const memories = await db
      .select()
      .from(hermesMemory)
      .where(eq(hermesMemory.userId, userId))
      .limit(20);

    if (memories.length > 0) {
      memoryContext =
        "\n\nUSER MEMORY CONTEXT:\n" +
        memories.map((m) => `[${m.category}] ${m.key}: ${m.value}`).join("\n");
    }

    // Save user message to DB
    await db.insert(hermesMessages).values({
      sessionId,
      userId,
      role: "user",
      content: message,
    });

    // Build messages array
    const messages = [
      { role: "system" as const, content: HERMES_SYSTEM_PROMPT + memoryContext },
      ...historyMessages,
      { role: "user" as const, content: message },
    ];

    // Stream the response
    let fullContent = "";

    const stream = invokeLLMStream({
      messages,
      signal: abortController.signal,
    });

    for await (const token of stream) {
      fullContent += token;
      sendEvent("token", token);
    }

    // Save assistant response to DB
    await db.insert(hermesMessages).values({
      sessionId,
      userId,
      role: "assistant",
      content: fullContent,
    });

    // Signal completion
    sendEvent("done", fullContent);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") {
      res.end();
      return;
    }
    console.error("[HERMES SSE] Error:", err);
    sendEvent("error", (err as Error)?.message ?? "Unknown error");
    res.end();
  }
});
