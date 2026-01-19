// components/dashboard/RecentActivities.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, UserPlus, FileCheck, CheckCircle, AlertTriangle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "new_client",
    title: "New client registered",
    client: "BonaryTech Ltd",
    time: "5 min ago",
    icon: UserPlus,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    id: 2,
    type: "approval",
    title: "Product approval requested",
    client: "Acme Consumer Goods",
    time: "12 min ago",
    icon: FileCheck,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50"
  },
  {
    id: 3,
    type: "verification",
    title: "Code generation completed",
    client: "PharmaCare Inc",
    time: "18 min ago",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    id: 4,
    type: "support",
    title: "Support ticket opened",
    client: "FreshFoods Co",
    time: "24 min ago",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50"
  },
];

export default function RecentActivities() {
  return (
    <Card className="rounded-xl shadow-sm border border-[#E5E7EB]">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-[#111827]">
                      {activity.title}
                    </p>
                    <span className="text-xs text-[#6B7280]">{activity.time}</span>
                  </div>
                  <p className="text-sm text-[#6B7280] mt-1">{activity.client}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}