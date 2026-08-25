"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import {
  MapPin,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Tag,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { calculateOrderTotals, CouponDetail } from "@/lib/checkout-utils";

function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, subtotal, itemCount, isLoading: isCartLoading } = useCart();
  const { addToast } = useToast();

  // Direct Address Form state
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const addressSectionRef = useRef<HTMLDivElement>(null);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Promo Code States
  const searchParams = useSearchParams();
  const initialPromo = searchParams.get("promo");
  const [promoCode, setPromoCode] = useState(initialPromo || "");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(initialPromo || null);
  const [appliedCouponData, setAppliedCouponData] = useState<CouponDetail | null>(null);
  const [promoError, setPromoError] = useState("");

  // Validate initial promo if exists
  useEffect(() => {
    if (initialPromo && subtotal > 0 && !appliedCouponData) {
      validatePromo(initialPromo, subtotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPromo, subtotal]);

  const validatePromo = async (code: string, currentSubtotal: number) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: code, subtotal: currentSubtotal }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAppliedPromo(code);
        setAppliedCouponData(json.data.coupon);
      } else {
        setAppliedPromo(null);
        setAppliedCouponData(null);
        setPromoError(json.message || "Invalid promo code");
      }
    } catch {
      setPromoError("Error validating promo code");
    }
  };

  // Place Order States
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");

  // Redirect if cart is empty after loading
  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0) {
      addToast("info", "Your cart is empty. Please add items before checking out.");
      router.push("/products");
    }
  }, [cartItems, isCartLoading, router, addToast]);

  // ── Address Form Validation ──
  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!addressForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!addressForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!addressForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (addressForm.phone.replace(/\D/g, "").length < 7) {
      errors.phone = "Enter a valid phone number (at least 7 digits)";
    }
    if (!addressForm.addressLine1.trim()) {
      errors.addressLine1 = "Street address is required";
    }
    if (!addressForm.city.trim()) {
      errors.city = "City is required";
    }
    if (!addressForm.state.trim()) {
      errors.state = "State or Province is required";
    }
    if (!addressForm.zipCode.trim()) {
      errors.zipCode = "ZIP or Postal code is required";
    }
    if (!addressForm.country.trim()) {
      errors.country = "Country is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle Apply Coupon Code ──
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError("Please enter a promo code");
      return;
    }

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: code, subtotal }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setAppliedPromo(code);
        setAppliedCouponData(json.data.coupon);
        addToast("success", json.message || `Coupon '${code}' applied!`);
      } else {
        setAppliedPromo(null);
        setAppliedCouponData(null);
        setPromoError(json.message || "Invalid or expired promo code.");
        addToast("error", json.message || "Invalid promo code");
      }
    } catch {
      setPromoError("Error validating promo code.");
    }
  };

  // ── Calculate Cost Breakdown ──
  const totals = calculateOrderTotals(subtotal, appliedPromo, appliedCouponData);
  const { discount, shipping, tax, total: grandTotal } = totals;

  // ── Place Order Action ──
  const handlePlaceOrder = async () => {
    // Validate required address fields
    if (!validateAddressForm()) {
      setCheckoutError("Please fill in all required shipping address details.");
      addressSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      addToast("error", "Please fill in all required address fields");
      return;
    }

    const finalAddress = {
      fullName: addressForm.fullName.trim(),
      email: addressForm.email.trim(),
      addressLine1: addressForm.addressLine1.trim(),
      addressLine2: addressForm.addressLine2.trim() || undefined,
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      zipCode: addressForm.zipCode.trim(),
      country: addressForm.country.trim(),
      phone: addressForm.phone.trim(),
    };

    setIsPlacingOrder(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: finalAddress,
          promoCode: appliedPromo || undefined,
          items: cartItems.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          paymentMethod,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setCheckoutError(json.message || "Failed to initialize checkout. Please try again.");
        addToast("error", json.message || "Checkout failed");
        return;
      }

      // If COD or direct payment success
      if (json.data && json.data.sessionUrl) {
        window.location.href = json.data.sessionUrl;
      } else if (json.data && json.data.order) {
        router.push(`/orders/${json.data.order._id}?success=true`);
      } else {
        setCheckoutError("Invalid response from checkout service.");
        addToast("error", "Invalid response from checkout service");
      }
    } catch {
      setCheckoutError("Network error. Please check your connection and try again.");
      addToast("error", "Failed to connect to checkout service");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-700 border-t-transparent" />
          <p className="text-sm font-medium text-charcoal-700/80">Loading your secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12 pb-24 lg:pb-0">
      <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700/60 uppercase tracking-widest mb-4">
        <Link href="/cart" className="hover:text-charcoal-900">
          Cart
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-olive-800">Checkout</span>
      </div>

      <div className="mb-8">
        <CheckoutSteps currentStep={2} />
      </div>

      <h1 className="font-display text-2xl font-bold text-charcoal-900 sm:text-3xl lg:text-4xl mb-8">
        Secure Checkout
      </h1>

      {checkoutError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{checkoutError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Direct Address Details + Payment Options (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Direct Shipping Address Section */}
          <div ref={addressSectionRef} className="card-surface p-6 sm:p-8">
            <div className="border-b border-olive-100 pb-4 mb-6">
              <h2 className="font-display text-lg font-bold text-charcoal-900 sm:text-xl flex items-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-700 text-cream-50 text-xs font-bold mr-2">
                  1
                </span>
                <MapPin className="h-5 w-5 text-olive-750 mr-2" />
                <span>Shipping Address</span>
              </h2>
              <p className="text-xs text-charcoal-700/70 mt-1">
                Enter your delivery address below. All fields marked with * are required.
              </p>
            </div>

            {/* Direct Address Input Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={addressForm.fullName}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.fullName
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jane@example.com"
                    value={addressForm.email}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.email
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-019-2834"
                    value={addressForm.phone}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, phone: e.target.value });
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.phone
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, country: e.target.value });
                      if (formErrors.country) setFormErrors({ ...formErrors, country: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.country
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.country && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.country}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                  Street Address (Line 1) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street address, P.O. box, company name"
                  value={addressForm.addressLine1}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, addressLine1: e.target.value });
                    if (formErrors.addressLine1) setFormErrors({ ...formErrors, addressLine1: "" });
                  }}
                  className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                    formErrors.addressLine1
                      ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                      : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                  }`}
                />
                {formErrors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.addressLine1}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York"
                    value={addressForm.city}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, city: e.target.value });
                      if (formErrors.city) setFormErrors({ ...formErrors, city: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.city
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NY"
                    value={addressForm.state}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, state: e.target.value });
                      if (formErrors.state) setFormErrors({ ...formErrors, state: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.state
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    ZIP / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10001"
                    value={addressForm.zipCode}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, zipCode: e.target.value });
                      if (formErrors.zipCode) setFormErrors({ ...formErrors, zipCode: "" });
                    }}
                    className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:outline-none focus:ring-2 transition-colors ${
                      formErrors.zipCode
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                        : "border-olive-200 bg-white focus:border-olive-500 focus:ring-olive-200"
                    }`}
                  />
                  {formErrors.zipCode && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="card-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-charcoal-900 sm:text-xl border-b border-olive-100 pb-4 mb-5 flex items-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-700 text-cream-50 text-xs font-bold mr-2">
                2
              </span>
              <CreditCard className="h-5 w-5 text-olive-750 mr-2" />
              <span>Payment Method</span>
            </h2>

            <div className="space-y-4">
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === "stripe"
                    ? "border-olive-500 bg-olive-50/30 ring-1 ring-olive-500"
                    : "border-olive-200 hover:bg-cream-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                  className="mt-1 h-4 w-4 text-olive-700 border-olive-300 focus:ring-olive-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-charcoal-900">Credit / Debit Card</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                      Secure via Stripe
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600">
                    Pay safely using your Visa, Mastercard, AMEX, or Discover.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === "cod"
                    ? "border-olive-500 bg-olive-50/30 ring-1 ring-olive-500"
                    : "border-olive-200 hover:bg-cream-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 h-4 w-4 text-olive-700 border-olive-300 focus:ring-olive-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-charcoal-900">Cash on Delivery</span>
                    <span className="text-[10px] font-semibold bg-olive-100 text-olive-800 px-1.5 py-0.5 rounded-sm">
                      Pay at Doorstep
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600">
                    Pay in cash when your parcel is delivered to your address.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-surface p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-lg font-bold text-charcoal-900 border-b border-olive-100 pb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 text-olive-750 mr-2" />
              <span>Order Summary</span>
            </h2>

            {/* Mini Items List */}
            <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
              {cartItems.map((item) => {
                const product = item.product;
                const image = product.images?.[0] || "";
                return (
                  <div key={product._id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-cream-200/50 border border-olive-100 overflow-hidden flex-shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-olive-100 text-[10px] text-olive-800">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-charcoal-900 truncate">{product.name}</p>
                      <p className="text-[11px] text-charcoal-700/60 mt-0.5">
                        Qty: {item.quantity} &bull; ${product.price.toFixed(2)} each
                      </p>
                    </div>
                    <p className="text-xs font-bold text-charcoal-905 flex-shrink-0">
                      ${(product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2 border-t border-olive-100 pt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-850">
                Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal-700/40" />
                  <input
                    type="text"
                    placeholder="WELCOME10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full rounded-full border border-olive-200 bg-white py-1.5 pl-9 pr-3 text-xs uppercase tracking-wider text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-charcoal-800 px-4 py-1.5 text-xs font-semibold text-cream-50 transition-colors hover:bg-charcoal-900"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && (
                <p className="text-[11px] font-bold text-emerald-600">
                  ✓ {appliedPromo} applied successfully!
                </p>
              )}
              {promoError && (
                <p className="text-[11px] font-semibold text-red-650">{promoError}</p>
              )}
            </form>

            {/* Price breakdown */}
            <dl className="space-y-3 text-xs font-medium text-charcoal-800 border-t border-olive-100 pt-4">
              <div className="flex justify-between">
                <dt className="text-charcoal-700/80">Subtotal ({itemCount} items)</dt>
                <dd className="font-semibold text-charcoal-900">${subtotal.toFixed(2)}</dd>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <dt>Promo Discount</dt>
                  <dd>-${discount.toFixed(2)}</dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-charcoal-700/80">Shipping</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-emerald-650 uppercase font-bold text-[10px]">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-charcoal-700/80">Estimated Tax (8%)</dt>
                <dd className="font-semibold">${tax.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between border-t border-olive-200 pt-4 text-sm font-extrabold text-charcoal-900">
                <dt>Total Payment</dt>
                <dd className="font-display text-xl text-olive-900">
                  ${grandTotal.toFixed(2)}
                </dd>
              </div>
            </dl>

            {/* Main Submit Action */}
            <button
              type="button"
              disabled={isPlacingOrder || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className="w-full rounded-full bg-olive-800 py-3.5 text-center font-display text-sm font-bold text-cream-50 shadow-md transition-all hover:bg-olive-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:py-4 sm:text-base"
            >
              {isPlacingOrder ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50 border-t-transparent" />
                  <span>
                    {paymentMethod === "cod" ? "Confirming Order..." : "Creating secure session..."}
                  </span>
                </span>
              ) : (
                <span>
                  {paymentMethod === "cod"
                    ? "Confirm Order (Cash on Delivery)"
                    : "Pay with Stripe"}
                </span>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-charcoal-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-olive-700" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-olive-700" />
                <span>Tracked Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-olive-200 p-4 shadow-lg z-40 lg:hidden">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-xs text-charcoal-600">Total</p>
            <p className="font-display text-lg font-bold text-charcoal-900">
              ${grandTotal.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            disabled={isPlacingOrder || cartItems.length === 0}
            onClick={handlePlaceOrder}
            className="rounded-full bg-olive-800 px-6 py-2.5 text-sm font-bold text-cream-50 shadow-md hover:bg-olive-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacingOrder
              ? "Processing..."
              : paymentMethod === "cod"
              ? "Place Order"
              : "Pay with Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loader label="Loading checkout..." />}>
      <CheckoutForm />
    </Suspense>
  );
}
