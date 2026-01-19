"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCodes } from "@/hooks/use-codes";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Activity,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";

export default function DashboardStats() {
  const { stats, isLoadingStats } = useCodes();

  if (isLoadingStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Statistics...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const verificationRate = stats.totalCodes
    ? Math.round((stats.verifiedCodes / stats.totalCodes) * 100)
    : 0;

  const suspiciousRate = stats.verificationAttemptsToday
    ? Math.round((stats.suspiciousActivity / stats.verificationAttemptsToday) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Verification System</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Operational
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Database</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">API Rate</span>
            <Badge variant="outline">
              {stats.verificationAttemptsToday || 0}/min
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Verification Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Verification Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Verification Rate</span>
              <span className="text-sm font-bold">{verificationRate}%</span>
            </div>
            <Progress value={verificationRate} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Active Codes</span>
              <span className="text-sm font-bold">{stats.activeCodes || 0}</span>
            </div>
            <Progress 
              value={stats.totalCodes ? (stats.activeCodes / stats.totalCodes) * 100 : 0} 
              className="h-2" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Suspicious Rate
              </span>
              <span className="text-sm font-bold text-yellow-600">{suspiciousRate}%</span>
            </div>
            <Progress 
              value={suspiciousRate} 
              className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.result === 'valid' ? 'bg-green-500' :
                    activity.result === 'invalid' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-sm truncate max-w-[120px] font-mono">
                    {activity.scannedCode}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {activity.location?.country || 'Unknown'}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
          <Button variant="outline" size="sm" className="w-full">
            View All Activity
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <MapPin className="h-4 w-4 mr-2" />
            View Geomap
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Manufacturer Report
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <TrendingDown className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}