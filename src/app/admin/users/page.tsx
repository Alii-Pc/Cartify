"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, Search, Check, X as XIcon, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import AdminModal from "@/components/admin/AdminModal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  orderCount?: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'role' | 'delete' | null;
    user: User | null;
  }>({
    isOpen: false,
    type: null,
    user: null
  });

  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async (page = 1, search = debouncedSearch, role = roleFilter) => {
    setLoading(true);
    try {
      let url = `/api/admin/users?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (role !== "all") url += `&role=${role}`;

      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setUsers(data.data.users);
        setPagination({
          total: data.data.total,
          page: data.data.page,
          limit: data.data.limit,
          totalPages: data.data.totalPages
        });
      } else {
        addToast("error", data.message || "Failed to load users");
      }
    } catch (err) {
      addToast("error", "An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, addToast]);

  useEffect(() => {
    fetchUsers(1, debouncedSearch, roleFilter);
  }, [fetchUsers, debouncedSearch, roleFilter]);

  const handleRoleChange = async () => {
    if (!modalState.user || actionLoading) return;
    
    setActionLoading(true);
    try {
      const newRole = modalState.user.role === 'admin' ? 'user' : 'admin';
      const res = await fetch(`/api/admin/users/${modalState.user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json();
      if (res.ok) {
        addToast("success", `User role updated to ${newRole}`);
        fetchUsers(pagination.page);
        closeModal();
      } else {
        addToast("error", data.message || "Failed to update role");
      }
    } catch (err) {
      addToast("error", "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!modalState.user || actionLoading) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${modalState.user._id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      if (res.ok) {
        addToast("success", "User deleted successfully");
        fetchUsers(pagination.page);
        closeModal();
      } else {
        addToast("error", data.message || "Failed to delete user");
      }
    } catch (err) {
      addToast("error", "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (type: 'role' | 'delete', user: User) => {
    setModalState({ isOpen: true, type, user });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, user: null });
  };

  return (
    <div className="p-8 bg-cream-50 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900 flex items-center gap-3">
            <Users className="text-olive-600" />
            User Management
          </h1>
          <p className="text-charcoal-700 mt-1">Manage all registered users and their roles</p>
        </div>
      </div>

      <div className="admin-card bg-white p-6 rounded-2xl border border-olive-200 shadow-sm space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500" size={18} />
              <input
                type="text"
                placeholder="Search name or email..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field !py-2 !px-3 bg-white w-full md:w-40"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="text-sm text-charcoal-700 font-medium">
            Showing {users.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : (
            <table className="admin-table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-olive-200 text-charcoal-700 text-sm uppercase">
                  <th className="pb-3 px-4 font-semibold">User</th>
                  <th className="pb-3 px-4 font-semibold">Role</th>
                  <th className="pb-3 px-4 font-semibold">Verified</th>
                  <th className="pb-3 px-4 font-semibold">Joined</th>
                  <th className="pb-3 px-4 font-semibold">Orders</th>
                  <th className="pb-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-olive-100 hover:bg-cream-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-charcoal-900">{user.name}</div>
                      <div className="text-sm text-charcoal-700">{user.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone={user.role === 'admin' ? 'olive' : 'cream'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {user.isVerified ? (
                        <Check className="text-emerald-500" size={20} />
                      ) : (
                        <XIcon className="text-red-500" size={20} />
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-charcoal-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-charcoal-900 font-medium">
                      {user.orderCount || 0}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => openModal('role', user)}
                          className="!px-2 !py-1 text-xs"
                          disabled={actionLoading}
                        >
                          <Edit size={14} className="mr-1" /> Role
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => openModal('delete', user)}
                          className="!px-2 !py-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                          disabled={actionLoading}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-charcoal-700">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-olive-100 pt-4">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1 || actionLoading}
              onClick={() => fetchUsers(pagination.page - 1)}
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <span className="text-sm text-charcoal-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages || actionLoading}
              onClick={() => fetchUsers(pagination.page + 1)}
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminModal
        isOpen={modalState.isOpen && modalState.type === 'role'}
        onClose={closeModal}
        title="Change User Role"
        onConfirm={handleRoleChange}
        confirmLabel={actionLoading ? "Updating..." : "Confirm"}
        confirmVariant="primary"
      >
        <p>
          Are you sure you want to make <strong>{modalState.user?.name}</strong> an{" "}
          <strong>{modalState.user?.role === 'admin' ? 'user' : 'admin'}</strong>?
        </p>
      </AdminModal>

      <AdminModal
        isOpen={modalState.isOpen && modalState.type === 'delete'}
        onClose={closeModal}
        title="Delete User"
        onConfirm={handleDeleteUser}
        confirmLabel={actionLoading ? "Deleting..." : "Delete User"}
        confirmVariant="danger"
      >
        <p>
          Are you sure you want to delete <strong>{modalState.user?.name}</strong>? This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
