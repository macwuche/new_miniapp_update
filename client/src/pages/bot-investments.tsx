import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Bot, Activity, Plus, ArrowDownToLine, ArrowUpFromLine, LifeBuoy } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BotInvestments() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-900 pb-24">
        {/* Header Section */}
        <div className="bg-gray-900 text-white pt-8 pb-6 px-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div 
                className="flex items-center text-gray-400 text-sm mb-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Bots
              </div>
              <h1 className="text-2xl font-black mb-2 tracking-tight">Bot Trading Dashboard</h1>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                Monitor and manage your automated trading investments
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700 shadow-inner">
              <Activity className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Stats Column - Vertical Stack for Mobile */}
        <div className="px-6 space-y-4 mb-8">
          <Card className="w-full p-5 border-none shadow-lg bg-[#111827] rounded-3xl border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Wallet size={20} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">$250.00</p>
            <p className="text-sm text-gray-400 font-medium">Total Invested</p>
          </Card>

          <Card className="w-full p-5 border-none shadow-lg bg-[#111827] rounded-3xl border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">$0.00</p>
            <p className="text-sm text-gray-400 font-medium">Current Balance</p>
          </Card>

          <Card className="w-full p-5 border-none shadow-lg bg-[#111827] rounded-3xl border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ArrowUpFromLine size={20} />
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-1">+$0.00</p>
            <p className="text-sm text-gray-400 font-medium">Total Profit</p>
          </Card>
        </div>

        <div className="px-6 space-y-6">
          {/* Your Investments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 border-none shadow-lg bg-[#111827] rounded-3xl border border-gray-800 min-h-[320px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-white">Your Investments</h2>
                <Link href="/bot-market">
                  <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-full px-4">
                    <Plus size={14} className="mr-1" />
                    New Investment
                  </Button>
                </Link>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Bot className="text-gray-500" size={32} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No Investments Yet</h3>
                <p className="text-xs text-gray-400 max-w-[200px] mb-6">
                  Start your automated trading journey today
                </p>
                <Link href="/bot-market">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20">
                    <Plus size={16} className="mr-2" />
                    Start Investing
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className="p-6 border-none shadow-lg bg-[#111827] rounded-3xl border border-gray-800 min-h-[200px]">
                <h2 className="text-sm font-bold text-white mb-6">Recent Activity</h2>
                <div className="flex flex-col items-center justify-center h-[120px] text-center">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <Activity className="text-gray-500" size={20} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">No trading activity yet</p>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 border-none shadow-lg bg-[#111827] rounded-3xl border border-gray-800">
                <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/bot-market">
                    <Button variant="ghost" className="w-full justify-start h-10 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl mb-2">
                      <Plus size={14} className="mr-2" />
                      New Investment
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start h-10 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold rounded-xl mb-2">
                    <ArrowUpFromLine size={14} className="mr-2" />
                    Withdraw Funds
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-10 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-xl mb-2">
                    <ArrowDownToLine size={14} className="mr-2" />
                    Deposit Funds
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-10 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold rounded-xl">
                    <LifeBuoy size={14} className="mr-2" />
                    Get Support
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
