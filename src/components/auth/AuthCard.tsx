import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-olive-grain px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center font-display text-2xl font-semibold text-olive-800"
        >
          Cart<span className="text-olive-500">ify</span>
        </Link>
        <div className="card-surface p-8 shadow-olive">
          <h1 className="font-display text-2xl font-semibold text-charcoal-900">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-charcoal-700/70">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
