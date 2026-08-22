import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Sparkles, Copy, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const TEST_TYPES = [
  { value: "functional", label: "Funkční testy" },
  { value: "regression", label: "Regresní testy" },
  { value: "smoke", label: "Smoke testy" },
  { value: "e2e", label: "End-to-End testy" },
  { value: "api", label: "API testy" },
] as const;

const FORMATS = [
  { value: "gherkin", label: "Gherkin (Given/When/Then)" },
  { value: "table", label: "Tabulka (ID, Název, Kroky)" },
  { value: "markdown", label: "Markdown seznam" },
] as const;

const EXAMPLES = [
  {
    label: "Přihlašovací formulář",
    text: "Přihlašovací formulář s polem pro email a heslo. Uživatel se může přihlásit s platnými přihlašovacími údaji. Systém zobrazí chybovou zprávu při neplatných údajích. Po 3 neúspěšných pokusech se účet zablokuje na 15 minut.",
  },
  {
    label: "Nákupní košík",
    text: "Nákupní košík v e-shopu. Uživatel může přidat produkty, změnit množství, odebrat položky. Cena se automaticky přepočítá. Aplikace slevového kódu sníží celkovou cenu. Košík se zachová po odhlášení.",
  },
  {
    label: "REST API endpoint",
    text: "REST API endpoint POST /api/users pro vytvoření nového uživatele. Požaduje: jméno (max 100 znaků), email (validní formát), heslo (min 8 znaků, 1 velké písmeno, 1 číslo). Vrací 201 při úspěchu, 400 při validační chybě, 409 pokud email již existuje.",
  },
];

export default function TestCaseGenerator() {
  const [featureDescription, setFeatureDescription] = useState("");
  const [testType, setTestType] = useState<"functional" | "regression" | "smoke" | "e2e" | "api">("functional");
  const [format, setFormat] = useState<"gherkin" | "table" | "markdown">("gherkin");
  const [result, setResult] = useState<string | null>(null);

  const generateMutation = trpc.ai.generateTestCases.useMutation({
    onSuccess: (data) => {
      setResult(data.testCases);
      toast.success("Testovací případy vygenerovány!");
    },
    onError: (err) => {
      toast.error("Chyba: " + err.message);
    },
  });

  const handleGenerate = () => {
    if (!featureDescription.trim() || featureDescription.length < 10) {
      toast.error("Zadejte popis funkcionality (min. 10 znaků).");
      return;
    }
    generateMutation.mutate({ featureDescription, testType, format });
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Zkopírováno do schránky");
    }
  };

  return (
    <div className="ai-lcars-page space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Generátor Testovacích Případů
          </h1>
          <p className="text-muted-foreground mt-1">
            Popište funkcionalitu a AI vygeneruje kompletní sadu testovacích případů
          </p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Konfigurace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Typ testů</label>
                  <Select value={testType} onValueChange={(v) => setTestType(v as typeof testType)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Formát výstupu</label>
                  <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Popis funkcionality</label>
                <Textarea
                  placeholder="Popište funkcionalitu, kterou chcete otestovat. Zahrňte: co funkce dělá, vstupní podmínky, očekávané výsledky, omezení..."
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                  className="min-h-[180px] bg-background border-border font-mono text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {featureDescription.length} / 5000 znaků
                </p>
              </div>

              <Button
                className="lcars-ai-action w-full"
                disabled={featureDescription.length < 10 || generateMutation.isPending}
                onClick={handleGenerate}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generuji testovací případy...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generovat testovací případy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Příklady</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm"
                  onClick={() => setFeatureDescription(ex.text)}
                >
                  <span className="font-medium text-foreground">{ex.label}</span>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{ex.text}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                Vygenerované testovací případy
              </CardTitle>
              {result && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3 mr-1" />
                  Kopírovat
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <FlaskConical className="h-6 w-6 text-primary absolute inset-0 m-auto" />
                </div>
                <p className="text-muted-foreground text-sm">AI generuje testovací případy...</p>
                <p className="text-xs text-muted-foreground/60">Může to trvat 10–30 sekund</p>
              </div>
            ) : result ? (
              <div className="lcars-ai-output p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono border max-h-[600px] overflow-y-auto">
                {result}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FlaskConical className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground">
                  Zadejte popis funkcionality a klikněte na "Generovat"
                </p>
                <p className="text-xs text-muted-foreground/60">
                  AI vytvoří pozitivní, negativní testy a hraniční případy
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
