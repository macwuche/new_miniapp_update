import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRightLeft, ArrowUpRight, TrendingDown, Loader2 } from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";

interface PortfolioItem {
  id: number;
  userId: number;
  assetId: string;
  assetType: string;
  name: string;
  symbol: string;
  amount: string;
  averageBuyPrice: string;
  currentValue: string;
}

export default function PortfolioAssetAction() {
  const [match, params] = useRoute("/portfolio/:symbol");
  const [, setLocation] = useLocation();
  const symbol = params?.symbol?.toUpperCase() || "BTC";
  const { user } = useTelegram();

  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.id?.toString() || "123456789",
          username: user?.username || 'alextrader',
          firstName: user?.first_name || 'Alex',
          lastName: user?.last_name || 'Trader',
          profilePicture: user?.photo_url || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to register user');
      return res.json();
    },
    enabled: true,
    staleTime: 1000 * 60,
  });

  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery<PortfolioItem[]>({
    queryKey: [`/api/users/${dbUser?.id}/portfolio`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${dbUser?.id}/portfolio`);
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const asset = portfolio.find(p => p.symbol.toUpperCase() === symbol);
  
  const amount = parseFloat(asset?.amount || '0');
  const currentValue = parseFloat(asset?.currentValue || '0');
  const avgBuyPrice = parseFloat(asset?.averageBuyPrice || '0');

  if (portfolioLoading || !dbUser) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!asset) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 pb-24">
          <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Link href="/portfolio">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                  <ArrowLeft size={20} />
                </div>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Asset Not Found</h1>
            </div>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-500">You don't have any {symbol} in your portfolio.</p>
            <Link href="/trade">
              <Button className="mt-4">Go to Trade</Button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const handleSell = () => {
    setLocation(`/trade/${symbol.toLowerCase()}?action=sell`);
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/portfolio">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors" data-testid="button-back">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{asset.name} ({asset.symbol})</h1>
          </div>
        </div>

        <div className="p-6">
          <Card className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20 mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Your Holdings</p>
                <h2 className="text-3xl font-black tracking-tight" data-testid="text-holding-amount">
                  {amount.toFixed(6)} {asset.symbol}
                </h2>
                <p className="text-blue-200 text-sm font-medium mt-1" data-testid="text-holding-value">
                  ≈ ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-xl font-bold">
                {asset.symbol[0]}
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-blue-200">Avg. Buy Price</span>
                <span className="font-bold">${avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white border-none font-bold h-12 rounded-xl"
                onClick={handleSell}
                data-testid="button-sell"
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                Sell
              </Button>
              <Link href="/withdraw" className="w-full">
                <Button className="w-full bg-white text-primary hover:bg-blue-50 border-none font-bold h-12 rounded-xl shadow-sm">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </Link>
              <Link href={`/trade/${symbol.toLowerCase()}`} className="w-full">
                <Button 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-none font-bold h-12 rounded-xl backdrop-blur-md"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Trade
                </Button>
              </Link>
            </div>
          </Card>

          <h3 className="font-bold text-gray-900 text-lg mb-4">Asset Info</h3>
          <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Asset Type</span>
              <span className="font-bold text-gray-900 capitalize">{asset.assetType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Symbol</span>
              <span className="font-bold text-gray-900">{asset.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Held</span>
              <span className="font-bold text-gray-900">{amount.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Value</span>
              <span className="font-bold text-green-600">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
