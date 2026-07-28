"use client";

import { useEffect, useState } from "react";
import { FolderTree, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import AdminModal from "@/components/admin/AdminModal";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Loader } from "@/components/ui/Loader";
import { Loader2 } from "lucide-react";

// Using the exact format specified
interface CategoryWithCount {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success && json.data.categories) {
        setCategories(json.data.categories);
      }
    } catch (error) {
      addToast("error", "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (category: CategoryWithCount) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deletingCategory.slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete category");
      }
      
      addToast("success", "Category deleted successfully");
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <FolderTree className="text-olive-600" />
            Category Management
          </h1>
          <p className="text-charcoal-500 mt-1">Organize your products into categories</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={18} />
          Add Category
        </Button>
      </div>

      <div className="card-surface overflow-hidden bg-white rounded-xl border border-olive-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-50 text-charcoal-700 border-b border-olive-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Products</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-olive-600" />
                    <p className="text-sm text-charcoal-500 mt-2">Loading categories...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-charcoal-500">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-olive-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.emoji}</span>
                        <span className="font-medium text-charcoal-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal-600 font-mono text-xs">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-charcoal-600 max-w-xs truncate">
                      {category.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-olive-100 text-olive-800">
                        {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-charcoal-500 hover:text-olive-600 hover:bg-olive-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="p-1.5 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-olive-100 p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold text-charcoal-900 mb-6">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <CategoryForm 
              initialData={editingCategory || undefined}
              onSuccess={() => {
                setIsFormOpen(false);
                fetchCategories();
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Category"
        onConfirm={confirmDelete}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        confirmVariant="danger"
      >
        <p>Are you sure you want to delete the category <strong className="text-charcoal-900">{deletingCategory?.name}</strong>?</p>
        {(deletingCategory?.productCount || 0) > 0 && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100 flex items-start gap-2">
            <span className="text-xl leading-none mt-0.5">⚠️</span>
            <p>
              This category has <strong>{deletingCategory?.productCount} products</strong>. 
              You must reassign or delete them first before deleting this category.
            </p>
          </div>
        )}
        {(deletingCategory?.productCount || 0) === 0 && (
          <p className="mt-2 text-charcoal-600">This action cannot be undone.</p>
        )}
      </AdminModal>
    </div>
  );
}
