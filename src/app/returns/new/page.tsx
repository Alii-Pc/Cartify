"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShopLayout } from "@/components/layout/ShopLayout";
import {
  RotateCcw,
  Package,
  CheckCircle2,
  UploadCloud,
  X,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { ReturnReason } from "@/types";

const RETURN_REASONS: Array<{ value: ReturnReason; label: string }> = [
  { value: "defective", label: "Defective or Damaged Product" },
  { value: "wrong_item", label: "Wrong Item Delivered" },
  { value: "not_as_described", label: "Item Does Not Match Description/Photos" },
  { value: "quality_issue", label: "Quality is Poor or Unsatisfactory" },
  { value: "size_fit", label: "Size / Fit Not Suitable" },
  { value: "changed_mind", label: "Changed Mind / No Longer Needed" },
  { value: "other", label: "Other Reason" },
];

interface SelectedReturnItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  maxQuantity: number;
  quantity: number;
  reason: ReturnReason;
  reasonDetails: string;
}

function NewReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const preselectedOrderId = searchParams.get("orderId") || "";

  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Form state
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedReturnItem>>({});
  const [customerNote, setCustomerNote] = useState("");
  const [refundMethod, setRefundMethod] = useState<"original_payment" | "store_credit">("original_payment");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch eligible orders
  useEffect(() => {
    async function fetchEligible() {
      try {
        const res = await fetch("/api/returns/eligible-orders");
        const json = await res.json();
        if (json.success && json.data) {
          const orders = json.data.orders || [];
          setEligibleOrders(orders);

          if (preselectedOrderId) {
            const found = orders.find((o: any) => o._id === preselectedOrderId);
            if (found) {
              setSelectedOrder(found);
              setSelectedOrderId(found._id);
            }
          }
        }
      } catch {
        setError("Failed to fetch eligible orders.");
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchEligible();
  }, [preselectedOrderId]);

  // Handle selecting an order
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = eligibleOrders.find((o) => o._id === orderId);
    setSelectedOrder(order || null);
    setSelectedItems({}); // Reset selected items
  };

  // Toggle item checkbox
  const handleToggleItem = (item: any) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[item.productId]) {
        delete next[item.productId];
      } else {
        next[item.productId] = {
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          maxQuantity: item.quantity,
          quantity: 1,
          reason: "defective",
          reasonDetails: "",
        };
      }
      return next;
    });
  };

  // Update item details
  const handleUpdateItemField = (productId: string, field: keyof SelectedReturnItem, value: any) => {
    setSelectedItems((prev) => {
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: value,
        },
      };
    });
  };

  // Handle photo upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 4) {
      addToast("error", "You can upload a maximum of 4 proof photos.");
      return;
    }

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "cartify/returns");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (res.ok && json.success && json.data?.url) {
          setUploadedImages((prev) => [...prev, json.data.url]);
        } else {
          addToast("error", json.message || `Failed to upload ${file.name}`);
        }
      }
      addToast("success", "Photo(s) uploaded successfully!");
    } catch {
      addToast("error", "Error uploading photos.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Calculate estimated refund
  const estimatedRefund = Object.values(selectedItems).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Submit return request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      addToast("error", "Please select an order to return.");
      return;
    }

    const itemsArray = Object.values(selectedItems);
    if (itemsArray.length === 0) {
      addToast("error", "Please select at least one item to return.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        orderId: selectedOrderId,
        items: itemsArray.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          reason: item.reason,
          reasonDetails: item.reasonDetails || undefined,
        })),
        customerNote: customerNote || undefined,
        refundMethod,
        images: uploadedImages,
      };

      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        addToast("success", "Return request submitted successfully!");
        router.push(`/returns/${json.data.returnNumber}`);
      } else {
        setError(json.message || "Failed to submit return request");
        addToast("error", json.message || "Failed to submit return request");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      addToast("error", "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-50 min-h-[85vh] py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-olive-800 hover:text-olive-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Returns</span>
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-900">
            Request Item Return
          </h1>
          <p className="text-xs text-charcoal-600 mt-1">
            Fill out the form below to request a return or replacement for items received.
          </p>
        </div>

        {loadingOrders ? (
          <div className="card-surface p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-olive-700 border-t-transparent mx-auto mb-3" />
            <p className="text-xs text-charcoal-600 font-medium">Checking eligible delivered orders...</p>
          </div>
        ) : eligibleOrders.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <Package className="h-12 w-12 text-charcoal-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-charcoal-900">No Eligible Orders</h3>
            <p className="text-xs text-charcoal-600 mt-1 max-w-sm mx-auto mb-6">
              Only delivered orders within the 30-day window can be returned.
            </p>
            <a
              href="/orders"
              className="inline-flex items-center gap-1.5 rounded-full bg-olive-800 px-6 py-2.5 text-xs font-bold text-cream-50 hover:bg-olive-900 transition-colors"
            >
              <span>View Order History</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Select Order */}
            <div className="card-surface p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-olive-100/70 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-800 text-cream-50 text-xs font-bold">
                  1
                </span>
                <h2 className="font-display text-base font-bold text-charcoal-900">
                  Select Order
                </h2>
              </div>

              <select
                aria-label="Select an eligible order to return"
                value={selectedOrderId}
                onChange={(e) => handleSelectOrder(e.target.value)}
                className="w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-xs font-semibold text-charcoal-900 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200"
              >
                <option value="">-- Choose an eligible delivered order --</option>
                {eligibleOrders.map((o) => (
                  <option key={o._id} value={o._id}>
                    Order #{o.orderNumber} &bull; Delivered on {new Date(o.createdAt).toLocaleDateString()} ({o.items.length} items &bull; ${o.total.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Items to Return */}
            {selectedOrder && (
              <div className="card-surface p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-olive-100/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-800 text-cream-50 text-xs font-bold">
                      2
                    </span>
                    <h2 className="font-display text-base font-bold text-charcoal-900">
                      Select Items to Return
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-olive-800">
                    {Object.keys(selectedItems).length} item(s) selected
                  </span>
                </div>

                <div className="divide-y divide-olive-100/60">
                  {selectedOrder.items.map((item: any) => {
                    const isSelected = !!selectedItems[item.productId];
                    const currentSelected = selectedItems[item.productId];

                    return (
                      <div key={item.productId} className="py-4 first:pt-0 last:pb-0 space-y-4">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            aria-label={`Select ${item.name} for return`}
                            checked={isSelected}
                            onChange={() => handleToggleItem(item)}
                            className="mt-1 h-5 w-5 rounded border-olive-300 text-olive-700 focus:ring-olive-500 cursor-pointer"
                          />

                          <div className="h-14 w-14 rounded-lg bg-cream-100 border border-olive-100 overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-olive-800">Img</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-charcoal-900">{item.name}</p>
                            <p className="text-[11px] text-charcoal-500 mt-0.5">
                              Ordered: {item.quantity} units &bull; ${item.price.toFixed(2)} each
                            </p>
                          </div>

                          <span className="text-xs font-bold text-charcoal-900">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Return Reason & Quantity if checked */}
                        {isSelected && currentSelected && (
                          <div className="ml-9 p-4 rounded-xl bg-cream-100/70 border border-olive-200/70 space-y-3 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                                  Return Reason *
                                </label>
                                <select
                                  value={currentSelected.reason}
                                  onChange={(e) =>
                                    handleUpdateItemField(
                                      item.productId,
                                      "reason",
                                      e.target.value as ReturnReason
                                    )
                                  }
                                  className="w-full rounded-lg border border-olive-200 bg-white p-2 text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-olive-500"
                                >
                                  {RETURN_REASONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                                  Quantity to Return
                                </label>
                                <select
                                  value={currentSelected.quantity}
                                  onChange={(e) =>
                                    handleUpdateItemField(
                                      item.productId,
                                      "quantity",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full rounded-lg border border-olive-200 bg-white p-2 text-xs font-medium text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-olive-500"
                                >
                                  {Array.from({ length: currentSelected.maxQuantity }, (_, i) => i + 1).map((qty) => (
                                    <option key={qty} value={qty}>
                                      {qty} {qty === 1 ? "unit" : "units"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                                Reason Details / Issue Description (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Broken zipper on right pocket or wrong color sent"
                                value={currentSelected.reasonDetails}
                                onChange={(e) =>
                                  handleUpdateItemField(item.productId, "reasonDetails", e.target.value)
                                }
                                className="w-full rounded-lg border border-olive-200 bg-white px-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 focus:ring-olive-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Photo Evidence & Additional Notes */}
            {selectedOrder && Object.keys(selectedItems).length > 0 && (
              <div className="card-surface p-6 space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 border-b border-olive-100/70 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive-800 text-cream-50 text-xs font-bold">
                    3
                  </span>
                  <h2 className="font-display text-base font-bold text-charcoal-900">
                    Proof Photos &amp; Customer Note
                  </h2>
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-charcoal-800">
                    Upload Photos of Item / Damage (Recommended, up to 4 images)
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-olive-200 bg-white group"
                      >
                        <img src={imgUrl} alt="Return proof" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs hover:bg-red-700 transition-colors"
                          title="Remove photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {uploadedImages.length < 4 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-olive-200 bg-white hover:bg-cream-100/60 transition-colors flex flex-col items-center justify-center cursor-pointer p-3 text-center">
                        <UploadCloud className="h-6 w-6 text-olive-700 mb-1" />
                        <span className="text-[11px] font-bold text-charcoal-800">
                          {uploadingImage ? "Uploading..." : "Add Photo"}
                        </span>
                        <span className="text-[9px] text-charcoal-400">JPG, PNG, WEBP</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Note */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-charcoal-800">
                    Additional Comments for our Returns Inspector (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any additional comments, pickup instructions, or details..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full rounded-xl border border-olive-200 bg-white p-3 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-olive-600 focus:outline-none focus:ring-2 focus:ring-olive-200"
                  />
                </div>

                {/* Preferred Refund Method */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-charcoal-800">
                    Preferred Refund Resolution
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        refundMethod === "original_payment"
                          ? "bg-olive-50 border-olive-600 ring-2 ring-olive-200"
                          : "bg-white border-olive-200 hover:bg-cream-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="refundMethod"
                        value="original_payment"
                        checked={refundMethod === "original_payment"}
                        onChange={() => setRefundMethod("original_payment")}
                        className="text-olive-700 focus:ring-olive-500"
                      />
                      <div>
                        <p className="font-bold text-charcoal-900">Original Payment Method</p>
                        <p className="text-[10px] text-charcoal-500">Refunded to original card / Stripe account</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        refundMethod === "store_credit"
                          ? "bg-olive-50 border-olive-600 ring-2 ring-olive-200"
                          : "bg-white border-olive-200 hover:bg-cream-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="refundMethod"
                        value="store_credit"
                        checked={refundMethod === "store_credit"}
                        onChange={() => setRefundMethod("store_credit")}
                        className="text-olive-700 focus:ring-olive-500"
                      />
                      <div>
                        <p className="font-bold text-charcoal-900">Store Credit / Coupon</p>
                        <p className="text-[10px] text-charcoal-500">Instant credit issued upon inspection</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary & Submit */}
            {selectedOrder && Object.keys(selectedItems).length > 0 && (
              <div className="card-surface p-6 space-y-4 bg-olive-50/50 border border-olive-200 animate-fadeIn">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-charcoal-700">Estimated Refund Total:</span>
                  <span className="font-display font-extrabold text-xl text-olive-900">
                    ${estimatedRefund.toFixed(2)}
                  </span>
                </div>

                <p className="text-[11px] text-charcoal-500 leading-relaxed">
                  By submitting this request, you agree that items will be returned in their original packaging with all tags attached. Our team will review the request within 24-48 business hours.
                </p>

                {error && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-olive-800 py-3.5 text-center font-display text-sm font-bold text-cream-50 hover:bg-olive-900 transition-all shadow-md hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                >
                  {submitting ? "Submitting Return Request..." : "Submit Return Request"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default function NewReturnPage() {
  return (
    <ShopLayout>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-olive-700 border-t-transparent" />
          </div>
        }
      >
        <NewReturnContent />
      </Suspense>
    </ShopLayout>
  );
}
