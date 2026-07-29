"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, PackageOpen, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Category {
  _id: string;
  name: string;
}

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

interface InventoryProduct {
  _id: string;
  name: string;
  images: string[];
  category: Category;
  price: number;
  stock: number;
  sku?: string;
}

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { addToast } = useToast();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Track the edited stock values
  const [editStocks, setEditStocks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const fetchInventory = useCallback(async (pageStr = "1") => {
    setLoading(true);
    try {
      let url = `/api/admin/inventory?page=${pageStr}&limit=10`;
      if (debouncedSearch) {
        url += `&q=${encodeURIComponent(debouncedSearch)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.data.products);
        setPagination({
          page: data.data.page,
          limit: data.data.limit,
          total: data.data.total,
          totalPages: data.data.totalPages
        });
        
        // Initialize edit states
        const initialStocks: Record<string, number> = {};
        data.data.products.forEach((p: InventoryProduct) => {
          initialStocks[p._id] = p.stock;
        });
        setEditStocks(initialStocks);
      } else {
        addToast("error", data.message || "Failed to fetch inventory");
      }
    } catch (err) {
      addToast("error", "Network error while fetching inventory");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, addToast]);

  useEffect(() => {
    fetchInventory("1");
  }, [debouncedSearch, fetchInventory]);

  const handleStockChange = (id: string, value: string) => {
    const val = parseInt(value, 10);
    if (isNaN(val) || val < 0) return;
    setEditStocks(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (product: InventoryProduct) => {
    const newStock = editStocks[product._id];
    if (newStock === product.stock) return;

    setIsSaving(prev => ({ ...prev, [product._id]: true }));
    try {
      const res = await fetch(`/api/admin/inventory/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await res.json();

      if (res.ok) {
        addToast("success", "Stock updated");
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, stock: newStock ?? product.stock } : p));
      } else {
        addToast("error", data.message || "Update failed");
        setEditStocks(prev => ({ ...prev, [product._id]: product.stock })); // revert
      }
    } catch (err) {
      addToast("error", "Network error updating stock");
      setEditStocks(prev => ({ ...prev, [product._id]: product.stock })); // revert
    } finally {
      setIsSaving(prev => ({ ...prev, [product._id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal-900 flex items-center gap-2">
            <PackageOpen className="text-olive-600" size={28} />
            Inventory
          </h1>
          <p className="text-sm text-charcoal-600 mt-1">
            Manage product stock levels and track low inventory
          </p>
        </div>
      </div>

      <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" size={18} />
            <input
              type="text"
              placeholder="Search products by name..."
              className="input-field !pl-10 bg-white w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-charcoal-700 font-medium whitespace-nowrap">
            Showing {products.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-olive-50 border-b border-olive-100">
                  <th className="px-6 py-4 text-xs font-semibold text-olive-700 uppercase tracking-wider rounded-tl-xl">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olive-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olive-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olive-700 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-olive-700 uppercase tracking-wider w-48 rounded-tr-xl">Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-cream-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-lg bg-charcoal-100 overflow-hidden flex-shrink-0 border border-charcoal-200">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <PackageOpen className="absolute inset-0 m-auto text-charcoal-400" size={24} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-charcoal-900 line-clamp-1">{product.name}</div>
                          {product.sku && <div className="text-xs text-charcoal-500 mt-0.5">SKU: {product.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-700">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.stock <= 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editStocks[product._id] ?? product.stock}
                          onChange={(e) => handleStockChange(product._id, e.target.value)}
                          className="w-20 px-2 py-1.5 text-sm border border-charcoal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 bg-white"
                        />
                        {editStocks[product._id] !== product.stock && (
                          <Button 
                            variant="primary" 
                            className="!px-3 !py-1.5 !text-xs"
                            onClick={() => handleSaveStock(product)}
                            disabled={isSaving[product._id]}
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-charcoal-700">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-olive-100 pt-4 mt-4">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => fetchInventory((pagination.page - 1).toString())}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <span className="text-sm text-charcoal-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchInventory((pagination.page + 1).toString())}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
