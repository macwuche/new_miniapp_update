import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";

type Transaction = {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: string;
  currency: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'failed';
  createdAt: string;
  network?: string;
  method?: string;
};

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50", label: "Pending" },
  approved: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Approved" },
  completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Completed" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Rejected" },
  failed: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: "Failed" },
};

export default function Transactions() {
  const { user } = useTelegram();
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  const { data: deposits = [], isLoading: depositsLoading } = useQuery({
    queryKey: ['user-deposits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/users/${user.id}/deposits`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['user-withdrawals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/users/${user.id}/withdrawals`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const allTransactions: Transaction[] = [
    ...deposits.map((d: any) => ({ ...d, type: 'deposit' as const })),
    ...withdrawals.map((w: any) => ({ ...w, type: 'withdrawal' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredTransactions = activeTab === 'all' 
    ? allTransactions 
    : activeTab === 'deposits' 
      ? allTransactions.filter(t => t.type === 'deposit')
      : allTransactions.filter(t => t.type === 'withdrawal');

  const isLoading = depositsLoading || withdrawalsLoading;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MobileLayout>
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
        <div className="px-6 pt-8 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              onClick={() => window.history.back()}
              data-testid="back-btn"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          </div>

          <div className="flex gap-2">
            {(['all', 'deposits', 'withdrawals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownCircle size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Transactions Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'deposits' 
                  ? "You haven't made any deposits yet."
                  : activeTab === 'withdrawals'
                    ? "You haven't made any withdrawals yet."
                    : "Your transaction history will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const status = statusConfig[transaction.status];
                const StatusIcon = status.icon;
                const isDeposit = transaction.type === 'deposit';

                return (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
                    data-testid={`transaction-${transaction.type}-${transaction.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDeposit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {isDeposit ? (
                          <ArrowDownCircle size={24} className="text-green-600" />
                        ) : (
                          <ArrowUpCircle size={24} className="text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {isDeposit ? 'Deposit' : 'Withdrawal'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color} font-medium`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                          {isDeposit ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {transaction.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
