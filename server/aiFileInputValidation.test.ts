import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeAiCredit: vi.fn(),
  summarizePdfWithHermes: vi.fn(),
  validateXmlWithHermes: vi.fn(),
}));

vi.mock("./aiCredits", () => ({
  consumeAiCredit: mocks.consumeAiCredit,
}));
vi.mock("./hermesQaTools", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./hermesQaTools")>();
  return {
    ...actual,
    summarizePdfWithHermes: mocks.summarizePdfWithHermes,
    validateXmlWithHermes: mocks.validateXmlWithHermes,
  };
});

import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 990030,
      openId: "ai-file-input-bounds",
      email: "ai-file-input-bounds@example.test",
      name: "AI File Input Bounds",
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

describe("AI file input bounds", () => {
  it("rejects oversized PDF metadata and base64 before reserving a credit", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.ai.summarizePDF({
      filename: "x".repeat(256),
      fileBase64: "aGVsbG8=",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.ai.summarizePDF({
      filename: "qa-report.pdf",
      fileBase64: "x".repeat(22_500_001),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.consumeAiCredit).not.toHaveBeenCalled();
    expect(mocks.summarizePdfWithHermes).not.toHaveBeenCalled();
  });

  it("rejects oversized XSD content before reserving a credit", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.ai.validateXML({
      xmlContent: "<root />",
      xsdContent: "x".repeat(100_001),
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.consumeAiCredit).not.toHaveBeenCalled();
    expect(mocks.validateXmlWithHermes).not.toHaveBeenCalled();
  });
});
