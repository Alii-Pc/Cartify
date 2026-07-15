import Link from "next/link";
import { Instagram, Facebook, Twitter, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-olive-100 bg-olive-950 text-cream-100">
      {/* Trust strip */}
      <div className="border-b border-olive-900/80">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-olive-400" />
            <span className="text-sm text-cream-100/70">Free shipping over $50</span>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-olive-400" />
            <span className="text-sm text-cream-100/70">30-day easy returns</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-olive-400" />
            <span className="text-sm text-cream-100/70">Secure checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-cream-50">
            Cart<span className="text-olive-400">ify</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-cream-100/60">
            Thoughtfully curated products, presented without the noise.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cream-50">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/60">
            <li><Link href="/#categories" className="hover:text-cream-50">Categories</Link></li>
            <li><Link href="/#deals" className="hover:text-cream-50">Deals</Link></li>
            <li><Link href="/cart" className="hover:text-cream-50">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cream-50">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-cream-100/60">
            <li><Link href="/#about" className="hover:text-cream-50">About Cartify</Link></li>
            <li><Link href="#" className="hover:text-cream-50">Shipping &amp; Returns</Link></li>
            <li><Link href="#" className="hover:text-cream-50">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-cream-50">Follow</h4>
          <div className="mt-3 flex gap-4">
            <Link href="#" aria-label="Instagram" className="text-cream-100/60 hover:text-cream-50">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Facebook" className="text-cream-100/60 hover:text-cream-50">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter" className="text-cream-100/60 hover:text-cream-50">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-olive-900/80 px-6 py-6 text-center text-xs text-cream-100/40 lg:px-8">
        © {year} Cartify. All rights reserved.
      </div>
    </footer>
  );
}
