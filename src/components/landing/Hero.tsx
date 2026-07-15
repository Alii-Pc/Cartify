import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-olive-grain px-6 pb-24 pt-20 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-olive-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-olive-700 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          New season, curated drops
        </div>

        <h1 className="font-display text-4xl font-semibold leading-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
          Shopping that feels{" "}
          <span className="text-olive-600">unhurried</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-charcoal-700/70 sm:text-lg">
          Cartify brings together quality goods and a calm, matte-olive
          shopping experience — no clutter, no pressure, just what you came for.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/#categories" className="btn-primary group">
            Start shopping
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/#deals" className="btn-secondary">
            View today&apos;s deals
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-5xl">
        <div className="card-surface aspect-[16/8] w-full overflow-hidden p-2 shadow-olive">
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-olive-100 via-olive-200 to-olive-300">
            <p className="font-display text-lg text-olive-800/60">
              Featured collection preview
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
