import clsx from "clsx";

export type BadgeTone = "olive" | "cream" | "amber" | "charcoal" | "red" | "sky" | "emerald";

export function Badge({
  children,
  tone = "olive",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        tone === "olive" && "bg-olive-100 text-olive-800",
        tone === "cream" && "bg-cream-100 text-charcoal-700",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "charcoal" && "bg-charcoal-800 text-cream-50",
        tone === "red" && "bg-red-100 text-red-800",
        tone === "sky" && "bg-sky-100 text-sky-800",
        tone === "emerald" && "bg-emerald-100 text-emerald-800"
      )}
    >
      {children}
    </span>
  );
}
