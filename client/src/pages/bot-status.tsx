import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Activity, Cpu, Settings, ShoppingCart } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import aiLogo from "@assets/ai (1)_1764071986101.png";
import { usersAPI } from "@/lib/api";

export default function BotStatus() {
  const [match, params] = useRoute("/asset/:symbol/bot-status");
  const symbol = params?.symbol ? decodeURIComponent(params.symbol) : "BTC";
  
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
        // Use consistent mock user data to match existing deposits/balances
        return usersAPI.register({
          telegramId: "123456789",
          username: "alextrader",
          firstName: "Alex",
          lastName: "Trader",
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
  const isActive = userBots?.some((ub: any) => 
    ub.status === 'active' && !ub.isStopped && new Date(ub.expiryDate) > new Date()
  ) ?? false;

  // Calculate total profit from all active bots
  const totalProfit = userBots?.filter((ub: any) => 
    ub.status === 'active' && !ub.isStopped && new Date(ub.expiryDate) > new Date()
  ).reduce((sum: number, ub: any) => sum + parseFloat(ub.currentProfit || '0'), 0) ?? 0;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/asset/${encodeURIComponent(symbol)}`}>
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Trading Bot</h1>
          </div>
          
          <Link href="/bot-market">
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
              <ShoppingCart size={24} />
            </Button>
          </Link>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Status Card */}
          <Card className="w-full p-6 rounded-2xl border-none shadow-lg bg-white dark:bg-gray-800 mb-6 flex flex-col items-center">
            <div className={`w-32 h-32 mb-6 transition-all duration-500 ${isActive ? 'grayscale-0 scale-105 animate-[bot-pulse_2s_ease-in-out_infinite]' : 'grayscale opacity-70'}`}>
              <img src={aiLogo} alt="AI Trading Bot" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isActive ? "Bot is Active" : "Bot is Offline"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                {isActive 
                  ? `AI is currently analyzing and trading ${symbol} pairs automatically.` 
                  : `Activate the AI bot to start automated trading for ${symbol}.`}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                  Status: {isActive ? "RUNNING" : "STOPPED"}
                </span>
              </div>
              
              <Link href="/bot-investments">
                <Button size="sm" variant="outline" className="h-9 rounded-full text-xs font-bold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                  My Bot Investments
                </Button>
              </Link>
            </div>
          </Card>

          {/* Stats / Info (Placeholder) */}
          <div className="w-full grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-3">
                <Activity size={20} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Profit</p>
              <p className={`text-lg font-bold ${totalProfit > 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                {isActive ? `+$${totalProfit.toFixed(2)}` : "---"}
              </p>
            </Card>
            <Card className="p-4 border-none shadow-sm bg-white dark:bg-gray-800 rounded-2xl">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3">
                <Cpu size={20} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Algorithm</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">HFT-v4</p>
            </Card>
          </div>

          {/* Control (Admin Controlled Message) */}
          <Card className="w-full p-5 bg-blue-50 border-blue-100 dark:border-gray-700 rounded-2xl">
            <div className="flex gap-3">
              <Settings className="text-blue-600 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Configuration</h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Bot trading parameters and activation are managed by the platform administrator. Contact support to change your trading limits.
                </p>
              </div>
            </div>
          </Card>
          
          {/* Action Buttons */}
          <div className="w-full mt-6 flex gap-3">
            <Link href="/bot-market" className="flex-1">
              <Button 
                className="w-full h-14 text-base font-bold rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              >
                Buy trading bot
              </Button>
            </Link>

            <Link href="/bot-investments" className="flex-1">
              <Button 
                className={`w-full h-14 text-base font-bold rounded-xl shadow-lg transition-all ${
                  isActive 
                    ? 'bg-green-50 text-green-600 hover:bg-green-100 shadow-green-100' 
                    : 'bg-primary text-white hover:bg-primary/90 shadow-blue-200'
                }`}
              >
                <Activity className="mr-2" size={20} strokeWidth={2.5} />
                {isActive ? "Manage Bots" : "View Bots"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
