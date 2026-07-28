"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Plus, Trash2, Loader2 } from "lucide-react";
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
    specifications: initialData?.specifications || {}
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !initialData ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") } : {})
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      
      if (json.success && json.data?.url) {
        setFormData(prev => ({ ...prev, images: [...prev.images, json.data.url] }));
        addToast("success", "Image uploaded successfully");
      } else {
        addToast("error", json.message || "Failed to upload image");
      }
    } catch (err) {
      addToast("error", "An error occurred during upload");
    } finally {
      setIsUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSpecChange = (oldKey: string, newKey: string, newValue: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      if (oldKey !== newKey) {
        delete newSpecs[oldKey];
      }
      newSpecs[newKey] = newValue;
      return { ...prev, specifications: newSpecs };
    });
  };

  const removeSpec = (keyToRemove: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[keyToRemove];
      return { ...prev, specifications: newSpecs };
    });
  };

  const addSpec = () => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, "": "" }
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
      specifications: formData.specifications
    };

    const schema = initialData ? updateProductSchema : createProductSchema;
    const validation = schema.safeParse(payload);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
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
        addToast("success", initialData ? "Product updated successfully" : "Product created successfully");
        if (onSuccess) onSuccess();
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
          <h2 className="text-xl font-display font-semibold text-charcoal-900">Basic Information</h2>
          
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
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-charcoal-700">Description</label>
            <textarea 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`input-field ${errors.description ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
            />
            {errors.description && <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>}
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
            <h2 className="text-xl font-display font-semibold text-charcoal-900">Organization</h2>
            
            <div className="w-full">
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-charcoal-700">Category</label>
              <select 
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input-field ${errors.category ? "border-red-400 focus:border-red-500" : ""}`}
                disabled={isLoadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.slug}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1.5 text-xs text-red-500">{errors.category}</p>}
            </div>

            <div className="w-full">
              <label htmlFor="tag" className="mb-1.5 block text-sm font-medium text-charcoal-700">Tag</label>
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

      {/* Images Section */}
      <div className="bg-white p-6 rounded-xl border border-olive-100 card-surface shadow-sm space-y-6">
        <h2 className="text-xl font-display font-semibold text-charcoal-900">Product Images</h2>
        
        {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {formData.images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-olive-200 group">
              <Image src={img} alt={`Product ${idx+1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-olive-300 hover:border-olive-500 hover:bg-olive-50 cursor-pointer transition-colors bg-cream-50">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-olive-600" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-olive-500 mb-2" />
                <span className="text-xs text-olive-700 font-medium">Add Image</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="bg-white p-6 rounded-xl border border-olive-100 card-surface shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-semibold text-charcoal-900">Specifications</h2>
          <Button type="button" variant="secondary" onClick={addSpec} className="text-sm py-1.5 h-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Add Spec
          </Button>
        </div>
        
        <div className="space-y-3">
          {Object.entries(formData.specifications).length === 0 ? (
            <p className="text-sm text-charcoal-500 italic text-center py-4">No specifications added yet.</p>
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
