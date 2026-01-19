"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  Gift,
  TrendingUp,
  Shield,
  Clock,
  Wallet,
  RefreshCw,
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
      const [statsRes, verifsRes, clientsRes, topRes, activityRes] =
        await Promise.all([
          fetch("/api/admin/dashboard/stats"),
          fetch("/api/admin/dashboard/verifications/monthly"),
          fetch("/api/admin/dashboard/clients/monthly"),
          fetch("/api/admin/dashboard/clients/top"),
          fetch("/api/admin/dashboard/activity/recent"),
        ]);

      if (statsRes.ok) {
        const json = await statsRes.json();
        setStats(json.stats);
      }

      if (verifsRes.ok) {
        const json = await verifsRes.json();
        setVerificationsMonthly(json.data || []);
      }

      if (clientsRes.ok) {
        const json = await clientsRes.json();
        setClientsMonthly(json.data || []);
      }

      if (topRes.ok) {
        const json = await topRes.json();
        setTopClients(json.data || []);
      }

      if (activityRes.ok) {
        const json = await activityRes.json();
        setRecentActivity(json.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, label, value, growth, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg  ${color}`}>
             <Icon className="h-6 w-6 rounded-md " />
           
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {loading ? "..." : value}
            </h3>
          </div>
          <div>
            {growth && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  {growth}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b md:block hidden border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                System overview and key metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <GoBell className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                
                <img
                  src="https://github.com/shadcn.png"
                  alt="Admin User"
                  className="w-8 h-8 rounded-full grayscale object-cover"
                />
                <span className="font-medium text-[14px] text-gray-900">Admin User</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Analytics Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Analytics</h3>
              <div className="flex gap-2">
                {["Day", "Week", "Month", "Year"].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={
                      selectedPeriod === period
                        ? "bg-cyan-400 hover:bg-cyan-500 text-white"
                        : ""
                    }
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
              <StatCard
                icon={HiOutlineUserGroup}
                label="Total Clients"
                value={stats?.totalClients || "0"}
                growth="+12"
                color="text-blue-500 "
               
              />
              <StatCard
                icon={Package}
                label="Active Products"
                value={stats?.activeProducts?.toLocaleString() || "0"}
                growth="+89"
                color="text-gray-700"
              />

              <StatCard
                icon={Shield}
                label="Total Verifications"
                value={stats?.totalVerifications?.toLocaleString() || "0"}
                growth={
                  stats?.monthlyGrowth ? `+${stats.monthlyGrowth}%` : "+0%"
                }
                color="text-cyan-400"
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Growth</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      New clients{" "}
                      <span className="text-green-500 font-medium">
                        ↑ +2.45%
                      </span>
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={clientsMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#1e3a8a"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#1e3a8a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Verification Trend</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Millions{" "}
                      <span className="text-green-500 font-medium">
                        ↑ +2.45%
                      </span>
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={verificationsMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#6366f1" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading...
                    </div>
                  ) : recentActivity.length ? (
                    recentActivity
                      .slice(0, 5)
                      .map((activity: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 pb-4 border-b last:border-0"
                        >
                          <div className="w-1 h-12 bg-indigo-600 rounded-full" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {activity.type || "New client registered"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.companyName ||
                                activity.details ||
                                "BeautyTech Ltd"}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {activity.timestamp
                              ? new Date(
                                  activity.timestamp
                                ).toLocaleTimeString()
                              : "5 min ago"}
                          </span>
                        </div>
                      ))
                  ) : (
                    <>
                      <ActivityItem
                        title="No  recent activities"
                        company=""
                        time=""
                      />
                      
                      
                      
                      
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading...
                    </div>
                  ) : topClients.length ? (
                    topClients.slice(0, 5).map((client: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between pb-4 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-12 bg-indigo-600 rounded-full" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {client.companyName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {client.productCount || client.manufacturerId}{" "}
                              active products
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">
                          {client.totalVerifications?.toLocaleString() ||
                            client.verifications?.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      <ClientItem
                        name="No data found"
                        products=""
                        count=""
                      />
                      
                      
                     
                      
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function ActivityItem({ title, company, time }: any) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b last:border-0">
      <div className="w-1 h-12 bg-indigo-600 rounded-full" />
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{company}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}

function ClientItem({ name, products, count }: any) {
  return (
    <div className="flex items-center justify-between pb-4 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-1 h-12 bg-indigo-600 rounded-full" />
        <div>
          <p className="font-semibold text-sm text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{products}</p>
        </div>
      </div>
      <span className="font-bold text-gray-900">{count}</span>
    </div>
  );
}
