// components/dashboard/TopClients.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, TrendingUp } from "lucide-react";

const topClients = [
  {
    id: 1,
    name: "Acme Consumer Goods",
    products: 45,
    verifications: "324,567",
    trend: "up"
  },
  {
    id: 2,
    name: "PharmaCare Inc",
    products: 38,
    verifications: "289,012",
    trend: "up"
  },
  {
    id: 3,
    name: "BeautyTech Ltd",
    products: 29,
    verifications: "245,678",
    trend: "up"
  },
  {
    id: 4,
    name: "FreshFoods Co",
    products: 27,
    verifications: "198,234",
    trend: "up"
  },
];

export default function TopClients() {
  return (
    <Card className="rounded-xl shadow-sm border border-[#E5E7EB]">
      <CardHeader>
        <CardTitle>Top Clients by Verifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topClients.map((client) => (
            <div key={client.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {client.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {client.products} active products
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#111827]">
                  {client.verifications}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Top Performer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}