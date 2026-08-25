"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  Link as LinkIcon,
  Edit2,
  Check,
  Star,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { SafeProduct, SafeCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createProductSchema, updateProductSchema } from "@/lib/validations/product";

interface ProductFormProps {
  initialData?: SafeProduct;
  onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [categories, setCategories] = useState<SafeCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Image URL input states
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    compareAtPrice: initialData?.compareAtPrice?.toString() || "",
    category: initialData?.category || "",
    images: initialData?.images || [],
    stock: initialData?.stock?.toString() || "25",
    featured: initialData?.featured || false,
    tag: initialData?.tag || "None",
    specifications: initialData?.specifications || {},
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (err) {
        addToast("error", "Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, [addToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !initialData
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          }
        : {}),
    }));
  };

  // ── Handle File Upload ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    setIsUploading(true);
    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const json = await res.json();

        if (json.success && json.data?.url) {
          setFormData((prev) => ({ ...prev, images: [...prev.images, json.data.url] }));
        } else {
          addToast("error", json.message || `Failed to upload ${file.name}`);
        }
      }
      addToast("success", "Images uploaded successfully");
    } catch (err) {
      addToast("error", "An error occurred during upload");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // ── Handle Add Image by URL ──
  const handleAddImageUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = imageUrlInput.trim();
    if (!raw) return;

    // Support single or multiple URLs (comma or newline separated)
    const urls = raw
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const validUrls = urls.filter((u) => /^https?:\/\//i.test(u) || u.startsWith("/"));

    if (validUrls.length === 0) {
      addToast("error", "Please enter a valid image URL starting with http:// or https://");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validUrls],
    }));

    setImageUrlInput("");
    addToast("success", `Added ${validUrls.length} image URL${validUrls.length > 1 ? "s" : ""}`);
  };

  // ── Handle Update / Edit Existing Image URL ──
  const handleSaveEditedImageUrl = (index: number) => {
    const trimmed = editingImageUrl.trim();
    if (!trimmed) return;

    setFormData((prev) => {
      const updated = [...prev.images];
      updated[index] = trimmed;
      return { ...prev, images: updated };
    });

    setEditingImageIndex(null);
    setEditingImageUrl("");
    addToast("success", "Image URL updated");
  };

  // ── Move Image Order ──
  const moveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= formData.images.length) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const item = updated.splice(fromIdx, 1)[0];
      if (item) {
        updated.splice(toIdx, 0, item);
      }
      return { ...prev, images: updated };
    });
  };

  // ── Set as Primary Hero Image ──
  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
    addToast("info", "Set as primary product thumbnail");
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSpecChange = (oldKey: string, newKey: string, newValue: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      if (oldKey !== newKey) {
        delete newSpecs[oldKey];
      }
      newSpecs[newKey] = newValue;
      return { ...prev, specifications: newSpecs };
    });
  };

  const removeSpec = (keyToRemove: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[keyToRemove];
      return { ...prev, specifications: newSpecs };
    });
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, "": "" },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      category: formData.category,
      images: formData.images,
      stock: parseInt(formData.stock, 10) || 0,
      featured: formData.featured,
      tag: formData.tag === "None" ? null : formData.tag,
      specifications: formData.specifications,
    };

    const schema = initialData ? updateProductSchema : createProductSchema;
    const validation = schema.safeParse(payload);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(formattedErrors);
      addToast("error", "Please fix the validation errors");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = initialData ? `/api/products/${initialData.slug}` : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const json = await res.json();

      if (json.success) {
        addToast(
          "success",
          initialData ? "Product updated successfully" : "Product created successfully"
        );
        if (onSuccess) onSuccess();
        else router.push("/admin/products");
      } else {
        addToast("error", json.message || "Failed to save product");
        if (json.errors) setErrors(json.errors);
      }
    } catch (err) {
      addToast("error", "An error occurred while saving the product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-olive-100 card-surface shadow-sm">
          <h2 className="text-xl font-display font-semibold text-charcoal-900">
            Basic Information
          </h2>

          <Input
            id="name"
            name="name"
            label="Product Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Ceramic Olive Oil Dispenser"
          />

          <Input
            id="slug"
            name="slug"
            label="Slug (Auto-generated if empty)"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            className="bg-cream-50 text-charcoal-700 font-mono text-sm"
          />

          <div className="w-full">
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-charcoal-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`input-field ${
                errors.description ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
              }`}
              placeholder="Detailed description of the product..."
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              label="Price ($)"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
            />
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              label="Compare At Price (Optional)"
              value={formData.compareAtPrice}
              onChange={handleChange}
              error={errors.compareAtPrice}
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-olive-100 card-surface shadow-sm space-y-6">
            <h2 className="text-xl font-display font-semibold text-charcoal-900">
              Organization
            </h2>

            <div className="w-full">
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-charcoal-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field ${
                  errors.category ? "border-red-400 focus:border-red-500" : ""
                }`}
                disabled={isLoadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="tag"
                className="mb-1.5 block text-sm font-medium text-charcoal-700"
              >
                Tag
              </label>
              <select
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="input-field"
              >
                <option value="None">None</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Bestseller">Bestseller</option>
              </select>
            </div>

            <Input
              id="stock"
              name="stock"
              type="number"
              label="Stock Quantity"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
            />

            <label className="flex items-center space-x-3 cursor-pointer p-3 border border-olive-100 rounded-lg hover:bg-olive-50/50 transition-colors">
              <input
                id="featured"
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 text-olive-600 rounded border-gray-300 focus:ring-olive-500"
              />
              <span className="text-sm font-medium text-charcoal-800">Featured Product</span>
            </label>
          </div>
        </div>
      </div>

      {/* Product Images Section (File Upload & URL support) */}
      <div className="bg-white p-6 rounded-xl border border-olive-100 card-surface shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-olive-100 pb-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-charcoal-900 flex items-center gap-2">
              <span>Product Pictures</span>
              <span className="text-xs font-normal text-charcoal-500">
                ({formData.images.length} added)
              </span>
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Add photos via file upload or direct Image URLs. Drag or reorder to set thumbnail.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-cream-100 p-1 rounded-xl flex items-center gap-1 border border-olive-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setImageTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                imageTab === "upload"
                  ? "bg-white text-olive-900 shadow-xs ring-1 ring-black/5"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                imageTab === "url"
                  ? "bg-white text-olive-900 shadow-xs ring-1 ring-black/5"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Add via URL</span>
            </button>
          </div>
        </div>

        {errors.images && <p className="text-sm text-red-500 font-medium">{errors.images}</p>}

        {/* URL Input Box */}
        {imageTab === "url" && (
          <div className="bg-cream-50 p-4 rounded-xl border border-olive-200/80 space-y-3 animate-in fade-in">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800">
              Paste Image URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... or any image link"
                  className="w-full rounded-xl border border-olive-200 bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddImageUrl}
                disabled={!imageUrlInput.trim()}
                className="shrink-0 text-xs px-5"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add URL</span>
              </Button>
            </div>
            <p className="text-[11px] text-charcoal-500">
              💡 Tip: You can paste multiple image URLs separated by commas or newlines.
            </p>
          </div>
        )}

        {/* Existing Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {formData.images.map((img, idx) => {
            const isEditing = editingImageIndex === idx;

            return (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-olive-200 bg-cream-50 group transition-all hover:border-olive-500 shadow-xs flex flex-col justify-between"
              >
                {/* Image Display */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Product view ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x400/e8ebe4/2b3a27?text=Image+Load+Error";
                  }}
                />

                {/* Primary Tag */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 z-10 rounded-md bg-olive-900/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cream-50 shadow-xs flex items-center gap-1">
                    <Star className="h-2.5 w-2.5 fill-current text-amber-400" />
                    <span>Primary</span>
                  </div>
                )}

                {/* Inline URL Editor Modal/Overlay */}
                {isEditing ? (
                  <div className="absolute inset-0 z-20 bg-charcoal-950/90 backdrop-blur-xs p-2 flex flex-col justify-center gap-2">
                    <p className="text-[10px] font-bold text-cream-50 uppercase tracking-wider">
                      Update Image URL
                    </p>
                    <input
                      type="text"
                      autoFocus
                      value={editingImageUrl}
                      onChange={(e) => setEditingImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-1.5 rounded bg-white text-charcoal-900 border border-olive-300 focus:outline-none"
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingImageIndex(null)}
                        className="text-[10px] font-bold text-gray-300 hover:text-white px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditedImageUrl(idx)}
                        className="text-[10px] font-bold text-white bg-olive-700 hover:bg-olive-800 rounded px-2.5 py-1"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Overlays */
                  <div className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImageIndex(idx);
                          setEditingImageUrl(img);
                        }}
                        className="bg-white/90 p-1.5 rounded-full text-charcoal-800 hover:bg-white transition-colors"
                        title="Edit / Update Image URL"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="bg-red-500 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, idx - 1)}
                            className="bg-white/90 p-1 rounded-md text-charcoal-800 hover:bg-white"
                            title="Move left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {idx < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, idx + 1)}
                            className="bg-white/90 p-1 rounded-md text-charcoal-800 hover:bg-white"
                            title="Move right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsPrimary(idx)}
                          className="bg-olive-800 text-cream-50 text-[9px] font-bold px-2 py-1 rounded hover:bg-olive-900 transition-colors"
                          title="Set as first thumbnail"
                        >
                          Make Main
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick File Upload Card Slot */}
          <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-olive-300 hover:border-olive-600 hover:bg-olive-50 cursor-pointer transition-colors bg-cream-50/70">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-olive-600" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-olive-600 mb-1.5" />
                <span className="text-xs text-olive-900 font-bold">Upload File</span>
                <span className="text-[10px] text-charcoal-500 mt-0.5">PNG, JPG, WEBP</span>
              </>
            )}
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="bg-white p-6 rounded-xl border border-olive-100 card-surface shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-semibold text-charcoal-900">
            Specifications
          </h2>
          <Button
            type="button"
            variant="secondary"
            onClick={addSpec}
            className="text-sm py-1.5 h-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Spec
          </Button>
        </div>

        <div className="space-y-3">
          {Object.entries(formData.specifications).length === 0 ? (
            <p className="text-sm text-charcoal-500 italic text-center py-4">
              No specifications added yet.
            </p>
          ) : (
            Object.entries(formData.specifications).map(([key, val], idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Key (e.g. Material)"
                    value={key}
                    onChange={(e) => handleSpecChange(key, e.target.value, val)}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Value (e.g. Ceramic)"
                    value={val}
                    onChange={(e) => handleSpecChange(key, key, e.target.value)}
                    className="input-field"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpec(key)}
                  className="p-2.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-olive-100 pt-6">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
