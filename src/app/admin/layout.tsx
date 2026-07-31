"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/Loader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { NotificationToast } from "@/components/admin/NotificationToast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && pathname !== "/admin/login") {
      if (!user) {
        router.push("/admin/login");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, isLoading, router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream-50 font-sans">
      <NotificationToast />
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isMobile={isMobile}
        isCollapsed={isCollapsed}
      />
      
      <div 
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          !isMobile ? (isCollapsed ? 'ml-[72px]' : 'ml-[260px]') : ''
        }`}
      >
        <AdminHeader 
          onMenuClick={() => setIsSidebarOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobile={isMobile}
        />
        
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
