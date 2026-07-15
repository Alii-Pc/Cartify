const CATEGORIES = [
  { name: "Home & Living", emoji: "🪴" },
  { name: "Apparel", emoji: "👕" },
  { name: "Electronics", emoji: "🎧" },
  { name: "Beauty", emoji: "🧴" },
  { name: "Kitchen", emoji: "🍳" },
  { name: "Outdoors", emoji: "🥾" },
];

export function Categories() {
  return (
    <section id="categories" className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-charcoal-900 sm:text-4xl">
            Shop by category
          </h2>
          <p className="mt-4 text-charcoal-700/70">
            Everything organized simply — find what you need in seconds.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <button
              key={category.name}
              className="card-surface flex flex-col items-center gap-3 p-6 transition-transform hover:-translate-y-1 hover:shadow-olive"
            >
              <span className="text-3xl">{category.emoji}</span>
              <span className="text-sm font-medium text-charcoal-800">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
