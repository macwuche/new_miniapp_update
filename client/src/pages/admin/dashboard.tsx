import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Users, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back, here's what's happening with your platform today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", value: "12,453", change: "+12% this month", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Deposits", value: "$1.2M", change: "+8.2% this week", icon: ArrowDownLeft, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active Bots", value: "8,203", change: "+24% active now", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total Withdrawals", value: "$450k", change: "-2% vs last week", icon: ArrowUpRight, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Takes up 2 columns */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { user: "Alex Thompson", action: "Deposited USDT", amount: "+$5,000.00", time: "2 mins ago", status: "Completed" },
                { user: "Sarah Jenkins", action: "Bot Activation (BTC/USDT)", amount: "$1,000.00", time: "15 mins ago", status: "Running" },
                { user: "Michael Chen", action: "Withdrawal Request", amount: "-$2,450.00", time: "1 hour ago", status: "Pending" },
                { user: "Jessica Wu", action: "New Registration", amount: "-", time: "2 hours ago", status: "Verified" },
                { user: "David Miller", action: "Deposited BTC", amount: "+$12,450.00", time: "3 hours ago", status: "Completed" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2 px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {item.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.user}</p>
                      <p className="text-xs text-gray-500">{item.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${item.amount.includes('+') ? 'text-green-600' : item.amount.includes('-') ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.amount}
                    </p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status - Takes up 1 column */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors">
                <Users size={20} className="mb-2 text-blue-400" />
                <span className="text-xs font-bold block">Verify Users</span>
              </button>
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors">
                <Activity size={20} className="mb-2 text-green-400" />
                <span className="text-xs font-bold block">Bot Config</span>
              </button>
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors">
                <DollarSign size={20} className="mb-2 text-orange-400" />
                <span className="text-xs font-bold block">Approve Withdrawals</span>
              </button>
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors">
                <TrendingUp size={20} className="mb-2 text-purple-400" />
                <span className="text-xs font-bold block">Market Data</span>
              </button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
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
                    <span className="font-medium text-gray-700 text-sm">{system.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${system.color} animate-pulse`} />
                      <span className="text-xs text-gray-600">{system.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
