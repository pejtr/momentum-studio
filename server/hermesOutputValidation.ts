import { z } from "zod";

export const MAX_HERMES_TOOL_CALLS = 3;

const generateTestCasesInputSchema = z.object({
  feature: z.string().trim().min(10).max(5_000),
  type: z.enum(["functional", "regression", "smoke", "e2e", "api"]).optional(),
  format: z.enum(["gherkin", "table", "markdown"]).optional(),
  count: z.number().int().min(1).max(20).optional(),
}).strict();

const validateXmlInputSchema = z.object({
  xml: z.string().min(1).max(100_000),
  xsd: z.string().max(100_000).optional(),
}).strict();

const analyzeCodeInputSchema = z.object({
  code: z.string().min(1).max(50_000),
  language: z.string().trim().max(100).optional(),
  focus: z.enum(["bugs", "performance", "security", "best-practices", "all"]).optional(),
}).strict();

export type HermesValidatedToolCall =
  | { name: "generateTestCases"; input: z.infer<typeof generateTestCasesInputSchema> }
  | { name: "validateXML"; input: z.infer<typeof validateXmlInputSchema> }
  | { name: "analyzeCode"; input: z.infer<typeof analyzeCodeInputSchema> };

export function parseHermesToolCall(name: string, input: unknown): HermesValidatedToolCall | null {
  if (name === "generateTestCases") {
    const parsed = generateTestCasesInputSchema.safeParse(input);
    return parsed.success ? { name, input: parsed.data } : null;
  }
  if (name === "validateXML") {
    const parsed = validateXmlInputSchema.safeParse(input);
    return parsed.success ? { name, input: parsed.data } : null;
  }
  if (name === "analyzeCode") {
    const parsed = analyzeCodeInputSchema.safeParse(input);
    return parsed.success ? { name, input: parsed.data } : null;
  }
  return null;
}

const hermesMemoryItemSchema = z.object({
  key: z.string().trim().min(1).max(128),
  value: z.string().trim().min(1).max(2_000),
  category: z.enum(["preference", "fact", "skill", "context", "goal"]),
}).strict();

const hermesMemoryOutputSchema = z.object({
  items: z.array(hermesMemoryItemSchema).max(3),
}).strict();

export type HermesMemoryItem = z.infer<typeof hermesMemoryItemSchema>;

export function parseHermesMemoryOutput(content: unknown): HermesMemoryItem[] {
  try {
    const parsedContent = typeof content === "string" ? JSON.parse(content) : content;
    const parsed = hermesMemoryOutputSchema.safeParse(parsedContent);
    return parsed.success ? parsed.data.items : [];
  } catch {
    return [];
  }
}
