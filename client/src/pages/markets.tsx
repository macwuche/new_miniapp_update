import { MobileLayout } from "@/components/layout/mobile-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, Bitcoin, TrendingUp, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const MARKET_DATA = {
  crypto: [
    { name: "Bitcoin", symbol: "BTC/USDT", price: "86,401.25", change: "+0.6%", isUp: true },
    { name: "Ethereum", symbol: "ETH/USDT", price: "3,421.20", change: "-0.8%", isUp: false },
    { name: "Solana", symbol: "SOL/USDT", price: "145.30", change: "+5.2%", isUp: true },
    { name: "Ripple", symbol: "XRP/USDT", price: "1.20", change: "-1.2%", isUp: false },
    { name: "ETH/SOL", symbol: "ETH/SOL", price: "23.54", change: "+1.1%", isUp: true },
  ],
  stocks: [
    { name: "Apple Inc.", symbol: "AAPL", price: "182.50", change: "+0.5%", isUp: true },
    { name: "Tesla Inc.", symbol: "TSLA", price: "245.30", change: "+1.2%", isUp: true },
    { name: "NVIDIA", symbol: "NVDA", price: "890.00", change: "+3.1%", isUp: true },
    { name: "Microsoft", symbol: "MSFT", price: "415.20", change: "-0.2%", isUp: false },
  ],
  forex: [
    { name: "EUR/USD", symbol: "EUR", price: "1.0845", change: "+0.1%", isUp: true },
    { name: "GBP/USD", symbol: "GBP", price: "1.2650", change: "-0.3%", isUp: false },
    { name: "USD/JPY", symbol: "JPY", price: "151.20", change: "+0.4%", isUp: true },
  ]
};

export default function Markets() {
  return (
    <MobileLayout>
      <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-2xl font-bold mb-4">Markets</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search assets..." 
            className="pl-10 bg-gray-50 border-none h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="px-6 py-6">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="w-full bg-gray-100/80 p-1.5 rounded-2xl mb-8 h-14 flex gap-1">
            <TabsTrigger 
              value="crypto" 
              className="rounded-xl flex-1 h-full text-sm font-bold text-gray-500 
                hover:bg-white hover:text-yellow-600
                data-[state=active]:bg-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-md 
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Bitcoin size={18} strokeWidth={2.5} />
              Crypto
            </TabsTrigger>
            <TabsTrigger 
              value="stocks" 
              className="rounded-xl flex-1 h-full text-sm font-bold text-gray-500 
                hover:bg-white hover:text-[#fe3f26]
                data-[state=active]:bg-[#fe3f26] data-[state=active]:text-white data-[state=active]:shadow-md 
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} strokeWidth={2.5} />
              Stocks
            </TabsTrigger>
            <TabsTrigger 
              value="forex" 
              className="rounded-xl flex-1 h-full text-sm font-bold text-gray-500 
                hover:bg-white hover:text-[#08937b]
                data-[state=active]:bg-[#08937b] data-[state=active]:text-white data-[state=active]:shadow-md 
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              <DollarSign size={18} strokeWidth={2.5} />
              Forex
            </TabsTrigger>
          </TabsList>

          {Object.entries(MARKET_DATA).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              {items.map((asset) => (
                <Link key={asset.symbol} href={`/asset/${asset.symbol}`}>
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all mb-3 cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-900 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center font-black text-sm transition-colors">
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{asset.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-base">${asset.price}</p>
                        <p className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${asset.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {asset.change}
                        </p>
                      </div>
                      <button className="text-gray-300 hover:text-yellow-400 transition-colors" onClick={(e) => e.preventDefault()}>
                        <Star size={20} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MobileLayout>
  );
}
