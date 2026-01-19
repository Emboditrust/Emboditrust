

import type { Metadata } from "next";
import React from "react";
import ConfirmLogout from "@/components/ConfirmLogout";

import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/sidebar/Sidebar";
import MobileSideBar from "@/components/admin/sidebar/MobileSidebar";
import MobileNav from "@/components/admin/navbar/MobileNavbar";
import { authOptions } from "@/lib/auth";
import StateContext, { CommonDashboardContext } from "@/providers/StateContext";
//@ts-ignore
import "./../../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { 
  Home, 
  Users, 
  DollarSign, 
  Download, 
  History, 
  Settings,
  LogOut,
  BarChart3,
  Shield,
  Bell,
  UserCheck,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { NextAuthSessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";





export const metadata: Metadata = {
  title: "Emboditrust - Admin Dashboard",
  description: "",
  icons: {
   icon: "/favicon.ico?v=2", 
  shortcut: "/favicon.ico?v=2",
  apple: "/apple-touch-icon.png",
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
      const session = await getServerSession(authOptions);
      if (session?.user.role !== "admin") return redirect("/");

    

  return (
   
      <main className=" font-body" >
        <NextAuthSessionProvider>
            <QueryProvider>
           
        <StateContext >
          <section className="flex  ">
            {/* Desktop Sidebar */}
            <div className="hidden sm:block sm:flex-4 md:flex-2 bg-white text-black font-semibold py-4  h-screen sticky top-0 overflow-auto scrollbar-hide">
              <Sidebar dashboard="admin" />
            </div>

            {/* Main Content */}
            <section className="flex-1 flex flex-col w-full overflow-hidden">
              {/* Mobile Sidebar */}
              <div className="sm:hidden">
                <MobileSideBar dashboard="admin" />
              </div>

              {/* Navbar */}
              <div className="sticky top-0 z-20 bg-white shadow-sm">
                {/* <Navbar /> */}
                <MobileNav/>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto  md:p-3 scrollbar-hide bg-stone-100 relative">
                <ConfirmLogout />
                {children}
                 <Toaster />
              </div>
            </section>
          </section>
        </StateContext>
         </QueryProvider>
         </NextAuthSessionProvider>
      </main>
   
  );
}
