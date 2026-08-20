"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "@/components/ui/Loader";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Tag,
} from "lucide-react";
import { calculateOrderTotals, CouponDetail } from "@/lib/checkout-utils";
import type { UserAddress } from "@/types";

function CheckoutForm() {
  const router = useRouter();
  const { cartItems, subtotal, itemCount, clearCart, isLoading: isCartLoading } = useCart();
  const { addToast } = useToast();

  // Address states
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  // Address Form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
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
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

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

  // ── Fetch user's saved addresses ──
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/addresses");
        const json = await res.json();
        if (json.success && json.data?.addresses) {
          const list = json.data.addresses;
          setAddresses(list);
          // Auto-select default address
          const defaultAddr = list.find((addr: UserAddress) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else if (list.length > 0) {
            setSelectedAddressId(list[0]._id);
          } else {
            setShowAddressForm(true);
          }
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        setIsAddressLoading(false);
      }
    }
    fetchAddresses();
  }, []);

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
    if (!addressForm.fullName.trim()) errors.fullName = "Full name is required";
    if (!addressForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!addressForm.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!addressForm.city.trim()) errors.city = "City is required";
    if (!addressForm.state.trim()) errors.state = "State or Province is required";
    if (!addressForm.zipCode.trim()) errors.zipCode = "ZIP or Postal code is required";
    if (!addressForm.country.trim()) errors.country = "Country is required";
    if (!addressForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (addressForm.phone.replace(/\D/g, "").length < 7) {
      errors.phone = "Enter a valid phone number (at least 7 digits)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle Add/Edit Address Form Submission ──
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    setIsFormSubmitting(true);
    const endpoint = editingAddress ? `/api/addresses/${editingAddress._id}` : "/api/addresses";
    const method = editingAddress ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addressForm,
          addressLine2: addressForm.addressLine2 || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        addToast("error", json.message || "Failed to save address");
        return;
      }

      const savedAddress = json.data;
      if (editingAddress) {
        setAddresses((prev) =>
          prev.map((addr) => (addr._id === savedAddress._id ? savedAddress : addr))
        );
        addToast("success", "Address updated successfully");
      } else {
        setAddresses((prev) => [savedAddress, ...prev]);
        setSelectedAddressId(savedAddress._id);
        addToast("success", "Address created successfully");
      }

      // If set as default, adjust others locally
      if (savedAddress.isDefault) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === savedAddress._id ? addr : { ...addr, isDefault: false }
          )
        );
      }

      // Reset form
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        fullName: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        phone: "",
        isDefault: false,
      });
      setFormErrors({});
    } catch {
      addToast("error", "An error occurred while saving address");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // ── Handle Edit Button Click ──
  const handleEditClick = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      email: address.email || "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setFormErrors({});
    setShowAddressForm(true);
  };

  // ── Handle Delete Address ──
  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        setAddresses((prev) => prev.filter((addr) => addr._id !== id));
        addToast("success", "Address deleted successfully");
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
        }
      } else {
        addToast("error", json.message || "Failed to delete address");
      }
    } catch {
      addToast("error", "Error deleting address");
    }
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
    let finalAddress;

    if (showAddressForm) {
      if (!validateAddressForm()) {
        setCheckoutError("Please complete your shipping address details.");
        return;
      }
      finalAddress = {
        fullName: addressForm.fullName,
        email: addressForm.email,
        addressLine1: addressForm.addressLine1,
        addressLine2: addressForm.addressLine2 || undefined,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.zipCode,
        country: addressForm.country,
        phone: addressForm.phone,
      };
      
      // Auto-save the address in background
      fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addressForm, addressLine2: addressForm.addressLine2 || undefined }),
      }).catch(console.error);
    } else {
      if (!selectedAddressId) {
        setCheckoutError("Please select or add a shipping address");
        return;
      }

      const selectedAddrObj = addresses.find((a) => a._id === selectedAddressId);
      if (!selectedAddrObj) {
        setCheckoutError("Invalid shipping address selected");
        return;
      }
      finalAddress = {
        fullName: selectedAddrObj.fullName,
        email: selectedAddrObj.email,
        addressLine1: selectedAddrObj.addressLine1,
        addressLine2: selectedAddrObj.addressLine2 || undefined,
        city: selectedAddrObj.city,
        state: selectedAddrObj.state,
        zipCode: selectedAddrObj.zipCode,
        country: selectedAddrObj.country,
        phone: selectedAddrObj.phone,
      };
    }

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

      // Redirect to Stripe Checkout
      if (json.data && json.data.sessionUrl) {
        window.location.href = json.data.sessionUrl;
      } else {
        setCheckoutError("Invalid response from checkout service.");
        addToast("error", "Invalid response from checkout service");
      }
    } catch {
      setCheckoutError("Network error. Please try again.");
      addToast("error", "Failed to connect to checkout service");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading || isAddressLoading) {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700/60 uppercase tracking-widest mb-4">
        <Link href="/cart" className="hover:text-charcoal-900">Cart</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-olive-800">Checkout</span>
      </div>

      <h1 className="font-display text-2xl font-bold text-charcoal-900 sm:text-3xl lg:text-4xl mb-8">
        Secure Checkout
      </h1>

      {checkoutError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{checkoutError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Addresses + Billing Options (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Address Management Section */}
          <div className="card-surface p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-olive-100 pb-4 mb-6">
              <div>
                <h2 className="font-display text-lg font-bold text-charcoal-900 sm:text-xl">
                  Shipping Address
                </h2>
                <p className="text-xs text-charcoal-700/70">
                  Select a saved shipping location or add a new one.
                </p>
              </div>
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressForm({
                      fullName: "",
                      email: "",
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "United States",
                      phone: "",
                      isDefault: false,
                    });
                    setFormErrors({});
                    setShowAddressForm(true);
                  }}
                  className="rounded-full border border-olive-200 bg-white px-4 py-2 text-xs font-semibold text-olive-800 hover:bg-cream-100 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Address Form (Add / Edit) */}
            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 bg-cream-50/50 p-4 sm:p-6 rounded-2xl border border-olive-100 mb-6">
                <h3 className="font-display text-sm font-bold text-charcoal-900 uppercase tracking-wide">
                  {editingAddress ? "Edit Shipping Address" : "New Shipping Address"}
                </h3>

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
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                    {formErrors.fullName && <p className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>}
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
                      onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                    {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
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
                      placeholder="e.g. 555-019-2834"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                    {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street address, P.O. box, company name"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                  />
                  {formErrors.addressLine1 && <p className="mt-1 text-xs text-red-600">{formErrors.addressLine1}</p>}
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
                      placeholder="e.g. Portland"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                    {formErrors.city && <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OR"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                    {formErrors.state && <p className="mt-1 text-xs text-red-600">{formErrors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 97201"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-700/40 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                    {formErrors.zipCode && <p className="mt-1 text-xs text-red-600">{formErrors.zipCode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-olive-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-colors"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-charcoal-800 select-none">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="h-4 w-4 rounded-md border-olive-300 text-olive-700 focus:ring-olive-200 cursor-pointer"
                      />
                      <span>Set as default shipping address</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-olive-100">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className="rounded-full border border-olive-200 bg-white px-5 py-2 text-xs font-semibold text-charcoal-800 hover:bg-cream-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isFormSubmitting}
                    className="rounded-full bg-olive-800 px-6 py-2 text-xs font-semibold text-cream-50 hover:bg-olive-900 transition-colors flex items-center gap-1"
                  >
                    {isFormSubmitting && <div className="h-3 w-3 animate-spin rounded-full border border-cream-50 border-t-transparent" />}
                    <span>Save Address</span>
                  </button>
                </div>
              </form>
            ) : null}

            {/* Address Cards Grid */}
            {!showAddressForm && addresses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-olive-200/80 rounded-2xl bg-cream-50/20">
                <MapPin className="h-8 w-8 text-olive-800/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-charcoal-800">No saved addresses</p>
                <p className="text-xs text-charcoal-700/60 mt-1">Please add a shipping address to complete checkout.</p>
              </div>
            ) : !showAddressForm ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address._id;
                  return (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer select-none hover:shadow-sm ${
                        isSelected
                          ? "border-olive-800 bg-olive-50/40 ring-1 ring-olive-800"
                          : "border-olive-100 bg-white hover:border-olive-350"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-display text-sm font-bold text-charcoal-900">
                            {address.fullName}
                          </span>
                          {address.isDefault && (
                            <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-olive-850">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-xs leading-relaxed text-charcoal-700/85">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-xs leading-relaxed text-charcoal-700/85">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-xs leading-relaxed text-charcoal-700/85">
                          {address.country}
                        </p>
                        <p className="text-xs text-charcoal-700/60 mt-2">
                          ✉️ {address.email} &bull; 📞 {address.phone}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-olive-100/60 mt-4 pt-3">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-olive-800">
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-olive-800 font-bold">
                              <Check className="h-3.5 w-3.5" /> Selected
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(address);
                            }}
                            className="text-charcoal-700/60 hover:text-olive-800 transition-colors p-1"
                            title="Edit Address"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(address._id, e)}
                            className="text-charcoal-700/60 hover:text-red-600 transition-colors p-1"
                            title="Delete Address"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Payment Method Details */}
          <div className="card-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-charcoal-900 sm:text-xl border-b border-olive-100 pb-4 mb-5 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-olive-750" />
              <span>Payment Method</span>
            </h2>
            
            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                paymentMethod === "stripe" ? "border-olive-500 bg-olive-50/30" : "border-olive-200 hover:bg-cream-50"
              }`}>
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
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">Secure via Stripe</span>
                  </div>
                  <p className="text-xs text-charcoal-600">Pay safely using your preferred credit or debit card.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                paymentMethod === "cod" ? "border-olive-500 bg-olive-50/30" : "border-olive-200 hover:bg-cream-50"
              }`}>
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
                  </div>
                  <p className="text-xs text-charcoal-600">Pay in cash when your order is delivered to your doorstep.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-surface p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-lg font-bold text-charcoal-900 border-b border-olive-100 pb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-olive-750" />
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
                        <img src={image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-olive-100 text-[10px] text-olive-800">No Img</div>
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
              disabled={isPlacingOrder || !selectedAddressId || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className="w-full rounded-full bg-olive-800 py-3.5 text-center font-display text-sm font-bold text-cream-50 shadow-md transition-all hover:bg-olive-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:py-4 sm:text-base"
            >
              {isPlacingOrder ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-50 border-t-transparent" />
                  <span>{paymentMethod === "cod" ? "Confirming Order..." : "Creating secure session..."}</span>
                </span>
              ) : (
                <span>{paymentMethod === "cod" ? "Confirm Order (Cash on Delivery)" : "Pay with Stripe"}</span>
              )}
            </button>
          </div>
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
