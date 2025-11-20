import { MobileLayout } from "@/components/layout/mobile-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

const MARKET_DATA = {
  crypto: [
    { name: "Bitcoin", symbol: "BTC", price: "94,321.50", change: "+2.4%", isUp: true },
    { name: "Ethereum", symbol: "ETH", price: "3,421.20", change: "-0.8%", isUp: false },
    { name: "Solana", symbol: "SOL", price: "145.30", change: "+5.2%", isUp: true },
    { name: "Ripple", symbol: "XRP", price: "1.20", change: "-1.2%", isUp: false },
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
          <TabsList className="w-full bg-gray-100 p-1 rounded-xl mb-6 h-10">
            <TabsTrigger value="crypto" className="rounded-lg flex-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Crypto</TabsTrigger>
            <TabsTrigger value="stocks" className="rounded-lg flex-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Stocks</TabsTrigger>
            <TabsTrigger value="forex" className="rounded-lg flex-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Forex</TabsTrigger>
          </TabsList>

          {Object.entries(MARKET_DATA).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-0">
              {items.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{asset.name}</h4>
                      <p className="text-xs text-gray-500">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${asset.price}</p>
                      <p className={`text-xs font-medium ${asset.isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.change}
                      </p>
                    </div>
                    <button className="text-gray-300 hover:text-yellow-400">
                      <Star size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MobileLayout>
  );
}
