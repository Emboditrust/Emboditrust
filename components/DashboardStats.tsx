// components/dashboard/DashboardStats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, QrCode, Package, Gift, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface StatsProps {
  stats: {
    totalClients: number;
    totalVerifications: number;
    activeProducts: number;
    activeCampaigns: number;
    pendingApprovals: number;
    revenue: string;
    clientGrowth: number;
    verificationTrend: string;
    suspiciousAttempts: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statsCards = [
    {
      label: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      color: "bg-blue-50",
      iconColor: "text-[#2957FF]",
      trend: `${stats.clientGrowth >= 0 ? '+' : ''}${stats.clientGrowth}%`,
      trendColor: stats.clientGrowth >= 0 ? "text-green-600" : "text-red-600",
      trendIcon: stats.clientGrowth >= 0 ? TrendingUp : TrendingDown
    },
    {
      label: "Total Verifications",
      value: formatNumber(stats.totalVerifications),
      icon: QrCode,
      color: "bg-green-50",
      iconColor: "text-green-500",
      trend: stats.verificationTrend,
      trendColor: stats.verificationTrend.includes('+') ? "text-green-600" : "text-red-600",
      trendIcon: stats.verificationTrend.includes('+') ? TrendingUp : TrendingDown
    },
    {
      label: "Active Products",
      value: stats.activeProducts,
      icon: Package,
      color: "bg-purple-50",
      iconColor: "text-purple-500",
      trend: "+8.2%", // You'll need to calculate this from your data
      trendColor: "text-green-600",
      trendIcon: TrendingUp
    },
    {
      label: "Suspicious Attempts",
      value: stats.suspiciousAttempts,
      icon: AlertTriangle,
      color: "bg-yellow-50",
      iconColor: "text-yellow-500",
      trend: stats.suspiciousAttempts > 0 ? "Alert" : "Clean",
      trendColor: stats.suspiciousAttempts > 0 ? "text-red-600" : "text-green-600",
      trendIcon: stats.suspiciousAttempts > 0 ? AlertTriangle : TrendingUp
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        
        return (
          <Card key={card.label} className="rounded-xl shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#6B7280]">{card.label}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={`w-3 h-3 ${card.trendColor}`} />
                    <span className={`text-xs ${card.trendColor}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}