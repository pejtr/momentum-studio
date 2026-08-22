import { describe, expect, it } from "vitest";
import { MAX_HERMES_TOOL_CALLS, parseHermesMemoryOutput, parseHermesToolCall } from "./hermesOutputValidation";

describe("HERMES model-output validation", () => {
  it("accepts only recognized tools with bounded, schema-valid input", () => {
    expect(parseHermesToolCall("generateTestCases", {
      feature: "Customer can reset a password with an emailed link.",
      type: "regression",
      count: 8,
    })).toMatchObject({ name: "generateTestCases" });

    expect(parseHermesToolCall("executeScript", {})).toBeNull();
    expect(parseHermesToolCall("generateTestCases", { feature: "short" })).toBeNull();
    expect(parseHermesToolCall("validateXML", { xml: "x".repeat(100_001) })).toBeNull();
    expect(parseHermesToolCall("analyzeCode", { code: "x", unexpected: true })).toBeNull();
  });

  it("fails closed for malformed, oversized and excessive persistent-memory output", () => {
    expect(parseHermesMemoryOutput("not-json")).toEqual([]);
    expect(parseHermesMemoryOutput(JSON.stringify({
      items: [{ key: "k".repeat(129), value: "valid", category: "fact" }],
    }))).toEqual([]);
    expect(parseHermesMemoryOutput(JSON.stringify({
      items: [
        { key: "one", value: "1", category: "fact" },
        { key: "two", value: "2", category: "fact" },
        { key: "three", value: "3", category: "fact" },
        { key: "four", value: "4", category: "fact" },
      ],
    }))).toEqual([]);
  });

  it("preserves valid bounded memory items and enforces a small tool-call ceiling", () => {
    expect(parseHermesMemoryOutput(JSON.stringify({
      items: [{ key: "preferred-framework", value: "Playwright", category: "preference" }],
    }))).toEqual([{ key: "preferred-framework", value: "Playwright", category: "preference" }]);
    expect(MAX_HERMES_TOOL_CALLS).toBe(3);
  });
});
