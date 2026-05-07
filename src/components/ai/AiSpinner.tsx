import { Sparkles } from "lucide-react";

export function AiSpinner({ label = "Để mình xem qua nhé..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" />
        <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
      </span>
      <span>{label}</span>
    </div>
  );
}
