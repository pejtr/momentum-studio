import { Coins, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export function AICreditStatus({ className }: { className?: string }) {
  const { data, isLoading } = trpc.ai.credits.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)} aria-label="Načítání AI kreditů">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>AI kredity</span>
      </div>
    );
  }

  if (!data) return null;

  const resetDate = new Intl.DateTimeFormat("cs-CZ", { day: "2-digit", month: "2-digit" }).format(
    new Date(data.nextResetAt)
  );
  const isExhausted = data.remaining === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[11px] tracking-wide",
        isExhausted
          ? "border-red-400/40 bg-red-400/10 text-red-300"
          : "border-primary/35 bg-primary/10 text-primary",
        className
      )}
      role="status"
      title={`Sdílené AI kredity pro HERMES, PDF sumarizátor, generátor testů a XML validátor. Obnova ${resetDate}.`}
    >
      <Coins className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">AI kredity</span>
      <strong>{data.remaining}/{data.allowance}</strong>
      <span className="hidden lg:inline opacity-70">· obnova {resetDate}</span>
    </div>
  );
}
