import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

const ASSETS = [
  { name: "Bitcoin", symbol: "BTC", amount: 0.45, value: 38880.56, change: "+2.4%", isUp: true },
  { name: "Ethereum", symbol: "ETH", amount: 12.5, value: 42765.00, change: "-0.8%", isUp: false },
  { name: "Tether", symbol: "USDT", amount: 12450.00, value: 12450.00, change: "0.0%", isUp: true },
  { name: "Solana", symbol: "SOL", amount: 145.2, value: 21054.00, change: "+5.2%", isUp: true },
  { name: "Cardano", symbol: "ADA", amount: 4500.0, value: 2700.00, change: "-1.2%", isUp: false },
  { name: "Polkadot", symbol: "DOT", amount: 2300.0, value: 16100.00, change: "+1.5%", isUp: true },
];

export default function Portfolio() {
  const { user } = useTelegram();

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header Section */}
        <div className="bg-primary text-white px-6 pt-10 pb-8 rounded-b-[2rem] shadow-lg shadow-blue-900/20">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Portfolio Value</p>
              <h1 className="text-4xl font-black tracking-tight">$133,949.56</h1>
              <div className="flex items-center gap-2 mt-2 bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                <ArrowUpRight size={16} className="text-green-300" />
                <span className="text-sm font-medium text-green-300">+$2,450.23 (1.8%)</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <PieChart size={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-blue-100 text-xs mb-1">Invested</p>
              <p className="font-bold text-lg">$85,000.00</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-blue-100 text-xs mb-1">Total Profit</p>
              <p className="font-bold text-lg text-green-300">+$48,949.56</p>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Your Assets
          </h3>

          {/* Desktop Grid / Mobile List Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSETS.map((asset) => (
              <Card key={asset.symbol} className="p-4 border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{asset.name}</h4>
                      <p className="text-xs text-gray-500">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${asset.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {asset.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {asset.change}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Balance</p>
                    <p className="font-bold text-gray-900">{asset.amount} {asset.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Value</p>
                    <p className="font-bold text-gray-900 text-lg">${asset.value.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
