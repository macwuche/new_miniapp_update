import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface AssetDetails {
  id: string;
  symbol: string;
  name: string;
  image: { large: string; small: string };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
  };
}

interface PriceHistory {
  prices: [number, number][];
}

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

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const SYMBOL_TO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
};

export default function AssetDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [, setLocation] = useLocation();
  const { user } = useTelegram();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for action query param to pre-select trade type
  const urlParams = new URLSearchParams(window.location.search);
  const actionParam = urlParams.get('action');
  const initialTradeType = actionParam === 'sell' ? 'sell' : 'buy';

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>(initialTradeType);
  const [amount, setAmount] = useState("");
  const [inputMode, setInputMode] = useState<'usd' | 'asset'>('usd');
  const [isTrading, setIsTrading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'1' | '7' | '30'>('7');

  const assetId = SYMBOL_TO_ID[symbol?.toUpperCase() || ''] || symbol?.toLowerCase();

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

  const { data: assetDetails, isLoading: detailsLoading } = useQuery<AssetDetails>({
    queryKey: ['asset-details', assetId],
    queryFn: async () => {
      const response = await fetch(`${COINGECKO_API}/coins/${assetId}?localization=false&tickers=false&community_data=false&developer_data=false`);
      if (!response.ok) throw new Error("Failed to fetch asset details");
      return response.json();
    },
    enabled: !!assetId,
  });

  const { data: priceHistory } = useQuery<PriceHistory>({
    queryKey: ['price-history', assetId, chartPeriod],
    queryFn: async () => {
      const response = await fetch(`${COINGECKO_API}/coins/${assetId}/market_chart?vs_currency=usd&days=${chartPeriod}`);
      if (!response.ok) throw new Error("Failed to fetch price history");
      return response.json();
    },
    enabled: !!assetId,
  });

  const { data: balance } = useQuery({
    queryKey: [`/api/users/${dbUser?.id}/balance`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${dbUser?.id}/balance`);
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const { data: portfolio = [] } = useQuery<PortfolioItem[]>({
    queryKey: [`/api/users/${dbUser?.id}/portfolio`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${dbUser?.id}/portfolio`);
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const userHolding = portfolio.find(p => p.symbol.toUpperCase() === symbol?.toUpperCase());
  const totalBalance = parseFloat(balance?.totalBalanceUsd || '0');
  const currentPrice = assetDetails?.market_data?.current_price?.usd || 0;
  const holdingAmount = parseFloat(userHolding?.amount || '0');

  const inputAmount = parseFloat(amount) || 0;
  const assetAmount = inputMode === 'usd' ? (currentPrice > 0 ? inputAmount / currentPrice : 0) : inputAmount;
  const usdValue = inputMode === 'usd' ? inputAmount : inputAmount * currentPrice;

  const chartData = priceHistory?.prices?.map(([timestamp, price]) => ({
    time: new Date(timestamp).toLocaleDateString(),
    price: price,
  })) || [];

  const handleTrade = async () => {
    if (!dbUser?.id) {
      toast({ title: "Loading", description: "Please wait while we load your account", variant: "destructive" });
      return;
    }

    if (!amount || inputAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (tradeType === 'buy' && usdValue > totalBalance) {
      toast({ 
        title: "Insufficient Balance", 
        description: "You need to top up before you can complete this transaction. Redirecting to deposit...", 
        variant: "destructive" 
      });
      setTimeout(() => {
        setLocation('/deposit');
      }, 1500);
      return;
    }

    if (tradeType === 'sell' && assetAmount > holdingAmount) {
      toast({ title: "Insufficient Holdings", description: "You don't have enough of this asset to sell", variant: "destructive" });
      return;
    }

    setIsTrading(true);
    try {
      const response = await fetch(`/api/users/${dbUser?.id}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tradeType,
          symbol: symbol?.toUpperCase(),
          amount: assetAmount.toString(),
          price: currentPrice.toString(),
          assetType: 'crypto',
          name: assetDetails?.name,
          assetId: assetId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Insufficient balance') {
          toast({ 
            title: "Insufficient Balance", 
            description: "You need to top up before you can complete this transaction. Redirecting to deposit...", 
            variant: "destructive" 
          });
          setTimeout(() => {
            setLocation('/deposit');
          }, 1500);
          return;
        }
        throw new Error(error.error || 'Trade failed');
      }

      await queryClient.invalidateQueries({ queryKey: [`/api/users/${dbUser?.id}/balance`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${dbUser?.id}/portfolio`] });

      toast({
        title: "Trade Successful",
        description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${assetAmount.toFixed(6)} ${symbol?.toUpperCase()} for $${usdValue.toFixed(2)}`,
      });

      setAmount("");
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleQuickAmount = (percentage: number) => {
    if (tradeType === 'buy') {
      if (inputMode === 'usd') {
        setAmount((totalBalance * percentage / 100).toFixed(2));
      } else {
        const maxBuyAmount = totalBalance / currentPrice;
        setAmount((maxBuyAmount * percentage / 100).toFixed(6));
      }
    } else {
      if (inputMode === 'usd') {
        const maxSellValue = holdingAmount * currentPrice;
        setAmount((maxSellValue * percentage / 100).toFixed(2));
      } else {
        setAmount((holdingAmount * percentage / 100).toFixed(6));
      }
    }
  };

  if (detailsLoading || !assetDetails) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const priceChange = assetDetails.market_data.price_change_percentage_24h;
  const isUp = priceChange >= 0;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white px-6 pt-8 pb-6 border-b sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/trade">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200" data-testid="button-back">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <img 
                src={assetDetails.image?.small} 
                alt={assetDetails.name} 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{assetDetails.name}</h1>
                <p className="text-sm text-gray-500">{assetDetails.symbol?.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900" data-testid="text-current-price">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </p>
              <div className={`flex items-center gap-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span className="font-medium">
                  {isUp ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                </span>
              </div>
            </div>
            {userHolding && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Your Holdings</p>
                <p className="font-bold text-gray-900">{holdingAmount.toFixed(6)} {symbol?.toUpperCase()}</p>
                <p className="text-sm text-gray-600">${(holdingAmount * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 mt-4">
          <div className="flex gap-2 mb-4">
            {(['1', '7', '30'] as const).map((period) => (
              <Button
                key={period}
                variant={chartPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setChartPeriod(period)}
                data-testid={`button-period-${period}`}
              >
                {period === '1' ? '24H' : period === '7' ? '7D' : '30D'}
              </Button>
            ))}
          </div>

          <Card className="p-4 mb-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isUp ? "#22c55e" : "#ef4444"} 
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-3">
              <p className="text-xs text-gray-500 mb-1">24h High</p>
              <p className="font-bold text-green-600">${assetDetails.market_data.high_24h?.usd?.toLocaleString()}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-gray-500 mb-1">24h Low</p>
              <p className="font-bold text-red-600">${assetDetails.market_data.low_24h?.usd?.toLocaleString()}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-gray-500 mb-1">Market Cap</p>
              <p className="font-bold">${(assetDetails.market_data.market_cap?.usd / 1e9).toFixed(2)}B</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-gray-500 mb-1">24h Volume</p>
              <p className="font-bold">${(assetDetails.market_data.total_volume?.usd / 1e9).toFixed(2)}B</p>
            </Card>
          </div>

          <Card className="p-4">
            <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white" data-testid="tab-buy">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white" data-testid="tab-sell">
                  Sell
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-gray-500">
                      Amount ({inputMode === 'usd' ? 'USD' : symbol?.toUpperCase()})
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => {
                        setInputMode(inputMode === 'usd' ? 'asset' : 'usd');
                        setAmount('');
                      }}
                      data-testid="button-toggle-input-mode"
                    >
                      Switch to {inputMode === 'usd' ? symbol?.toUpperCase() : 'USD'}
                    </Button>
                  </div>
                  <div className="relative">
                    {inputMode === 'usd' && (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`text-lg ${inputMode === 'usd' ? 'pl-9' : ''}`}
                      data-testid="input-amount"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleQuickAmount(pct)}
                        data-testid={`button-pct-${pct}`}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium">${currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{inputMode === 'usd' ? 'You Get' : 'Total USD'}</span>
                    <span className="font-bold text-primary">
                      {inputMode === 'usd' 
                        ? `${assetAmount.toFixed(6)} ${symbol?.toUpperCase()}`
                        : `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }
                    </span>
                  </div>
                  {tradeType === 'buy' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Available</span>
                      <span>${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {tradeType === 'sell' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Holdings</span>
                      <span>{holdingAmount.toFixed(6)} {symbol?.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                <Button
                  className={`w-full ${tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                  onClick={handleTrade}
                  disabled={isTrading || !amount || parseFloat(amount) <= 0}
                  data-testid="button-execute-trade"
                >
                  {isTrading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol?.toUpperCase()}
                </Button>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
