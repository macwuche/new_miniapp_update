import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { 
  Coins, 
  Globe, 
  Building2, 
  ArrowRight, 
  TrendingUp,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMarkets() {
  const { toast } = useToast();
  const [marketStatus, setMarketStatus] = useState({
    crypto: true,
    forex: true,
    stocks: true
  });

  useEffect(() => {
    const savedStatus = localStorage.getItem("market_status");
    if (savedStatus) {
      setMarketStatus(JSON.parse(savedStatus));
    }
  }, []);

  const toggleMarket = (market: keyof typeof marketStatus) => {
    const newStatus = { ...marketStatus, [market]: !marketStatus[market] };
    setMarketStatus(newStatus);
    localStorage.setItem("market_status", JSON.stringify(newStatus));
    
    toast({
      title: "Market Status Updated",
      description: `${market.charAt(0).toUpperCase() + market.slice(1)} market is now ${newStatus[market] ? 'active' : 'disabled'}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Markets Overview</h1>
        <p className="text-gray-500 mt-2">Manage and monitor all trading assets and markets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Crypto Stats */}
        <Card className={`bg-gradient-to-br ${marketStatus.crypto ? 'from-blue-50 to-white border-blue-100' : 'from-gray-50 to-gray-100 border-gray-200 opacity-75'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${marketStatus.crypto ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                <Coins size={24} />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={marketStatus.crypto}
                  onCheckedChange={() => toggleMarket('crypto')}
                />
                <Badge className={marketStatus.crypto ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none" : "bg-gray-200 text-gray-600 border-none"}>
                  {marketStatus.crypto ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">1,240</h3>
            <p className="text-gray-500 text-sm mb-4">Cryptocurrencies</p>
            <Link href="/admin/cryptos">
              <Button variant="ghost" className={`w-full justify-between p-0 h-auto ${marketStatus.crypto ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}>
                Manage Cryptos <ArrowRight size={16} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Forex Stats */}
        <Card className={`bg-gradient-to-br ${marketStatus.forex ? 'from-green-50 to-white border-green-100' : 'from-gray-50 to-gray-100 border-gray-200 opacity-75'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${marketStatus.forex ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                <Globe size={24} />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={marketStatus.forex}
                  onCheckedChange={() => toggleMarket('forex')}
                />
                <Badge className={marketStatus.forex ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : "bg-gray-200 text-gray-600 border-none"}>
                  {marketStatus.forex ? 'Live' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">156</h3>
            <p className="text-gray-500 text-sm mb-4">Fiat Currencies</p>
            <Link href="/admin/forex">
              <Button variant="ghost" className={`w-full justify-between p-0 h-auto ${marketStatus.forex ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}>
                Manage Forex <ArrowRight size={16} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stocks Stats */}
        <Card className={`bg-gradient-to-br ${marketStatus.stocks ? 'from-purple-50 to-white border-purple-100' : 'from-gray-50 to-gray-100 border-gray-200 opacity-75'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${marketStatus.stocks ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                <Building2 size={24} />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={marketStatus.stocks}
                  onCheckedChange={() => toggleMarket('stocks')}
                />
                <Badge className={marketStatus.stocks ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-none" : "bg-gray-200 text-gray-600 border-none"}>
                  {marketStatus.stocks ? 'Market Open' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">4,890</h3>
            <p className="text-gray-500 text-sm mb-4">Stock Assets</p>
            <Link href="/admin/stocks">
              <Button variant="ghost" className={`w-full justify-between p-0 h-auto ${marketStatus.stocks ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}>
                Manage Stocks <ArrowRight size={16} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Market Status</CardTitle>
            <Activity size={20} className="text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Coins size={18} className={marketStatus.crypto ? "text-orange-500" : "text-gray-400"} />
                  <span className="font-medium text-gray-700">Crypto Market</span>
                </div>
                <Badge className={marketStatus.crypto ? "bg-green-500" : "bg-gray-400"}>
                  {marketStatus.crypto ? '24/7 Active' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe size={18} className={marketStatus.forex ? "text-blue-500" : "text-gray-400"} />
                  <span className="font-medium text-gray-700">Forex Market</span>
                </div>
                <Badge className={marketStatus.forex ? "bg-green-500" : "bg-gray-400"}>
                  {marketStatus.forex ? 'Open' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 size={18} className={marketStatus.stocks ? "text-purple-500" : "text-gray-400"} />
                  <span className="font-medium text-gray-700">Stock Market</span>
                </div>
                <Badge variant={marketStatus.stocks ? "secondary" : "outline"} className={marketStatus.stocks ? "text-gray-500" : "bg-gray-400 text-white border-none"}>
                  {marketStatus.stocks ? 'Closed' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Gainers (24h)</CardTitle>
            <TrendingUp size={20} className="text-green-500" />
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">BTC</div>
                  <div>
                    <div className="font-medium">Bitcoin</div>
                    <div className="text-xs text-gray-500">$65,432</div>
                  </div>
                </div>
                <span className="text-green-600 font-medium">+2.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">SOL</div>
                  <div>
                    <div className="font-medium">Solana</div>
                    <div className="text-xs text-gray-500">$145.20</div>
                  </div>
                </div>
                <span className="text-green-600 font-medium">+5.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">NFLX</div>
                  <div>
                    <div className="font-medium">Netflix</div>
                    <div className="text-xs text-gray-500">$615.00</div>
                  </div>
                </div>
                <span className="text-green-600 font-medium">+3.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
