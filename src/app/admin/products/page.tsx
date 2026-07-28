"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Plus, Search, Edit, Trash2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeProduct, SafeCategory, PaginatedProductsResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import AdminModal from "@/components/admin/AdminModal";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProductsPage() {
  const { addToast } = useToast();
  
  const [products, setProducts] = useState<SafeProduct[]>([]);
  const [categories, setCategories] = useState<SafeCategory[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<SafeProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Create query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });
      
      if (debouncedSearch) params.append("q", debouncedSearch);
      if (categoryFilter) params.append("category", categoryFilter);
      if (stockFilter === "in_stock") params.append("inStock", "true");
      // if out of stock, API might not have a direct filter, we'll handle it client-side if API doesn't support it, but assuming we can pass it if supported.
      // Wait, let's fetch without stock filter and filter client side if not natively supported, or just use `q` and `category`. 
      // Our ProductFiltersState has `inStock: boolean` which implies available stock. 

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        const data: PaginatedProductsResponse = json.data;
        
        let filteredProducts = data.products;
        if (stockFilter === "out_of_stock") {
           filteredProducts = filteredProducts.filter(p => p.stock === 0);
        } else if (stockFilter === "in_stock") {
           // Ensure we only show in stock if we filtered client side (if API doesn't filter perfectly)
           filteredProducts = filteredProducts.filter(p => p.stock > 0);
        }
        
        setProducts(filteredProducts);
        setTotalPages(data.totalPages || 1);
        
        if (data.categories) {
          setCategories(data.categories);
        } else if (categories.length === 0) {
          // If the API didn't return categories, fetch them separately
          const catRes = await fetch("/api/categories");
          const catJson = await catRes.json();
          if (catJson.success) {
            setCategories(catJson.data);
          }
        }
      } else {
        setError(json.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("An error occurred while loading products");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, stockFilter, categories.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      
      if (json.success) {
        addToast("success", "Product deleted successfully");
        fetchProducts(); // Refresh list
      } else {
        addToast("error", json.message || "Failed to delete product");
      }
    } catch (err) {
      addToast("error", "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const getCategoryName = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    return cat ? `${cat.emoji} ${cat.name}` : slug;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 text-charcoal-900">
          <div className="bg-olive-100 p-2 rounded-lg text-olive-700">
            <Package size={24} />
          </div>
          <h1 className="text-2xl font-display font-semibold">Product Management</h1>
        </div>
        
        <Link href="/admin/products/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-xl border border-olive-100 card-surface shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-charcoal-400" />
          </div>
          <input
            type="text"
            placeholder="Search by product name..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search
            }}
          />
        </div>
        
        <div className="w-full md:w-48">
          <select 
            className="input-field"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug}>{cat.emoji} {cat.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select 
            className="input-field"
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-olive-100 card-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal-700">
            <thead className="bg-cream-50 text-xs uppercase text-charcoal-500 font-semibold border-b border-olive-100">
              <tr>
                <th scope="col" className="px-6 py-4">Product</th>
                <th scope="col" className="px-6 py-4">Category</th>
                <th scope="col" className="px-6 py-4">Price</th>
                <th scope="col" className="px-6 py-4">Stock</th>
                <th scope="col" className="px-6 py-4">Tag</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader label="Loading products..." />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-cream-100 border border-olive-100">
                          {product.images?.[0] ? (
                            <Image 
                              src={product.images[0]} 
                              alt={product.name} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <Package className="absolute inset-0 m-auto text-olive-300 w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-charcoal-900 flex items-center gap-1.5">
                            {product.name}
                            {product.featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                          </div>
                          <div className="text-xs text-charcoal-400 font-mono mt-0.5">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${product.price.toFixed(2)}
                      {product.compareAtPrice && (
                        <span className="block text-xs line-through text-charcoal-400 font-normal">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          product.stock === 0 ? "bg-red-500" :
                          product.stock < 5 ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                        <span className={product.stock === 0 ? "text-red-600 font-medium" : ""}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.tag ? (
                        <Badge tone={
                          product.tag === "New" ? "sky" : 
                          product.tag === "Sale" ? "red" : 
                          product.tag === "Bestseller" ? "amber" : "olive"
                        }>
                          {product.tag}
                        </Badge>
                      ) : (
                        <span className="text-charcoal-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.slug}/edit`}>
                          <button className="p-1.5 text-charcoal-500 hover:text-olive-700 hover:bg-olive-50 rounded-md transition-colors" title="Edit">
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button 
                          className="p-1.5 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                          title="Delete"
                          onClick={() => {
                            setProductToDelete(product);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-center justify-between border-t border-olive-100 px-6 py-4 bg-white">
            <div className="text-sm text-charcoal-500">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="!px-2"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="!px-2"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Product"
        onConfirm={handleDeleteConfirm}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        confirmVariant="danger"
      >
        <p>Are you sure you want to delete <strong>{productToDelete?.name}</strong>?</p>
        <p className="mt-2 text-red-600 font-medium">This action cannot be undone.</p>
      </AdminModal>
    </div>
  );
}
