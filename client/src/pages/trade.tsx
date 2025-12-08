import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const POPULAR_CRYPTOS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 
  'ripple', 'cardano', 'dogecoin', 'polkadot', 'avalanche-2'
];

export default function Trade() {
  const { user } = useTelegram();
  const userId = user?.id || 4;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cryptoAssets = [], isLoading } = useQuery<MarketAsset[]>({
    queryKey: ['crypto-markets'],
    queryFn: async () => {
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${POPULAR_CRYPTOS.join(',')}&order=market_cap_desc&sparkline=false`
      );
      if (!response.ok) throw new Error("Failed to fetch markets");
      return response.json();
    },
    staleTime: 30000,
  });

  const { data: balance } = useQuery({
    queryKey: [`/api/users/${userId}/balance`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/balance`);
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
  });

  const availableBalance = parseFloat(balance?.availableBalanceUsd || '0');

  const filteredAssets = searchQuery
    ? cryptoAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cryptoAssets;

  const topGainers = [...cryptoAssets]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const topLosers = [...cryptoAssets]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white px-6 pt-10 pb-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trade</h1>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-xl font-bold text-primary" data-testid="text-available-balance">
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Link href="/deposit">
              <Button size="sm" data-testid="button-deposit">
                Add Funds
              </Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search cryptocurrencies..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="px-6 mt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="gainers" data-testid="tab-gainers">
                <TrendingUp className="w-3 h-3 mr-1" />
                Gainers
              </TabsTrigger>
              <TabsTrigger value="losers" data-testid="tab-losers">
                <TrendingDown className="w-3 h-3 mr-1" />
                Losers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {filteredAssets.map((asset) => (
                <Link key={asset.id} href={`/trade/${asset.symbol.toUpperCase()}`}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer" data-testid={`card-asset-${asset.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={asset.image} alt={asset.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{asset.name}</h4>
                          <p className="text-xs text-gray-500">{asset.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </p>
                          <div className={`flex items-center justify-end gap-1 text-xs font-medium ${asset.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {asset.price_change_percentage_24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {asset.price_change_percentage_24h >= 0 ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="gainers" className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">Top performing assets (24h)</p>
              {topGainers.map((asset, index) => (
                <Link key={asset.id} href={`/trade/${asset.symbol.toUpperCase()}`}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500" data-testid={`card-gainer-${asset.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                          {index + 1}
                        </div>
                        <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{asset.symbol.toUpperCase()}</h4>
                          <p className="text-xs text-gray-500">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${asset.current_price.toLocaleString()}</p>
                        <p className="text-sm font-bold text-green-600">+{asset.price_change_percentage_24h.toFixed(2)}%</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="losers" className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">Worst performing assets (24h)</p>
              {topLosers.map((asset, index) => (
                <Link key={asset.id} href={`/trade/${asset.symbol.toUpperCase()}`}>
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-red-500" data-testid={`card-loser-${asset.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                          {index + 1}
                        </div>
                        <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{asset.symbol.toUpperCase()}</h4>
                          <p className="text-xs text-gray-500">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${asset.current_price.toLocaleString()}</p>
                        <p className="text-sm font-bold text-red-600">{asset.price_change_percentage_24h.toFixed(2)}%</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
