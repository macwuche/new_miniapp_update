import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Users, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeBotsCount: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

interface ActivityItem {
  type: string;
  userId: number;
  userName: string;
  amount: string;
  status: string;
  createdAt: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}k`;
  }
  return `$${amount.toFixed(2)}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: activity, isLoading: activityLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/admin/activity"],
  });

  const statsConfig = [
    { 
      label: "Total Users", 
      value: stats ? stats.totalUsers.toLocaleString() : "0", 
      change: "+12% this month", 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Total Deposits", 
      value: stats ? formatCurrency(stats.totalDeposits) : "$0", 
      change: stats ? `+${stats.pendingDeposits} pending` : "+0 pending", 
      icon: ArrowDownLeft, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Active Bots", 
      value: stats ? stats.activeBotsCount.toLocaleString() : "0", 
      change: "+24% active now", 
      icon: Activity, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
    { 
      label: "Total Withdrawals", 
      value: stats ? formatCurrency(stats.totalWithdrawals) : "$0", 
      change: stats ? `+${stats.pendingWithdrawals} pending` : "+0 pending", 
      icon: ArrowUpRight, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back, here's what's happening with your platform today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsConfig.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-all" data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
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
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight" data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activityLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 -mx-2 px-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : activity && activity.length > 0 ? (
                activity.map((item, i) => {
                  const isDeposit = item.type === "Deposit";
                  const amountPrefix = isDeposit ? "+" : "-";
                  const amountColor = isDeposit ? "text-green-600" : "text-red-600";
                  
                  return (
                    <div key={i} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2 px-4" data-testid={`activity-item-${i}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                          {item.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.userName}</p>
                          <p className="text-xs text-gray-500">{item.type} - {item.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${amountColor}`}>
                          {amountPrefix}${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors" data-testid="button-verify-users">
                <Users size={20} className="mb-2 text-blue-400" />
                <span className="text-xs font-bold block">Verify Users</span>
              </button>
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors" data-testid="button-bot-config">
                <Activity size={20} className="mb-2 text-green-400" />
                <span className="text-xs font-bold block">Bot Config</span>
              </button>
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors" data-testid="button-approve-withdrawals">
                <DollarSign size={20} className="mb-2 text-orange-400" />
                <span className="text-xs font-bold block">Approve Withdrawals</span>
              </button>
              <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition-colors" data-testid="button-market-data">
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
                  <div key={system.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl" data-testid={`system-health-${system.name.toLowerCase().replace(/\s+/g, '-')}`}>
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
