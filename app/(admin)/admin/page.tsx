"use client";

import React, { useEffect, useState } from "react";
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
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">
        total: {payload[0].value}
      </p>
    </div>
  );
}


  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, label, value, growth, color }: any) => (
    <Card>
      <CardContent className="p-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-6 hidden md:block">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              System overview and key metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <GoBell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src="https://github.com/shadcn.png"
                className="w-8 h-8 rounded-full"
                alt="Admin"
              />
              <span className="text-sm font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-8">
        {/* Analytics */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Analytics</h3>
            <div className="flex gap-2">
              {["Day", "Week", "Month", "Year"].map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={selectedPeriod === p ? "default" : "outline"}
                  className={
                    selectedPeriod === p
                      ? "bg-cyan-400 text-white hover:bg-cyan-500"
                      : ""
                  }
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={HiOutlineUserGroup}
              label="Total Clients"
              value={stats?.totalClients || 0}
              growth="+12"
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={Package}
              label="Active Products"
              value={stats?.activeProducts || 0}
              growth="+89"
              color="bg-gray-100 text-gray-700"
            />
            <StatCard
              icon={Shield}
              label="Total Verifications"
              value={stats?.totalVerifications || 0}
              growth="+2.45%"
              color="bg-cyan-50 text-cyan-600"
            />
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 my-6 lg:grid-cols-2 gap-6">
          {/* Client Growth */}
          <Card>
  <CardHeader>
    <CardTitle>Client Growth</CardTitle>
    <p className="text-sm text-gray-500">
      New clients <span className="text-green-500 font-medium">+2.45%</span>
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


          {/* Verification Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Trend</CardTitle>
              <p className="text-sm text-gray-500">
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
      </main>
    </div>

    
  );
}
