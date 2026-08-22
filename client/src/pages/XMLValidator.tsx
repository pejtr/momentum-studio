import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AICreditStatus } from "@/components/AICreditStatus";
import { Textarea } from "@/components/ui/textarea";
import { Code2, Loader2, Sparkles, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testSuite name="LoginTests" version="1.0">
  <testCase id="TC001" priority="high">
    <name>Valid Login Test</name>
    <steps>
      <step order="1">Navigate to login page</step>
      <step order="2">Enter valid credentials</step>
      <step order="3">Click login button</step>
    </steps>
    <expectedResult>User is redirected to dashboard</expectedResult>
  </testCase>
  <testCase id="TC002" priority="medium">
    <name>Invalid Password Test</name>
    <steps>
      <step order="1">Navigate to login page</step>
      <step order="2">Enter invalid password</step>
    </steps>
    <expectedResult>Error message displayed</expectedResult>
  </testCase>
</testSuite>`;

const SAMPLE_XSD = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="testSuite">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="testCase" maxOccurs="unbounded">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="name" type="xs:string"/>
              <xs:element name="steps" type="xs:anyType"/>
              <xs:element name="expectedResult" type="xs:string"/>
            </xs:sequence>
            <xs:attribute name="id" type="xs:string" use="required"/>
            <xs:attribute name="priority" type="xs:string"/>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
      <xs:attribute name="name" type="xs:string" use="required"/>
      <xs:attribute name="version" type="xs:string"/>
    </xs:complexType>
  </xs:element>
</xs:schema>`;

export default function XMLValidator() {
  const [xmlContent, setXmlContent] = useState("");
  const [xsdContent, setXsdContent] = useState("");
  const [showXsd, setShowXsd] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const validateMutation = trpc.ai.validateXML.useMutation({
    onSuccess: (data) => {
      setResult(data.result);
      utils.ai.credits.setData(undefined, data.credits);
      toast.success("Validace dokončena!");
    },
    onError: (err) => {
      toast.error("Chyba: " + err.message);
    },
  });

  const handleValidate = () => {
    if (!xmlContent.trim()) {
      toast.error("Zadejte XML obsah pro validaci.");
      return;
    }
    validateMutation.mutate({
      xmlContent,
      xsdContent: xsdContent.trim() || undefined,
    });
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Zkopírováno do schránky");
    }
  };

  const loadSample = () => {
    setXmlContent(SAMPLE_XML);
    setXsdContent(SAMPLE_XSD);
    setShowXsd(true);
    toast.success("Ukázkový XML/XSD načten");
  };

  return (
    <div className="ai-lcars-page space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            AI XML Validátor
          </h1>
          <p className="text-muted-foreground mt-1">
            Validujte XML strukturu a schéma s AI analýzou a QA doporučeními
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AICreditStatus />
          <Button variant="outline" size="sm" onClick={loadSample}>
            Načíst ukázku
          </Button>
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  XML Obsah
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {xmlContent.length} znaků
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Vložte XML obsah pro validaci..."
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                className="min-h-[220px] bg-background border-border font-mono text-xs resize-none"
              />
            </CardContent>
          </Card>

          {/* XSD Toggle */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">XSD Schéma (volitelné)</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowXsd(!showXsd)}
                >
                  {showXsd ? "Skrýt" : "Přidat XSD"}
                </Button>
              </div>
            </CardHeader>
            {showXsd && (
              <CardContent>
                <Textarea
                  placeholder="Vložte XSD schéma pro validaci struktury..."
                  value={xsdContent}
                  onChange={(e) => setXsdContent(e.target.value)}
                  className="min-h-[180px] bg-background border-border font-mono text-xs resize-none"
                />
              </CardContent>
            )}
          </Card>

          <Button
            className="lcars-ai-action w-full"
            disabled={!xmlContent.trim() || validateMutation.isPending}
            onClick={handleValidate}
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validuji XML...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Spustit AI validaci
              </>
            )}
          </Button>

          {/* Features */}
          <Card className="bg-card border-border">
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Co AI kontroluje:</p>
              {[
                { icon: CheckCircle, text: "Syntaktická správnost XML", color: "text-green-500" },
                { icon: CheckCircle, text: "Shoda se XSD schématem", color: "text-blue-500" },
                { icon: AlertTriangle, text: "Potenciální QA problémy", color: "text-amber-500" },
                { icon: Sparkles, text: "Doporučení pro opravu", color: "text-primary" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2 text-sm">
                  <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                  <span className="text-foreground">{text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Výsledek validace
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
            {validateMutation.isPending ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Code2 className="h-6 w-6 text-primary absolute inset-0 m-auto" />
                </div>
                <p className="text-muted-foreground text-sm">AI analyzuje XML strukturu...</p>
                <p className="text-xs text-muted-foreground/60">Může to trvat 10–20 sekund</p>
              </div>
            ) : result ? (
              <div className="lcars-ai-output p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono border max-h-[600px] overflow-y-auto">
                {result}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 gap-3 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Code2 className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground">
                  Vložte XML a klikněte na "Spustit AI validaci"
                </p>
                <p className="text-xs text-muted-foreground/60">
                  AI zkontroluje strukturu, schéma a QA aspekty
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
