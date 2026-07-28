"use client";

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminHeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
}

export default function AdminHeader({ onMenuClick, isCollapsed, onToggleCollapse, isMobile }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.includes("/admin/users")) return "Users Management";
    if (pathname.includes("/admin/products")) return "Products Management";
    if (pathname.includes("/admin/categories")) return "Categories Management";
    if (pathname.includes("/admin/orders")) return "Orders Management";
    return "Admin Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-olive-100 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {isMobile ? (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-charcoal-600 hover:bg-cream-100 hover:text-charcoal-900 focus:outline-none"
          >
            <Menu size={20} />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="rounded-md p-2 text-charcoal-600 hover:bg-cream-100 hover:text-charcoal-900 focus:outline-none"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
        <h1 className="text-lg font-semibold text-charcoal-900">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-charcoal-900">{user?.name || 'Admin'}</span>
          <span className="text-xs text-charcoal-500 capitalize">{user?.role || 'admin'}</span>
        </div>
        
        <div className="h-8 w-8 overflow-hidden rounded-full bg-olive-200 flex items-center justify-center text-olive-800 font-bold border border-olive-300">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>

        <div className="h-6 w-px bg-olive-200 hidden sm:block"></div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-md p-2 text-sm text-charcoal-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
