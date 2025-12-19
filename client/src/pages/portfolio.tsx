import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Activity, ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, Wallet, RefreshCw, Plus } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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
  updatedAt: string;
}

interface AssetPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image?: string;
}


export default function Portfolio() {
  const { user } = useTelegram();
  const [assetPrices, setAssetPrices] = useState<Record<string, AssetPrice>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const { data: rawPortfolio = [], isLoading: portfolioLoading, refetch: refetchPortfolio } = useQuery<PortfolioItem[]>({
    queryKey: [`/api/users/${dbUser?.id}/portfolio`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${dbUser?.id}/portfolio`);
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const portfolio = rawPortfolio.filter(item => parseFloat(item.amount) > 0);

  const { data: balance } = useQuery({
    queryKey: [`/api/users/${dbUser?.id}/balance`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${dbUser?.id}/balance`);
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const fetchPrices = async () => {
    if (portfolio.length === 0) return;
    
    const cryptoSymbols = portfolio
      .filter(p => p.assetType === 'crypto')
      .map(p => p.assetId);
    
    if (cryptoSymbols.length === 0) return;

    try {
      const response = await fetch(
        `/api/crypto-prices?ids=${cryptoSymbols.join(',')}`
      );
      if (response.ok) {
        const data: AssetPrice[] = await response.json();
        const priceMap: Record<string, AssetPrice> = {};
        data.forEach(coin => {
          priceMap[coin.id] = coin;
        });
        setAssetPrices(priceMap);
      }
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
    }
  };

  useEffect(() => {
    if (portfolio.length > 0) {
      fetchPrices();
    }
  }, [rawPortfolio]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchPortfolio(), fetchPrices()]);
    setIsRefreshing(false);
  };

  const calculatePortfolioStats = () => {
    let totalValue = 0;
    let totalInvested = 0;

    portfolio.forEach(item => {
      const amount = parseFloat(item.amount);
      const avgPrice = parseFloat(item.averageBuyPrice);
      const price = assetPrices[item.assetId]?.current_price || parseFloat(item.currentValue) / amount || avgPrice;
      
      totalValue += amount * price;
      totalInvested += amount * avgPrice;
    });

    const totalProfit = totalValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, totalProfit, profitPercent };
  };

  const stats = calculatePortfolioStats();
  const availableBalance = parseFloat(balance?.availableBalanceUsd || '0');

  const getAssetDisplayData = (item: PortfolioItem) => {
    const priceData = assetPrices[item.assetId];
    const amount = parseFloat(item.amount);
    const avgPrice = parseFloat(item.averageBuyPrice);
    const currentPrice = priceData?.current_price || parseFloat(item.currentValue) / amount || avgPrice;
    const value = amount * currentPrice;
    const change = priceData?.price_change_percentage_24h || 0;
    const profitLoss = (currentPrice - avgPrice) * amount;
    const profitLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

    return {
      currentPrice,
      value,
      change,
      profitLoss,
      profitLossPercent,
      isUp: change >= 0,
      image: priceData?.image,
    };
  };

  if (portfolioLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        <div className="bg-primary text-white px-6 pt-10 pb-8 rounded-b-[2rem] shadow-lg shadow-blue-900/20">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Portfolio Value</p>
              <h1 className="text-4xl font-black tracking-tight" data-testid="text-total-value">
                ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className={`flex items-center gap-2 mt-2 w-fit px-2 py-1 rounded-lg backdrop-blur-sm ${stats.totalProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {stats.totalProfit >= 0 ? (
                  <ArrowUpRight size={16} className="text-green-300" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-300" />
                )}
                <span className={`text-sm font-medium ${stats.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({stats.profitPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/trade">
                <Button 
                  variant="ghost" 
                  className="bg-white/20 rounded-full px-3 py-2 text-sm font-medium"
                  data-testid="button-buy-assets"
                >
                  <Plus size={16} className="mr-1" />
                  Buy
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/20 rounded-full"
                onClick={handleRefresh}
                disabled={isRefreshing}
                data-testid="button-refresh"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-blue-100 text-xs mb-1">Invested</p>
              <p className="font-bold text-base" data-testid="text-invested">${stats.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-blue-100 text-xs mb-1">Profit/Loss</p>
              <p className={`font-bold text-base ${stats.totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`} data-testid="text-profit">
                {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-blue-100 text-xs mb-1">Available</p>
              <p className="font-bold text-base" data-testid="text-available">${availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="crypto" data-testid="tab-crypto">Crypto</TabsTrigger>
              <TabsTrigger value="stocks" data-testid="tab-stocks">Stocks</TabsTrigger>
              <TabsTrigger value="forex" data-testid="tab-forex">Forex</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {portfolio.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-2">
                  <Wallet className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No Assets Yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start trading to build your portfolio</p>
                  <Link href="/trade">
                    <Button data-testid="button-start-trading">Start Trading</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.map((item) => {
                    const displayData = getAssetDisplayData(item);
                    return (
                      <Link key={item.id} href={`/trade/${item.symbol}`}>
                        <Card className="p-4 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]" data-testid={`card-asset-${item.id}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              {displayData.image ? (
                                <img src={displayData.image} alt={item.name} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs">
                                  {item.symbol[0]}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.symbol.toUpperCase()} · {item.assetType}</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${displayData.isUp ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                              {displayData.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              {displayData.change >= 0 ? '+' : ''}{displayData.change.toFixed(2)}%
                            </div>
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Holdings</p>
                              <p className="font-bold text-gray-900 dark:text-white">{parseFloat(item.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })} {item.symbol.toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Value</p>
                              <p className="font-bold text-gray-900 dark:text-white text-lg">${displayData.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Avg. Price: </span>
                              <span className="font-medium">${parseFloat(item.averageBuyPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={displayData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                              <span className="font-medium">
                                {displayData.profitLoss >= 0 ? '+' : ''}${displayData.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4">
              {portfolio.filter(p => p.assetType === 'crypto').length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No crypto assets in your portfolio</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.filter(p => p.assetType === 'crypto').map((item) => {
                    const displayData = getAssetDisplayData(item);
                    return (
                      <Link key={item.id} href={`/trade/${item.symbol}`}>
                        <Card className="p-4 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid={`card-crypto-${item.id}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {displayData.image ? (
                                <img src={displayData.image} alt={item.name} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs">
                                  {item.symbol[0]}
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{item.symbol.toUpperCase()}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{parseFloat(item.amount).toFixed(4)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${displayData.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              <p className={`text-xs ${displayData.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                {displayData.change >= 0 ? '+' : ''}{displayData.change.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stocks" className="space-y-4">
              {portfolio.filter(p => p.assetType === 'stock').length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No stocks in your portfolio</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.filter(p => p.assetType === 'stock').map((item) => {
                    const displayData = getAssetDisplayData(item);
                    return (
                      <Link key={item.id} href={`/trade/${item.symbol}`}>
                        <Card className="p-4 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid={`card-stock-${item.id}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{item.symbol.toUpperCase()}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${displayData.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              <p className={`text-xs ${displayData.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                {displayData.change >= 0 ? '+' : ''}{displayData.change.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="forex" className="space-y-4">
              {portfolio.filter(p => p.assetType === 'forex').length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No forex pairs in your portfolio</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.filter(p => p.assetType === 'forex').map((item) => {
                    const displayData = getAssetDisplayData(item);
                    return (
                      <Link key={item.id} href={`/trade/${item.symbol}`}>
                        <Card className="p-4 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer" data-testid={`card-forex-${item.id}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{item.symbol.toUpperCase()}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${displayData.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
