import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Bot, Activity, Plus, ArrowDownToLine, ArrowUpFromLine, LifeBuoy, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BotInvestments() {
  // Simulated active investment state
  const hasInvestment = true;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-blue-800 to-blue-600 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div 
                  className="flex items-center text-blue-100 text-sm mb-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Bots
                </div>
                <h1 className="text-2xl font-black mb-2 tracking-tight">Bot Trading Dashboard</h1>
                <p className="text-blue-100 text-xs max-w-xs leading-relaxed">
                  Monitor and manage your automated trading investments
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <Activity className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row - Overlapping Header */}
        <div className="px-4 -mt-10 relative z-20 mb-6">
          <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
            <Card className="min-w-[140px] p-4 border-none shadow-lg shadow-gray-200/50 bg-white rounded-2xl snap-start">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Wallet size={16} />
              </div>
              <p className="text-lg font-black text-gray-900">$250.00</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Invested</p>
            </Card>

            <Card className="min-w-[140px] p-4 border-none shadow-lg shadow-gray-200/50 bg-white rounded-2xl snap-start">
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
                <TrendingUp size={16} />
              </div>
              <p className="text-lg font-black text-gray-900">$0.00</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Current Balance</p>
            </Card>

            <Card className="min-w-[140px] p-4 border-none shadow-lg shadow-gray-200/50 bg-white rounded-2xl snap-start">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ArrowUpFromLine size={16} />
              </div>
              <p className="text-lg font-black text-emerald-600">+$0.00</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Profit</p>
            </Card>

            <Card className="min-w-[140px] p-4 border-none shadow-lg shadow-gray-200/50 bg-white rounded-2xl snap-start">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <ArrowDownToLine size={16} />
              </div>
              <p className="text-lg font-black text-red-600">-$0.00</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Loss</p>
            </Card>

            <Card className="min-w-[140px] p-4 border-none shadow-lg shadow-gray-200/50 bg-white rounded-2xl snap-start">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Bot size={16} />
              </div>
              <p className="text-lg font-black text-gray-900">1</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Active Bots</p>
            </Card>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Your Investments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl min-h-[320px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-900">Your Investments</h2>
                <Link href="/bot-market">
                  <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-full px-4">
                    <Plus size={14} className="mr-1" />
                    New Investment
                  </Button>
                </Link>
              </div>

              {hasInvestment ? (
                <div className="w-full bg-gray-50 rounded-2xl p-5 mb-4 relative border border-gray-100">
                  <div className="absolute top-5 right-5">
                    <span className="text-xs font-bold text-gray-400">Cancelled</span>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md shrink-0">
                      <Bot size={24} />
                    </div>
                    <div className="pr-16">
                      <h3 className="font-bold text-gray-900 text-base mb-1">CryptoGain Elite</h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        High-performance cryptocurrency trading bot designed for the volatile crypto markets. Leverages machine learning to identify optimal entry and exit points across major cryptocurrencies.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 mb-1">Invested</p>
                      <p className="text-sm font-bold text-gray-900">$250.00</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 mb-1">Current Value</p>
                      <p className="text-sm font-bold text-gray-900">$250.00</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 mb-1">P&L</p>
                      <p className="text-sm font-bold text-emerald-500">+$0.00</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 mb-1">ROI</p>
                      <p className="text-sm font-bold text-emerald-500">+0.00%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200/60">
                    <p className="text-[10px] font-medium text-gray-400">Started: Nov 28, 2025</p>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg px-3">
                      <Eye size={12} className="mr-1.5" />
                      View
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bot className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">No Investments Yet</h3>
                  <p className="text-xs text-gray-400 max-w-[200px] mb-6">
                    Start your automated trading journey today
                  </p>
                  <Link href="/bot-market">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200">
                      <Plus size={16} className="mr-2" />
                      Start Investing
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className="p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl min-h-[200px]">
                <h2 className="text-sm font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="flex flex-col items-center justify-center h-[120px] text-center">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Activity className="text-gray-300" size={20} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">No trading activity yet</p>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/bot-market">
                    <Button variant="ghost" className="w-full justify-start h-10 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl mb-2">
                      <Plus size={14} className="mr-2" />
                      New Investment
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start h-10 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl mb-2">
                    <ArrowUpFromLine size={14} className="mr-2" />
                    Withdraw Funds
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl mb-2">
                    <ArrowDownToLine size={14} className="mr-2" />
                    Deposit Funds
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-10 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl">
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
