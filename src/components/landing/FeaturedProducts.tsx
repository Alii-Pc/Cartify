import { Badge } from "@/components/ui/Badge";
import { ShoppingCart } from "lucide-react";

const PRODUCTS = [
  { name: "Ceramic Pour-Over Set", price: "$38.00", tag: "New" },
  { name: "Linen Weekend Bag", price: "$74.00", tag: "Sale" },
  { name: "Matte Steel Water Bottle", price: "$22.00", tag: "Bestseller" },
  { name: "Woven Desk Organizer", price: "$29.00", tag: "New" },
];

export function FeaturedProducts() {
  return (
    <section id="deals" className="bg-cream-100/60 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-charcoal-900 sm:text-4xl">
            Today&apos;s deals
          </h2>
          <p className="mt-4 text-charcoal-700/70">
            A short list of things worth adding to your cart right now.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <div key={product.name} className="card-surface overflow-hidden">
              <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-olive-100 to-olive-200">
                <span className="font-display text-sm text-olive-700/50">
                  Product image
                </span>
              </div>
              <div className="p-5">
                <Badge tone="olive">{product.tag}</Badge>
                <h3 className="mt-3 font-medium text-charcoal-900">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-charcoal-900">
                    {product.price}
                  </span>
                  <button
                    aria-label={`Add ${product.name} to cart`}
                    className="rounded-full bg-olive-700 p-2 text-cream-50 transition-colors hover:bg-olive-800"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
