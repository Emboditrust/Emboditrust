// components/dashboard/DashboardCharts.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const batchData = [
  { month: "Jan", batches: 120 },
  { month: "Feb", batches: 180 },
  { month: "Mar", batches: 150 },
  { month: "Apr", batches: 220 },
  { month: "May", batches: 190 },
  { month: "Jun", batches: 250 },
];

const verificationData = [
  { day: "Mon", verifications: 4200 },
  { day: "Tue", verifications: 3800 },
  { day: "Wed", verifications: 5100 },
  { day: "Thu", verifications: 4900 },
  { day: "Fri", verifications: 5600 },
  { day: "Sat", verifications: 3200 },
  { day: "Sun", verifications: 2800 },
];

export default function DashboardCharts() {
  return (
    <div className="space-y-6">
      {/* Batch Generation Chart */}
      <Card className="rounded-xl shadow-sm border border-[#E5E7EB]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Batch Generation Overview</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="batches" 
                  fill="#2957FF" 
                  radius={[4, 4, 0, 0]} 
                  name="Batches Generated"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Verification Trend Chart */}
      <Card className="rounded-xl shadow-sm border border-[#E5E7EB]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Verification Trends</CardTitle>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">+24.3%</p>
              <p className="text-sm text-[#6B7280]">vs last week</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={verificationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="verifications" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Verifications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}