"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  QrCode,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Home,
  FileText,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Clients", href: "/admin/clients", icon: Users, exact: false },
  //{ name: "Generate QR", href: "/admin/generate", icon: QrCode, exact: false },
   { name: "Batches", href: "/admin/batches", icon: Package, exact: false },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, exact: false },
  { name: "Activity", href: "/admin/activity", icon: RefreshCw, exact: false },
  { name: "Reports", href: "/admin/reports", icon: FileText, exact: false },
  { name: "Alerts", href: "/admin/alerts", icon: AlertTriangle, exact: false },
  { name: "Settings", href: "/admin/settings", icon: Settings, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call your logout API
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (response.ok) {
        toast.success("Logged out successfully");
        router.push('/admin-login');
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Network error during logout");
    }
  };

  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EmbodiTrust</h1>
            <p className="text-xs text-gray-500">Anti-Counterfeiting System</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">System Online</span>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </p>
          {navItems.slice(0, 5).map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname.startsWith(item.href);
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 px-3 h-11 mb-1 ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                      : "hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Monitoring
          </p>
          {navItems.slice(5, 7).map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname.startsWith(item.href);
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 px-3 h-11 mb-1 ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                      : "hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            System
          </p>
          {navItems.slice(7).map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname.startsWith(item.href);
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 px-3 h-11 mb-1 ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                      : "hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                  <span className="font-medium">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 h-11 mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Public Portal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* User & Logout Section */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <span className="font-bold text-blue-700">A</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}