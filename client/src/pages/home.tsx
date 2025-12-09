import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import generatedImage from "@assets/generated_images/Abstract_trading_chart_background_with_blue_waves_f608156d.png";
import aiLogo from "@assets/ai (1)_1764071986101.png";
import { usersAPI, balanceAPI } from "@/lib/api";

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
  const [tgUser, setTgUser] = useState<any>(null);
  
  // Default/Browser user state
  const defaultUser = {
    id: 0,
    first_name: "demo1",
    last_name: "demo2",
    username: "unknown user",
    language_code: "English",
    is_premium: false,
    photo_url: "" 
  };

  const user = tgUser || defaultUser;

  const [marketStatus, setMarketStatus] = useState({
    crypto: true,
    forex: true,
    stocks: true
  });

  // Initialize Telegram WebApp
  useEffect(() => {
    const savedStatus = localStorage.getItem("market_status");
    if (savedStatus) {
      setMarketStatus(JSON.parse(savedStatus));
    }

    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe?.user) {
        const userData = tg.initDataUnsafe.user;
        setTgUser({
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          language_code: userData.language_code,
          photo_url: userData.photo_url,
          is_premium: userData.is_premium
        });

        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  }, []);

  // Register/fetch user from backend using React Query - refreshes on window focus
  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register', tgUser?.id],
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
    staleTime: 1000 * 60, // Consider fresh for 1 minute
    refetchOnWindowFocus: true,
  });

  // Fetch user balance using React Query - auto refreshes on navigation/focus
  const { data: userBalance } = useQuery({
    queryKey: ['/api/balances', dbUser?.id],
    queryFn: async (): Promise<{ totalBalanceUsd?: string; availableBalanceUsd?: string } | null> => {
      if (!dbUser?.id) return null;
      return balanceAPI.getUser(dbUser.id) as Promise<{ totalBalanceUsd?: string; availableBalanceUsd?: string }>;
    },
    enabled: !!dbUser?.id,
    staleTime: 0, // Always refetch when query becomes active
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Refetch when component mounts
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
    refetchOnMount: true,
  });

  // Check if user has any active (not stopped) bot subscription
  const hasActiveBotSubscription = userBots?.some((ub: any) => 
    ub.status === 'active' && !ub.isStopped && new Date(ub.expiryDate) > new Date()
  ) ?? false;

  // Fetch popular assets from API
  const [featuredAssets, setFeaturedAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!marketStatus.crypto) {
        setFeaturedAssets([]);
        setIsLoadingAssets(false);
        return;
      }

      try {
        setIsLoadingAssets(true);
        const apiUrl = localStorage.getItem("crypto_api_url") || "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_desc&per_page=5&page=1&x_cg_demo_api_key=CG-7Rc5Jh3xjgp1MT5J9vG5BsSk";
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        // Transform data for display (take top 5)
        const transformed = data.slice(0, 5).map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: `${coin.price_change_percentage_24h > 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`,
          isUp: coin.price_change_percentage_24h > 0,
          image: coin.image,
          marketCap: coin.market_cap,
          // Generate mock history for sparkline based on price change
          history: Array.from({ length: 10 }, () => coin.current_price * (1 + (Math.random() * 0.1 - 0.05))),
          type: 'crypto'
        }));

        setFeaturedAssets(transformed);
      } catch (error) {
        console.error("Error fetching crypto assets:", error);
        // Fallback to mock data if API fails
        setFeaturedAssets([
          { name: "Bitcoin", symbol: "BTC", price: "94,321.50", change: "+2.4%", isUp: true, history: [40, 45, 42, 48, 46, 55, 52, 58], type: 'crypto', image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
          { name: "Ethereum", symbol: "ETH", price: "3,421.20", change: "-0.8%", isUp: false, history: [60, 58, 55, 57, 54, 52, 50, 53], type: 'crypto', image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
        ]);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [marketStatus]);

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
            <div className={`backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${tgUser ? 'bg-green-500/20 border-green-200/30 text-green-50' : 'bg-white/20 border-white/20'}`}>
              {tgUser ? "Verified" : "Unverified"}
            </div>
          </div>

          <div className="text-center py-4 relative">
            <div className="flex flex-col items-center justify-center mb-8">
              <p className="text-blue-100 text-sm mb-1 font-medium">Total Balance</p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">
                  ${userBalance ? parseFloat(userBalance.totalBalanceUsd || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </h2>
                <Link href="/markets">
                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className={`w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm p-2 border border-white/30 shadow-lg transition-all duration-300 group-hover:scale-105 ${!hasActiveBotSubscription ? 'grayscale opacity-80' : 'animate-[bot-pulse_2s_ease-in-out_infinite]'}`}>
                      <img src={aiLogo} alt="AI" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-100 mt-1 tracking-wide">AI Bot</span>
                  </div>
                </Link>
              </div>
            </div>
            
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
              <Link href="/bot-market">
                <button className="w-full group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/10 active:scale-95">
                  <div className="p-2.5 bg-white text-primary rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium">Buy Bot</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Assets */}
      <div className="px-6 mb-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Popular Assets</h3>
          <span className="text-primary text-sm font-medium cursor-pointer hover:opacity-80">See All</span>
        </div>

        <div className="flex flex-col gap-3">
          {isLoadingAssets ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : featuredAssets.length > 0 ? (
            featuredAssets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-100 p-1">
                    {asset.image ? (
                      <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-900 font-black text-sm">{asset.symbol[0]}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{asset.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{asset.symbol}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block opacity-50 w-16">
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No featured assets available
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
