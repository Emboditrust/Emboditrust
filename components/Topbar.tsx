// components/TopNavbar.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

export function TopNavbar() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
      {/* Left - Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-9 rounded-lg border-[#E5E7EB] focus-visible:ring-[#2957FF]"
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-[#2957FF]"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#2957FF]">
          <HelpCircle className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#2957FF] relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-[#E5E7EB]">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">Admin User</p>
            <p className="text-xs text-[#6B7280]">Super Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        </div>
      </div>
    </header>
  );
}