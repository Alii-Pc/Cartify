import clsx from "clsx";

export function Badge({
  children,
  tone = "olive",
}: {
  children: React.ReactNode;
  tone?: "olive" | "cream";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "olive"
          ? "bg-olive-100 text-olive-800"
          : "bg-cream-100 text-charcoal-700"
      )}
    >
      {children}
    </span>
  );
}
