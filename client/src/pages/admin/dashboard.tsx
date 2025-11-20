import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <h1 className="font-bold text-xl">Brokerage Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Admin User</span>
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Users", value: "12,453", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Volume", value: "$45.2M", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
            { label: "Active Trades", value: "1,203", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Revenue", value: "$892.4k", icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100" />
                      <div>
                        <p className="font-medium text-gray-900">User #{1000 + i}</p>
                        <p className="text-sm text-gray-500">Telegram ID: {555000 + i}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Telegram Bot API", status: "Operational", color: "bg-green-500" },
                  { name: "Trading Engine", status: "Operational", color: "bg-green-500" },
                  { name: "Database Cluster", status: "Operational", color: "bg-green-500" },
                  { name: "Payment Gateway", status: "Degraded", color: "bg-yellow-500" },
                ].map((system) => (
                  <div key={system.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{system.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${system.color}`} />
                      <span className="text-sm text-gray-600">{system.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
