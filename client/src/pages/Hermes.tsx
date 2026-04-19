import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Streamdown } from "streamdown";
import {
  Brain,
  Send,
  Trash2,
  Plus,
  ChevronRight,
  Zap,
  Database,
  Clock,
  Shield,
  Terminal,
  Cpu,
  MemoryStick,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
  timestamp: Date;
  isLoading?: boolean;
}

// ─── HERMES Status Bar ────────────────────────────────────────────────────────
function HermesStatusBar({ sessionId }: { sessionId: string }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-[#00ff41]/20 bg-black/40 text-xs font-mono text-[#00ff41]/70">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_6px_#00ff41]" />
        <span>HERMES ONLINE</span>
      </div>
      <Separator orientation="vertical" className="h-3 bg-[#00ff41]/30" />
      <div className="flex items-center gap-1">
        <Cpu className="w-3 h-3" />
        <span>CORE AI v2.0</span>
      </div>
      <Separator orientation="vertical" className="h-3 bg-[#00ff41]/30" />
      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3" />
        <span>QA AUTOMATION CORE</span>
      </div>
      <Separator orientation="vertical" className="h-3 bg-[#00ff41]/30" />
      <div className="flex items-center gap-1">
        <Terminal className="w-3 h-3" />
        <span className="text-[#00ff41]/50">SESSION: {sessionId.slice(0, 8).toUpperCase()}</span>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{time.toLocaleTimeString("cs-CZ")}</span>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const isTool = msg.role === "tool";

  if (isTool) {
    return (
      <div className="flex items-start gap-2 py-1 px-4">
        <Zap className="w-3 h-3 mt-1 text-yellow-400 shrink-0" />
        <span className="text-xs font-mono text-yellow-400/70">
          TOOL CALL: {msg.toolName || "unknown"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold font-mono border",
          isUser
            ? "bg-[#00ff41]/10 border-[#00ff41]/40 text-[#00ff41]"
            : "bg-[#001a00] border-[#00ff41]/60 text-[#00ff41] shadow-[0_0_8px_#00ff4130]"
        )}
      >
        {isUser ? "PM" : "H"}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 text-xs font-mono text-[#00ff41]/50">
          {isUser ? "OPERATOR" : "HERMES"}
          <span className="text-[#00ff41]/30">
            {msg.timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div
          className={cn(
            "rounded px-3 py-2 text-sm font-mono leading-relaxed",
            isUser
              ? "bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41]"
              : "bg-[#001a00] border border-[#00ff41]/20 text-[#00ff41]/90"
          )}
        >
          {msg.isLoading ? (
            <div className="flex items-center gap-2">
              <span className="text-[#00ff41]/60">PROCESSING</span>
              <span className="animate-pulse">▋</span>
            </div>
          ) : (
            <Streamdown>{msg.content}</Streamdown>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Memory Panel ─────────────────────────────────────────────────────────────
function MemoryPanel({ onClose }: { onClose: () => void }) {
  const { data: memories, refetch } = trpc.hermes.getMemory.useQuery();
  const deleteMemory = trpc.hermes.deleteMemory.useMutation({
    onSuccess: () => refetch(),
  });

  const categoryColors: Record<string, string> = {
    preference: "text-blue-400 border-blue-400/30",
    fact: "text-green-400 border-green-400/30",
    skill: "text-purple-400 border-purple-400/30",
    context: "text-yellow-400 border-yellow-400/30",
    goal: "text-red-400 border-red-400/30",
  };

  return (
    <div className="w-72 border-l border-[#00ff41]/20 bg-black/60 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#00ff41]/20">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00ff41]">
          <MemoryStick className="w-3.5 h-3.5" />
          <span>HERMES MEMORY</span>
        </div>
        <Button variant="ghost" size="icon" className="w-6 h-6 text-[#00ff41]/50 hover:text-[#00ff41]" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-3">
        {!memories || memories.length === 0 ? (
          <p className="text-xs font-mono text-[#00ff41]/40 text-center py-8">
            NO MEMORY STORED
          </p>
        ) : (
          <div className="space-y-2">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="group relative rounded border border-[#00ff41]/10 bg-[#001a00]/50 p-2"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1 py-0 font-mono uppercase",
                          categoryColors[mem.category] || "text-[#00ff41]/50 border-[#00ff41]/20"
                        )}
                      >
                        {mem.category}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-mono text-[#00ff41]/80 font-semibold truncate">{mem.key}</p>
                    <p className="text-[10px] font-mono text-[#00ff41]/50 mt-0.5 line-clamp-2">{mem.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-5 h-5 opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 shrink-0"
                    onClick={() => deleteMemory.mutate({ id: mem.id })}
                  >
                    <X className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Session List ─────────────────────────────────────────────────────────────
function SessionList({
  currentSessionId,
  onSelect,
  onNew,
}: {
  currentSessionId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const { data: sessions } = trpc.hermes.getSessions.useQuery();

  return (
    <div className="w-56 border-r border-[#00ff41]/20 bg-black/40 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b border-[#00ff41]/20">
        <span className="text-xs font-mono text-[#00ff41]/70">SESSIONS</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 text-[#00ff41]/60 hover:text-[#00ff41] hover:bg-[#00ff41]/10"
          onClick={onNew}
          title="New session"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {!sessions || sessions.length === 0 ? (
            <p className="text-[10px] font-mono text-[#00ff41]/30 text-center py-4">NO SESSIONS</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => onSelect(s.sessionId)}
                className={cn(
                  "w-full text-left rounded px-2 py-1.5 text-[10px] font-mono transition-colors",
                  s.sessionId === currentSessionId
                    ? "bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/30"
                    : "text-[#00ff41]/50 hover:bg-[#00ff41]/5 hover:text-[#00ff41]/80"
                )}
              >
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{s.sessionId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="text-[#00ff41]/30 mt-0.5 ml-3.5 truncate">
                  {s.messageCount} msgs
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main HERMES Page ─────────────────────────────────────────────────────────
export default function HermesPage() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(() => nanoid(16));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useUtils();

  const chatMutation = trpc.hermes.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) =>
        prev
          .filter((m) => !m.isLoading)
          .concat({
            id: nanoid(),
            role: "assistant",
            content: data.content,
            timestamp: new Date(),
          })
      );
      setIsThinking(false);
      utils.hermes.getSessions.invalidate();
    },
    onError: (err) => {
      setMessages((prev) =>
        prev
          .filter((m) => !m.isLoading)
          .concat({
            id: nanoid(),
            role: "assistant",
            content: `**SYSTEM ERROR:** ${err.message}`,
            timestamp: new Date(),
          })
      );
      setIsThinking(false);
    },
  });

  const clearMutation = trpc.hermes.clearSession.useMutation({
    onSuccess: () => {
      setMessages([]);
      utils.hermes.getSessions.invalidate();
    },
  });

  // Load history when session changes
  const { data: history } = trpc.hermes.getHistory.useQuery(
    { sessionId, limit: 50 },
    { enabled: !!sessionId }
  );

  useEffect(() => {
    if (history && history.length > 0) {
      setMessages(
        history
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: String(m.id),
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.createdAt),
          }))
      );
    } else if (history && history.length === 0) {
      setMessages([]);
    }
  }, [history]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: nanoid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    const loadingMsg: Message = {
      id: "loading",
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsThinking(true);
    chatMutation.mutate({ message: text, sessionId });
  }, [input, isThinking, sessionId, chatMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    setSessionId(nanoid(16));
    setMessages([]);
  };

  // Welcome message for new sessions
  const showWelcome = messages.length === 0 && !isThinking;

  return (
    <div className="flex flex-col h-full bg-[#000a00] text-[#00ff41]" style={{ fontFamily: "'Share Tech Mono', 'Courier New', monospace" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#00ff41]/30 bg-black/60">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="w-6 h-6 text-[#00ff41]" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#00ff41]">HERMES</h1>
            <p className="text-[9px] text-[#00ff41]/50 tracking-widest">CORE AI AGENT // OMNIMATRIX</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-mono text-[#00ff41]/60 hover:text-[#00ff41] hover:bg-[#00ff41]/10 border border-[#00ff41]/20"
            onClick={() => setShowMemory(!showMemory)}
          >
            <Database className="w-3 h-3 mr-1" />
            MEMORY
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-mono text-red-400/60 hover:text-red-400 hover:bg-red-400/10 border border-red-400/20"
            onClick={() => clearMutation.mutate({ sessionId })}
            disabled={messages.length === 0}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            CLEAR
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <HermesStatusBar sessionId={sessionId} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Session Sidebar */}
        <SessionList
          currentSessionId={sessionId}
          onSelect={(id) => setSessionId(id)}
          onNew={handleNewSession}
        />

        {/* Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef as React.RefObject<HTMLDivElement>}>
            <div className="py-4">
              {showWelcome && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-8">
                  <div className="relative">
                    <Brain className="w-16 h-16 text-[#00ff41]/30" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#00ff41]/20 animate-ping" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-widest text-[#00ff41]/80">HERMES READY</p>
                    <p className="text-xs text-[#00ff41]/40 mt-1 tracking-wider">CORE AI AGENT INITIALIZED</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 max-w-md w-full">
                    {[
                      "Vygeneruj smoke testy pro login flow",
                      "Analyzuj tento Playwright skript",
                      "Navrhni CI/CD pipeline pro QA",
                      "Validuj XML strukturu API response",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-left text-[10px] font-mono text-[#00ff41]/50 hover:text-[#00ff41]/80 border border-[#00ff41]/15 hover:border-[#00ff41]/40 rounded px-2 py-1.5 transition-colors bg-[#001a00]/30 hover:bg-[#001a00]/60"
                      >
                        <ChevronRight className="w-2.5 h-2.5 inline mr-1" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-[#00ff41]/20 bg-black/40 p-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ENTER COMMAND // SHIFT+ENTER FOR NEWLINE"
                  className="min-h-[44px] max-h-32 resize-none bg-[#001a00]/80 border-[#00ff41]/30 text-[#00ff41] placeholder:text-[#00ff41]/25 font-mono text-sm focus:border-[#00ff41]/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isThinking}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="h-11 px-4 bg-[#00ff41]/15 hover:bg-[#00ff41]/25 border border-[#00ff41]/40 text-[#00ff41] font-mono text-xs disabled:opacity-30"
                variant="outline"
              >
                {isThinking ? (
                  <span className="animate-pulse">▋</span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[9px] font-mono text-[#00ff41]/25 mt-1.5 ml-1">
              HERMES v2.0 // OMNIMATRIX QA CORE // ENTER TO SEND
            </p>
          </div>
        </div>

        {/* Memory Panel */}
        {showMemory && <MemoryPanel onClose={() => setShowMemory(false)} />}
      </div>
    </div>
  );
}
