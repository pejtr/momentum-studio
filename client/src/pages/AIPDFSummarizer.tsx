import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AICreditStatus } from "@/components/AICreditStatus";
import { FileText, Upload, Loader2, Sparkles, Copy, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AIPDFSummarizer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();

  const summarizeMutation = trpc.ai.summarizePDF.useMutation({
    onSuccess: (data) => {
      setSummary(data.summary);
      utils.ai.credits.setData(undefined, data.credits);
      setIsLoading(false);
      toast.success("Shrnutí vygenerováno!");
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error("Chyba: " + err.message);
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Prosím vyberte PDF soubor.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Soubor je příliš velký (max 16 MB).");
      return;
    }
    setSelectedFile(file);
    setSummary(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      summarizeMutation.mutate({
        filename: selectedFile.name,
        fileBase64: base64,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast.success("Zkopírováno do schránky");
    }
  };

  return (
    <div className="ai-lcars-page space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            AI PDF Sumarizátor
          </h1>
          <p className="text-muted-foreground mt-1">
            Nahrajte QA dokumentaci nebo testovací specifikace a získejte strukturované shrnutí
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AICreditStatus />
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Nahrát PDF dokument
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">
                {selectedFile ? selectedFile.name : "Přetáhněte PDF nebo klikněte pro výběr"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Maximální velikost: 16 MB"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">{selectedFile.name}</span>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">PDF</Badge>
              </div>
            )}

            <Button
              className="lcars-ai-action w-full"
              disabled={!selectedFile || isLoading}
              onClick={handleAnalyze}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzuji dokument...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generovat shrnutí
                </>
              )}
            </Button>

            {/* Tips */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ideální pro:</p>
              {[
                "Testovací specifikace a test plány",
                "QA dokumentaci a reporty",
                "API dokumentaci (Swagger/OpenAPI)",
                "Technické požadavky a user stories",
              ].map((tip) => (
                <div key={tip} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Output */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Shrnutí
              </CardTitle>
              {summary && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-3 w-3 mr-1" />
                    Kopírovat
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="h-6 w-6 text-primary absolute inset-0 m-auto" />
                </div>
                <p className="text-muted-foreground text-sm">AI analyzuje dokument...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="lcars-ai-output p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono border max-h-96 overflow-y-auto">
                  {summary}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground">
                  Nahrajte PDF dokument a klikněte na "Generovat shrnutí"
                </p>
                <p className="text-xs text-muted-foreground/60">
                  AI vytvoří strukturované shrnutí zaměřené na QA aspekty
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
