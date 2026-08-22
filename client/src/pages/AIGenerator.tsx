import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AICreditStatus } from "@/components/AICreditStatus";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  Wand2,
} from "lucide-react";

export default function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const utils = trpc.useUtils();

  const generateMutation = trpc.ai.generateWorkflow.useMutation({
    onSuccess: (data) => {
      setConversation(prev => [
        ...prev,
        { role: "assistant", content: data.explanation },
      ]);
      setGeneratedWorkflow(data.workflow);
      utils.ai.credits.invalidate();
      toast.success("Workflow generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate workflow: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setConversation(prev => [...prev, { role: "user", content: prompt }]);
    generateMutation.mutate({ prompt, conversationHistory: conversation });
    setPrompt("");
  };

  const handleSaveWorkflow = () => {
    if (!generatedWorkflow) return;

    // TODO: Save to scripts
    toast.success("Workflow saved to scripts!");
  };

  const handleCopyCode = () => {
    if (!generatedWorkflow) return;

    const code = JSON.stringify(generatedWorkflow, null, 2);
    navigator.clipboard.writeText(code);
    toast.success("Workflow copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Workflow Generator</h1>
            <p className="text-sm text-muted-foreground">
              Describe your automation in natural language
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AICreditStatus />
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start Creating with AI</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Describe your automation workflow in plain English, and I'll generate
                  the complete automation script for you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 max-w-2xl">
                  {[
                    "Create a script that logs into Twitter and posts a tweet",
                    "Build a workflow to scrape product prices from Amazon",
                    "Automate filling out a contact form with test data",
                    "Generate a script to take screenshots of multiple pages",
                  ].map((example, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="text-left h-auto py-3 px-4"
                      onClick={() => setPrompt(example)}
                    >
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {example}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <Card
                    className={`p-4 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "glass-card"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
              ))
            )}
            {generateMutation.isPending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <Card className="p-4 glass-card">
                  <p className="text-sm text-muted-foreground">
                    Generating your workflow...
                  </p>
                </Card>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your automation workflow..."
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generateMutation.isPending}
                size="lg"
                className="shrink-0"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Preview */}
        {generatedWorkflow && (
          <>
            <Separator orientation="vertical" />
            <div className="w-[400px] flex flex-col border-l border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Generated Workflow
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {generatedWorkflow.nodes?.map((node: any, idx: number) => (
                  <Card key={idx} className="p-3 glass-card-hover">
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{node.type}</p>
                        {node.data.url && (
                          <p className="text-xs text-muted-foreground truncate">
                            {node.data.url}
                          </p>
                        )}
                        {node.data.selector && (
                          <p className="text-xs text-muted-foreground truncate">
                            {node.data.selector}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="p-4 border-t border-border space-y-2">
                <Button onClick={handleSaveWorkflow} className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Save to Scripts
                </Button>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
