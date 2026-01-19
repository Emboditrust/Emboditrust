"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  HelpCircle,
  Globe,
  Calendar,
  Clock,
  User,
  Menu,
  X,
} from "lucide-react";
import { format } from "date-fns";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/clients": "Client Management",
  "/admin/generate": "QR Code Generation",
  "/admin/batches": "Batch Management",
  "/admin/analytics": "Analytics & Reports",
  "/admin/activity": "Activity Log",
  "/admin/reports": "Reports",
  "/admin/alerts": "Security Alerts",
  "/admin/settings": "System Settings",
};

export function AdminHeader() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) {
        return title;
      }
    }
    return "Admin Panel";
  };

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "admin") {
      parts.shift();
    }
    
    return parts.map((part, index) => {
      const path = "/admin/" + parts.slice(0, index + 1).join("/");
      const title = pageTitles[path] || part.charAt(0).toUpperCase() + part.slice(1);
      
      return {
        title,
        path,
        isLast: index === parts.length - 1,
      };
    });
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left Side: Title & Breadcrumbs */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {getPageTitle()}
                </h1>
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(currentTime, "MMMM d, yyyy")}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(currentTime, "hh:mm:ss a")}
                  </span>
                  
                  {getBreadcrumbs().length > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-sm">
                        {getBreadcrumbs().map((crumb, index) => (
                          <div key={crumb.path} className="flex items-center gap-1">
                            {index > 0 && (
                              <span className="text-gray-400">/</span>
                            )}
                            <span className={`${
                              crumb.isLast 
                                ? "text-blue-600 font-medium" 
                                : "text-gray-500 hover:text-gray-700"
                            }`}>
                              {crumb.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Search & Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients, batches, or codes..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotifications(0)}
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="icon"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Language/Region */}
            <Button
              variant="ghost"
              size="icon"
            >
              <Globe className="h-5 w-5" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2 border-l pl-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">System Status:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Operational
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">API Latency:</span>
            <Badge variant="outline">142ms</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Uptime:</span>
            <Badge variant="outline">99.9%</Badge>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="text-sm text-gray-500">
            Last Updated: {format(currentTime, "hh:mm:ss a")}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </header>
  );
}