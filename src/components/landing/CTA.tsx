import Link from "next/link";

export function CTA() {
  return (
    <section id="about" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-olive-800 px-8 py-16 text-center text-cream-50 shadow-olive">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Your cart is waiting
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream-100/70">
          Free shipping over $50, easy returns, and a checkout that takes less
          than a minute.
        </p>
        <div className="mt-8">
          <Link
            href="/#categories"
            className="inline-flex items-center justify-center rounded-full bg-cream-50 px-7 py-3 text-sm font-semibold text-olive-800 transition-transform hover:scale-[1.02]"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}
