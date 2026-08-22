import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLMMock } = vi.hoisted(() => ({ invokeLLMMock: vi.fn() }));

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
}));

import {
  executeHermesQaTool,
  generateTestCasesWithHermes,
  summarizePdfWithHermes,
  validateXmlWithHermes,
} from "./hermesQaTools";

const llmResponse = (content: string) => ({
  choices: [{ message: { content } }],
});

beforeEach(() => {
  invokeLLMMock.mockReset();
  invokeLLMMock.mockResolvedValue(llmResponse("HERMES QA output"));
});

describe("HERMES QA orchestration", () => {
  it("creates Czech test-case instructions from the shared contract", async () => {
    const result = await generateTestCasesWithHermes({
      featureDescription: "Přihlášení s platným emailem a heslem musí otevřít dashboard.",
      testType: "regression",
      format: "gherkin",
      count: 6,
    });

    expect(result).toBe("HERMES QA output");
    const request = invokeLLMMock.mock.calls[0]?.[0];
    expect(request.messages[0].content).toContain("You are HERMES");
    expect(request.messages[0].content).toContain("Test type: regression");
    expect(request.messages[1].content).toContain("Přihlášení s platným emailem");
  });

  it("passes XML and optional XSD through the shared HERMES validation workflow", async () => {
    const result = await validateXmlWithHermes({
      xmlContent: "<suite><test/></suite>",
      xsdContent: "<xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" />",
    });

    expect(result).toBe("HERMES QA output");
    const request = invokeLLMMock.mock.calls[0]?.[0];
    expect(request.messages[0].content).toContain("XML/XSD validation expert");
    expect(request.messages[1].content).toContain("<suite><test/></suite>");
    expect(request.messages[1].content).toContain("XSD Schema");
  });

  it("keeps PDF input server-side and sends it as a PDF file payload", async () => {
    const result = await summarizePdfWithHermes({
      filename: "qa-spec.pdf",
      fileBase64: "JVBERi0xLjQ=",
    });

    expect(result).toBe("HERMES QA output");
    const request = invokeLLMMock.mock.calls[0]?.[0];
    const userContent = request.messages[1].content;
    expect(userContent[0]).toMatchObject({
      type: "file_url",
      file_url: { mime_type: "application/pdf" },
    });
    expect(userContent[0].file_url.url).toContain("data:application/pdf;base64,JVBERi0xLjQ=");
  });

  it("maps HERMES tool-call field names to the shared test and XML contracts", async () => {
    await executeHermesQaTool("generateTestCases", {
      feature: "API vrací 201 po validním vstupu.",
      type: "api",
      format: "table",
      count: 4,
    });
    expect(invokeLLMMock.mock.calls[0]?.[0].messages[0].content).toContain("Test type: api");

    invokeLLMMock.mockClear();
    await executeHermesQaTool("validateXML", { xml: "<api />" });
    expect(invokeLLMMock.mock.calls[0]?.[0].messages[1].content).toContain("<api />");
  });
});
