import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, ArrowUpRight, DollarSign, Bitcoin } from "lucide-react";
import { Link } from "wouter";
import generatedImage from "@assets/generated_images/Abstract_trading_chart_background_with_blue_waves_f608156d.png";

// Simple Sparkline Component
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 60;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Home() {
  const { user } = useTelegram();

  return (
    <MobileLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary text-white rounded-b-[2rem] pb-8 shadow-lg shadow-blue-900/20">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url(${generatedImage})` }}
        />
        
        <div className="relative px-6 pt-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30 shadow-inner">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                    {user?.first_name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-blue-100 text-xs font-medium">Welcome back</p>
                <h1 className="text-lg font-bold">{user?.first_name || "Trader"}</h1>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/20 shadow-sm">
              Verified
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-blue-100 text-sm mb-1 font-medium">Total Balance</p>
            <h2 className="text-4xl font-black tracking-tight mb-8 drop-shadow-sm">$12,450.00</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <Link href="/deposit">
                <button className="w-full group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                  <div className="p-2.5 bg-white text-primary rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <Wallet size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium">Deposit</span>
                </button>
              </Link>
              <Link href="/withdraw">
                <button className="w-full group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                  <div className="p-2.5 bg-white text-primary rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <ArrowUpRight size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium">Withdraw</span>
                </button>
              </Link>
              <Link href="/trade">
                <button className="w-full group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                  <div className="p-2.5 bg-white text-primary rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium">Trade</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Inline Keyboard Simulation */}
      <div className="px-4 -mt-6 relative z-10 mb-8">
        <Card className="p-4 shadow-xl shadow-gray-200/50 border-none bg-white/95 backdrop-blur-xl rounded-2xl">
          <div className="flex flex-col gap-3">
            <Link href="/trade">
              <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-transform active:scale-[0.99]">
                Trade Now
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/connect-wallet">
                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold hover:border-gray-300">
                  Connect Wallet
                </Button>
              </Link>
              <Button variant="outline" className="h-12 rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold hover:border-gray-300">
                Investment Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Assets */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Popular Assets</h3>
          <span className="text-primary text-sm font-medium cursor-pointer hover:opacity-80">See All</span>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { name: "Bitcoin", symbol: "BTC", price: "94,321.50", change: "+2.4%", isUp: true, history: [40, 45, 42, 48, 46, 55, 52, 58] },
            { name: "Ethereum", symbol: "ETH", price: "3,421.20", change: "-0.8%", isUp: false, history: [60, 58, 55, 57, 54, 52, 50, 53] },
            { name: "Tesla Inc", symbol: "TSLA", price: "245.30", change: "+1.2%", isUp: true, history: [30, 32, 35, 34, 38, 36, 40, 42] },
          ].map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 font-black text-sm border border-gray-100">
                  {asset.symbol[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{asset.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{asset.symbol}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:block opacity-50">
                   <Sparkline data={asset.history} color={asset.isUp ? '#22c55e' : '#ef4444'} />
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-base">${asset.price}</p>
                  <p className={`text-xs font-bold ${asset.isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
