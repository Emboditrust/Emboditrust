"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Package,
  TrendingUp,
  Shield,
} from "lucide-react";
import { GoBell } from "react-icons/go";
import { HiOutlineUserGroup } from "react-icons/hi2";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [verificationsMonthly, setVerificationsMonthly] = useState<any[]>([]);
  const [clientsMonthly, setClientsMonthly] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const isDark = mounted && theme === "dark";

  const fetchAll = async () => {
    try {
      setRefreshing(true);
      const [
        statsRes,
        verifsRes,
        clientsRes,
        topRes,
        activityRes,
      ] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/verifications/monthly"),
        fetch("/api/admin/dashboard/clients/monthly"),
        fetch("/api/admin/dashboard/clients/top"),
        fetch("/api/admin/dashboard/activity/recent"),
      ]);

      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (verifsRes.ok) setVerificationsMonthly((await verifsRes.json()).data || []);
      if (clientsRes.ok) setClientsMonthly((await clientsRes.json()).data || []);
      if (topRes.ok) setTopClients((await topRes.json()).data || []);
      if (activityRes.ok) setRecentActivity((await activityRes.json()).data || []);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-100">
        total: {payload[0].value}
      </p>
    </div>
  );
}


  useEffect(() => {
    setMounted(true);
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, label, value, growth, color }: any) => (
    <Card className="rounded-2xl border border-[#cfd7e3] bg-white/95 shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95">
      <CardContent className="p-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {loading ? "..." : value}
            </p>
          </div>
        </div>
        {growth && (
          <span className="text-sm text-green-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {growth}
          </span>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className="min-h-screen bg-[#e8ebf0] bg-texture text-[#0b1c2e] transition-colors duration-300 dark:bg-[#333333] dark:text-[#f3f4f6] [font-family:Urbanist,Outfit,Montserrat,ui-sans-serif]">
      <style>{`
        .bg-texture {
          background-image: radial-gradient(circle, rgba(71,85,105,0.2) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-texture {
          background-image: radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <header className="px-4 pb-2 pt-4 md:px-8 md:pt-6">
        <div className="rounded-xl border border-[#d7dde6] bg-white/95 px-4 py-4 shadow-md backdrop-blur transition-colors duration-300 dark:border-[#5a5a5a] dark:bg-[#3a3a3a]/95 md:px-6 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Overview</p>
              <h2 className="mt-1 text-2xl font-black md:text-3xl">Admin Dashboard</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                System overview and key verification metrics.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-[#666666] dark:bg-[#444444] dark:text-slate-100 dark:hover:bg-[#505050]"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <Link href="/" className="hidden rounded-md bg-[#042333] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a] md:inline-flex">
                Public Site
              </Link>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-4 py-2.5 dark:border-[#575757] dark:bg-[#323232]">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <GoBell className="h-4.5 w-4.5" />
              <span>{refreshing ? "Refreshing dashboard data..." : "Dashboard data updates every 5 minutes"}</span>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <img
                src="https://github.com/shadcn.png"
                className="h-8 w-8 rounded-full"
                alt="Admin"
              />
              <span className="text-sm font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-8 px-4 pb-8 pt-4 md:px-8 md:pb-10">
        <section className="rounded-2xl border border-[#cfd7e3] bg-white/90 p-5 shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/90 md:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-xl font-black md:text-2xl">Analytics</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Day",
                "Week",
                "Month",
                "Year"
              ].map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={selectedPeriod === p ? "default" : "outline"}
                  className={
                    selectedPeriod === p
                      ? "bg-[#032434] text-white hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]"
                      : "border-[#c8d1dd] bg-white text-slate-700 hover:bg-slate-100 dark:border-[#595959] dark:bg-[#323232] dark:text-slate-100 dark:hover:bg-[#3b3b3b]"
                  }
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              icon={HiOutlineUserGroup}
              label="Total Clients"
              value={stats?.totalClients || 0}
              growth="+12"
              color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
            />
            <StatCard
              icon={Package}
              label="Active Products"
              value={stats?.activeProducts || 0}
              growth="+89"
              color="bg-gray-100 text-gray-700 dark:bg-slate-700/50 dark:text-slate-200"
            />
            <StatCard
              icon={Shield}
              label="Total Verifications"
              value={stats?.totalVerifications || 0}
              growth="+2.45%"
              color="bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border border-[#cfd7e3] bg-white/95 shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95">
            <CardHeader>
              <CardTitle>Client Growth</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                New clients <span className="font-medium text-green-500">+2.45%</span>
              </p>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={clientsMonthly}>
                  <defs>
                    <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.34} />
                      <stop offset="72%" stopColor="#60a5fa" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="clientStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <filter id="clientGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#2563eb" floodOpacity="0.18" />
                    </filter>
                  </defs>

                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 8" />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, (dataMax: number) => Math.max(dataMax + 2, 5)]}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="url(#clientStroke)"
                    strokeWidth={4}
                    fill="url(#clientGradient)"
                    dot={false}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#clientGlow)"
                    activeDot={{ r: 6, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#cfd7e3] bg-white/95 shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95">
            <CardHeader>
              <CardTitle>Verification Trend</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Millions <span className="text-green-500">+2.45%</span>
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={verificationsMonthly}>
                  <defs>
                    <linearGradient id="verifyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.32} />
                      <stop offset="72%" stopColor="#6366f1" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="verifyStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a5b4fc" />
                      <stop offset="55%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4338ca" />
                    </linearGradient>
                    <filter id="verifyGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#4f46e5" floodOpacity="0.18" />
                    </filter>
                  </defs>

                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 8" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="url(#verifyStroke)"
                    strokeWidth={4}
                    fill="url(#verifyGradient)"
                    dot={false}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#verifyGlow)"
                    activeDot={{ r: 6, fill: "#ffffff", stroke: "#4f46e5", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}
