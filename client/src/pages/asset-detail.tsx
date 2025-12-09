import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, MoreHorizontal, RefreshCw } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import aiLogo from "@assets/ai (1)_1764071986101.png";
import { usersAPI } from "@/lib/api";

const TIMEFRAMES = ["LIVE", "1D", "7D", "1M", "3M", "6M", "1Y"];

export default function AssetDetail() {
  const [match, params] = useRoute("/asset/:symbol");
  const rawSymbol = params?.symbol ? decodeURIComponent(params.symbol) : "BTC";
  
  // Handle pair display (e.g. BTC/USDT -> BTC)
  const displaySymbol = rawSymbol.includes('/') ? rawSymbol.split('/')[0] : rawSymbol;
  const pairSymbol = rawSymbol.includes('/') ? rawSymbol : `${rawSymbol}/USDT`;
  
  const [selectedTimeframe, setSelectedTimeframe] = useState("LIVE");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assetInfo, setAssetInfo] = useState<any>(null);
  
  // Register/fetch user from backend to check bot subscription status
  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register'],
    queryFn: async (): Promise<{ id: number } | null> => {
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const userData = tg.initDataUnsafe.user;
        return usersAPI.register({
          telegramId: userData.id.toString(),
          username: userData.username || userData.first_name,
          firstName: userData.first_name,
          lastName: userData.last_name,
          profilePicture: userData.photo_url
        }) as Promise<{ id: number }>;
      } else {
        return usersAPI.register({
          telegramId: null,
          username: "demo_user",
          firstName: "Demo",
          lastName: "User",
          profilePicture: null
        }) as Promise<{ id: number }>;
      }
    },
    staleTime: 1000 * 60,
  });

  // Fetch user's bot subscriptions to check if any bot is active
  const { data: userBots } = useQuery({
    queryKey: ['/api/user-bots', dbUser?.id],
    queryFn: async () => {
      if (!dbUser?.id) return [];
      const res = await fetch(`/api/users/${dbUser.id}/bots`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!dbUser?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Check if user has any active (not stopped) bot subscription
  const isBotActive = userBots?.some((ub: any) => 
    ub.status === 'active' && !ub.isStopped && new Date(ub.expiryDate) > new Date()
  ) ?? false;

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        // Get API URL from settings or default (using the 1-day default as requested)
        // Use environment variable for API key if available, otherwise fallback to demo key
        const apiKey = import.meta.env.VITE_COINGECKO_API_KEY || "CG-7Rc5Jh3xjgp1MT5J9vG5BsSk";
        const defaultApiUrl = `https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=1&x_cg_demo_api_key=${apiKey}`;
        
        const apiUrlTemplate = localStorage.getItem("chart_api_url") || defaultApiUrl;
        
        // Map symbol to CoinGecko ID
        // In a production app, you'd want a more robust mapping or search
        const symbolToId: Record<string, string> = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'SOL': 'solana',
          'XRP': 'ripple',
          'DOGE': 'dogecoin',
          'ADA': 'cardano',
          'AVAX': 'avalanche-2',
          'DOT': 'polkadot',
          'TRX': 'tron',
          'MATIC': 'matic-network',
          'LINK': 'chainlink',
          'TON': 'the-open-network',
          'SHIB': 'shiba-inu',
          'LTC': 'litecoin',
          'USDT': 'tether'
        };
        
        const coinId = symbolToId[displaySymbol.toUpperCase()] || displaySymbol.toLowerCase();
        
        // Fetch basic asset details separately (image, market cap, etc)
        // This is needed because market_chart doesn't return image or rank
        const detailsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&x_cg_demo_api_key=${apiKey}`;
        
        const detailsResponse = await fetch(detailsUrl);
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          if (detailsData && detailsData.length > 0) {
            const coinDetails = detailsData[0];
            setAssetInfo((prev: any) => ({
              ...prev,
              image: coinDetails.image,
              marketCap: coinDetails.market_cap,
              volume: coinDetails.total_volume,
              rank: coinDetails.market_cap_rank,
              high24h: coinDetails.high_24h,
              low24h: coinDetails.low_24h,
              price: coinDetails.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
              change: `${coinDetails.price_change_percentage_24h > 0 ? '+' : ''}${coinDetails.price_change_percentage_24h?.toFixed(2) || '0.00'}%`,
              isUp: coinDetails.price_change_percentage_24h > 0,
              name: coinDetails.name
            }));
          }
        }

        const apiUrl = apiUrlTemplate.replace('{id}', coinId);
        
        console.log(`Fetching chart data for ${displaySymbol} (${coinId}) from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("Failed to fetch chart data");
        
        const data = await response.json();
        
        if (!data.prices || !Array.isArray(data.prices)) {
          throw new Error("Invalid data format received from API");
        }
        
        // Transform CoinGecko [timestamp, price] format to chart format
        const prices = data.prices;
        const formattedData = prices.map((item: [number, number]) => ({
          time: new Date(item[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullTime: new Date(item[0]).toLocaleString(),
          value: item[1],
          originalTime: item[0]
        }));
        
        // Downsample for performance (take every Nth point)
        // For 1 day (5-min intervals = ~288 points), taking every 3rd point gives ~96 points
        const step = Math.max(1, Math.ceil(formattedData.length / 100));
        const downsampled = formattedData.filter((_: any, i: number) => i % step === 0);
        
        setChartData(downsampled);
        
        // Update asset info with chart data as fallback or supplementary
        if (prices.length > 0) {
          const latestPrice = prices[prices.length - 1][1];
          const firstPrice = prices[0][1];
          const change = ((latestPrice - firstPrice) / firstPrice) * 100;
          
          setAssetInfo((prev: any) => {
             // If we already have details from the markets endpoint, prefer that for current price/change
             // But ensure we have something set
             if (prev && prev.image) return prev;

             return {
              ...prev,
              price: latestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              change: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
              isUp: change > 0,
              name: displaySymbol === "BTC" ? "Bitcoin" : displaySymbol === "ETH" ? "Ethereum" : displaySymbol
            };
          });
        }
        
      } catch (error) {
        console.error("Error loading chart:", error);
        // Fallback mock data
        setChartData([
          { time: "10:00", value: 85800 },
          { time: "10:05", value: 85900 },
          { time: "10:10", value: 85750 },
          { time: "10:15", value: 85600 },
          { time: "10:20", value: 85700 },
          { time: "10:25", value: 85850 },
          { time: "10:30", value: 85800 },
          { time: "10:35", value: 86100 },
          { time: "10:40", value: 86300 },
          { time: "10:45", value: 86250 },
          { time: "10:50", value: 86401.25 },
        ]);
        
        setAssetInfo({
          price: "86,401.25",
          change: "+0.6%",
          isUp: true,
          name: displaySymbol
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [displaySymbol]);

  // Default info while loading or if API fails
  const currentAsset = assetInfo || {
    price: "Loading...",
    change: "0.00%",
    isUp: true,
    name: displaySymbol
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <Link href="/markets">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
              <ArrowLeft size={24} />
            </div>
          </Link>
          <div className="font-bold text-lg text-gray-900">{pairSymbol}</div>
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
            <MoreHorizontal size={24} className="text-gray-600" />
          </Button>
        </div>

        <div className="flex flex-col items-center pt-2 px-6">
          {/* Asset Icon */}
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-100 overflow-hidden p-2">
             {currentAsset.image ? (
               <img src={currentAsset.image} alt={currentAsset.name} className="w-full h-full object-contain" />
             ) : (
               <span className="text-gray-900 font-bold text-2xl">{displaySymbol[0]}</span>
             )}
          </div>

          {/* Price Info */}
          <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">
            {isLoading ? (
              <span className="animate-pulse bg-gray-200 rounded h-10 w-48 block"></span>
            ) : (
              `$${currentAsset.price}`
            )}
          </h1>
          <p className={`text-lg font-medium ${currentAsset.isUp ? "text-green-500" : "text-red-500"} mb-4`}>
            {currentAsset.name} {currentAsset.change}
          </p>

          {/* AI Trading Bot Indicator */}
          <Link href={`/asset/${encodeURIComponent(rawSymbol)}/bot-status`}>
            <div className="flex flex-col items-center cursor-pointer group">
              <div className={`w-12 h-12 transition-all duration-300 ${isBotActive ? 'grayscale-0 scale-110 drop-shadow-md animate-[bot-pulse_2s_ease-in-out_infinite]' : 'grayscale opacity-60 hover:opacity-80'}`}>
                <img src={aiLogo} alt="AI Trading" className="w-full h-full object-contain" />
              </div>
              <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full transition-colors ${isBotActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                AI {isBotActive ? "ON" : "OFF"}
              </span>
            </div>
          </Link>
        </div>

        {/* Chart Section */}
        <div className="h-[300px] w-full mt-8 mb-6 relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 animate-pulse">
              <RefreshCw className="animate-spin text-gray-300" size={32} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentAsset.isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={currentAsset.isUp ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#000' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                  labelFormatter={(label) => `${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={currentAsset.isUp ? "#22c55e" : "#ef4444"} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="px-4 mb-8">
          <div className="flex justify-between bg-gray-50 p-1 rounded-xl">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedTimeframe === tf 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Market Stats Section */}
        {currentAsset.marketCap && (
          <div className="px-6 mb-6 grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gray-50 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-medium text-gray-500 mb-1">Market Cap</p>
              <p className="text-sm font-bold text-gray-900">
                ${(currentAsset.marketCap / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })}B
              </p>
            </Card>
            <Card className="p-4 bg-gray-50 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-medium text-gray-500 mb-1">Volume (24h)</p>
              <p className="text-sm font-bold text-gray-900">
                ${(currentAsset.volume / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })}B
              </p>
            </Card>
            <Card className="p-4 bg-gray-50 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-medium text-gray-500 mb-1">High (24h)</p>
              <p className="text-sm font-bold text-gray-900">${currentAsset.high24h?.toLocaleString()}</p>
            </Card>
            <Card className="p-4 bg-gray-50 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-medium text-gray-500 mb-1">Low (24h)</p>
              <p className="text-sm font-bold text-gray-900">${currentAsset.low24h?.toLocaleString()}</p>
            </Card>
          </div>
        )}

        {/* Holdings Card */}
        <div className="px-6">
          <Card className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-200 border-none">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1 border-r border-gray-700">
                <p className="text-2xl font-bold text-yellow-400 mb-1">0.001775</p>
                <p className="text-sm font-medium text-gray-400">{displaySymbol}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white mb-1">$153.36</p>
                <p className="text-sm font-medium text-gray-400">Value</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}