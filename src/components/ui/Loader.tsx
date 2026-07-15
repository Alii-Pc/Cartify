import { Loader2 } from "lucide-react";

export function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-olive-600" />
      <p className="text-sm text-charcoal-700/70">{label}</p>
    </div>
  );
}

export function InlineSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
