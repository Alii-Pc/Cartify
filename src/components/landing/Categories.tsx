import Link from "next/link";
import { ChevronRight } from "lucide-react";

const CATEGORIES = [
  { name: "Home & Living", slug: "home-living", emoji: "🪴" },
  { name: "Apparel", slug: "apparel", emoji: "👕" },
  { name: "Electronics", slug: "electronics", emoji: "🎧" },
  { name: "Beauty", slug: "beauty", emoji: "🧴" },
  { name: "Kitchen", slug: "kitchen", emoji: "🍳" },
  { name: "Outdoors", slug: "outdoors", emoji: "🥾" },
];

export function Categories() {
  return (
    <section id="categories" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-3xl font-semibold text-charcoal-900 sm:text-4xl">
              Shop by category
            </h2>
            <p className="mt-2 text-charcoal-700/70">
              Everything organized simply — find what you need in seconds.
            </p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 rounded-full border border-olive-200 bg-white px-5 py-2.5 text-xs font-semibold text-charcoal-800 transition-colors hover:bg-cream-100"
          >
            <span>View All Categories</span>
            <ChevronRight className="h-4 w-4 text-olive-700" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group card-surface flex flex-col items-center gap-3 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-olive"
            >
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {category.emoji}
              </span>
              <span className="text-sm font-medium text-charcoal-800 group-hover:text-olive-800 transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
