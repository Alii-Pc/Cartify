"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Store,
  X,
  PackageOpen,
  Settings
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
}

export default function AdminSidebar({ isOpen, onClose, isMobile, isCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Inventory", href: "/admin/inventory", icon: PackageOpen },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col bg-charcoal-900 text-cream-100 transition-all duration-300 ease-in-out
    ${isMobile ? (isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full w-[260px]") : (isCollapsed ? "w-[72px]" : "w-[260px]")}
  `;

  const linkBaseClasses = "flex items-center rounded-lg mx-3 px-3 py-3 text-sm font-medium transition-all duration-200 group";

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className={`flex h-16 items-center px-4 shrink-0 ${isCollapsed && !isMobile ? "justify-center" : "justify-between"}`}>
          {(!isCollapsed || isMobile) ? (
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-white tracking-wide">Cartify</span>
              <span className="rounded bg-olive-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Admin
              </span>
            </Link>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive-700 text-lg font-bold text-white">
              C
            </span>
          )}

          {isMobile && (
            <button onClick={onClose} className="p-1 text-cream-200 hover:text-white rounded-md hover:bg-charcoal-800">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto py-6 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  ${linkBaseClasses}
                  ${isActive 
                    ? "bg-olive-800/60 text-white border-l-4 border-olive-400" 
                    : "text-cream-200 hover:bg-charcoal-800 hover:text-white border-l-4 border-transparent"
                  }
                  ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
                `}
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <Icon size={20} className={`${isActive ? "text-olive-400" : "text-cream-300 group-hover:text-white"} ${(!isCollapsed || isMobile) ? "mr-3" : ""}`} />
                {(!isCollapsed || isMobile) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-charcoal-800">
          <Link
            href="/"
            className={`
              ${linkBaseClasses} 
              text-cream-300 hover:bg-charcoal-800 hover:text-white border-l-4 border-transparent
              ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
            `}
            title={isCollapsed && !isMobile ? "Back to Store" : undefined}
          >
            <Store size={20} className={(!isCollapsed || isMobile) ? "mr-3" : ""} />
            {(!isCollapsed || isMobile) && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
