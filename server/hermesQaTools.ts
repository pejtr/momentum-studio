import { z } from "zod";
import { invokeLLM } from "./_core/llm";

const outputText = (content: unknown, fallback: string) =>
  typeof content === "string" ? content : content ? JSON.stringify(content) : fallback;

const testCaseInputSchema = z.object({
  featureDescription: z.string().min(10).max(5000),
  testType: z.enum(["functional", "regression", "smoke", "e2e", "api"]).default("functional"),
  format: z.enum(["gherkin", "table", "markdown"]).default("gherkin"),
  count: z.number().int().min(1).max(20).optional(),
});

const xmlInputSchema = z.object({
  xmlContent: z.string().min(1).max(100000),
  xsdContent: z.string().max(100000).optional(),
});

const pdfInputSchema = z.object({
  filename: z.string().min(1).max(255),
  fileBase64: z.string().min(1).max(22_500_000),
});

export async function generateTestCasesWithHermes(input: unknown) {
  const parsed = testCaseInputSchema.parse(input);
  const formatLabel = parsed.format === "gherkin"
    ? "Gherkin (Given/When/Then)"
    : parsed.format === "table"
      ? "Tabulka (ID, Název, Kroky, Očekávaný výsledek)"
      : "Markdown seznam";
  const requestedCount = parsed.count ? ` Připrav přibližně ${parsed.count} prioritních případů.` : "";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are HERMES, a senior QA automation architect. Generate comprehensive test cases in Czech language.
Format: ${formatLabel}
Test type: ${parsed.testType}
Include: positive tests, negative tests, edge cases, boundary values.${requestedCount}`,
      },
      {
        role: "user",
        content: `Vygeneruj testovací případy pro tuto funkcionalitu:\n\n${parsed.featureDescription}`,
      },
    ],
  });

  return outputText(response.choices?.[0]?.message?.content, "Nepodařilo se vygenerovat testovací případy.");
}

export async function validateXmlWithHermes(input: unknown) {
  const parsed = xmlInputSchema.parse(input);
  const xsdNote = parsed.xsdContent ? " oproti přiloženému XSD schématu" : "";
  const xsdBlock = parsed.xsdContent ? `\n\nXSD Schema:\n\`\`\`xml\n${parsed.xsdContent}\n\`\`\`` : "";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are HERMES, an XML/XSD validation expert and QA automation architect. Analyze the provided XML (and optionally XSD schema) and provide:
1. Validace struktury XML
2. Chyby a varování
3. Shoda se schématem (pokud je XSD poskytnuto)
4. Doporučení pro opravu
5. QA insights - potenciální problémy pro testování

Odpovídej v češtině, buď konkrétní a technický.`,
      },
      {
        role: "user",
        content: `Zvaliduj tento XML dokument${xsdNote}:\n\nXML:\n\`\`\`xml\n${parsed.xmlContent}\n\`\`\`${xsdBlock}`,
      },
    ],
  });

  return outputText(response.choices?.[0]?.message?.content, "Nepodařilo se provést validaci.");
}

export async function summarizePdfWithHermes(input: unknown) {
  const parsed = pdfInputSchema.parse(input);
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are HERMES, a senior QA automation architect. Analyze the provided PDF document and create a structured summary in Czech language focused on:
1. Hlavní účel dokumentu
2. Klíčové testovací požadavky
3. Testovací scénáře a případy
4. Akceptační kritéria
5. Rizika a doporučení

Buď konkrétní a strukturovaný. Použij markdown formátování.`,
      },
      {
        role: "user",
        content: [
          {
            type: "file_url" as const,
            file_url: {
              url: `data:application/pdf;base64,${parsed.fileBase64}`,
              mime_type: "application/pdf" as const,
            },
          },
          {
            type: "text" as const,
            text: `Analyzuj tento PDF dokument '${parsed.filename}' z pohledu QA inženýra a vytvoř strukturované shrnutí v češtině.`,
          },
        ],
      },
    ],
  });

  return outputText(response.choices?.[0]?.message?.content, "Nepodařilo se vygenerovat shrnutí.");
}

export async function executeHermesQaTool(name: string, input: Record<string, unknown>) {
  switch (name) {
    case "generateTestCases":
      return generateTestCasesWithHermes({
        featureDescription: input.feature,
        testType: input.type,
        format: input.format,
        count: input.count,
      });
    case "validateXML":
      return validateXmlWithHermes({
        xmlContent: input.xml,
        xsdContent: input.xsd,
      });
    default:
      throw new Error(`Unsupported HERMES QA tool: ${name}`);
  }
}
