import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  consumeAiCredit: vi.fn(),
  invokeLLM: vi.fn(),
  createAICommentHistory: vi.fn(),
}));

vi.mock("./aiCredits", () => ({
  consumeAiCredit: mocks.consumeAiCredit,
  getAiCreditStatus: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: mocks.invokeLLM,
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createAICommentHistory: mocks.createAICommentHistory,
  };
});

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990015,
      openId: "legacy-ai-credit-test",
      email: "legacy-ai-credit@example.test",
      name: "Legacy AI Credit Test",
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

const allowedStatus = {
  allowance: 30,
  used: 1,
  remaining: 29,
  periodStart: new Date("2026-08-01T00:00:00.000Z"),
  nextResetAt: new Date("2026-09-01T00:00:00.000Z"),
};

describe("legacy AI credit enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeAiCredit.mockResolvedValue({ allowed: true, status: allowedStatus });
    mocks.createAICommentHistory.mockResolvedValue({ id: 1 });
  });

  it.each([
    ["ai.chat", (caller: ReturnType<typeof appRouter.createCaller>) => caller.ai.chat({ messages: [{ role: "user", content: "Create a smoke test plan." }] })],
    ["ai.generateWorkflow", (caller: ReturnType<typeof appRouter.createCaller>) => caller.ai.generateWorkflow({ prompt: "Open the login page and verify the heading." })],
    ["engagement.ai.generateComment", (caller: ReturnType<typeof appRouter.createCaller>) => caller.engagement.ai.generateComment({ platform: "instagram", postContent: "A release update for our QA platform." })],
  ])("blocks %s before calling the model when a credit cannot be reserved", async (_name, invoke) => {
    mocks.consumeAiCredit.mockResolvedValue({
      allowed: false,
      status: allowedStatus,
      reason: "rate_limited",
      retryAfterSeconds: 12,
    });
    const caller = appRouter.createCaller(createContext());

    await expect(invoke(caller)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("records a distinct usage tool before each allowed legacy AI invocation", async () => {
    mocks.invokeLLM
      .mockResolvedValueOnce({ choices: [{ message: { content: "Use a focused test plan." } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ explanation: "Login workflow", workflow: { nodes: [] } }) } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: "Výborná zpráva pro QA tým." } }] });
    const caller = appRouter.createCaller(createContext());

    await caller.ai.chat({ messages: [{ role: "user", content: "Create a smoke test plan." }] });
    await caller.ai.generateWorkflow({ prompt: "Open the login page and verify the heading." });
    await caller.engagement.ai.generateComment({ platform: "instagram", postContent: "A release update for our QA platform." });

    expect(mocks.consumeAiCredit).toHaveBeenNthCalledWith(1, 990015, "ai_chat");
    expect(mocks.consumeAiCredit).toHaveBeenNthCalledWith(2, 990015, "workflow_generation");
    expect(mocks.consumeAiCredit).toHaveBeenNthCalledWith(3, 990015, "engagement_comment");
    expect(mocks.invokeLLM).toHaveBeenCalledTimes(3);
  });

  it("rejects oversized legacy AI input before reserving a credit", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.ai.generateWorkflow({ prompt: "x".repeat(5_001) })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mocks.consumeAiCredit).not.toHaveBeenCalled();
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });
});
