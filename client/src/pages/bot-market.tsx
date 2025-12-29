import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, TrendingUp, BarChart3, Activity, Loader2, Bot, Clock, DollarSign, Wallet } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface TradingAssetInfo {
  id: string;
  name: string;
  symbol: string;
  logoUrl?: string;
}

interface AiBot {
  id: number;
  name: string;
  description: string;
  price: string;
  durationDays: number;
  durationUnit: string;
  expectedRoi: string;
  minInvestment: string;
  maxInvestment: string;
  minProfitPercent: string;
  maxProfitPercent: string;
  totalGains: string;
  totalLosses: string;
  winRate: string;
  logo: string | null;
  isActive: boolean;
  category: 'crypto' | 'forex' | 'stock';
  subscriptionFee: string;
  tradingAssets: TradingAssetInfo[] | string[];
  assetDistribution: Record<string, number>;
}

export default function BotMarket() {
  const { user } = useTelegram();
  const queryClient = useQueryClient();
  const [selectedBot, setSelectedBot] = useState<AiBot | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const { data: bots = [], isLoading: botsLoading } = useQuery<AiBot[]>({
    queryKey: ['/api/bots'],
    queryFn: async () => {
      const res = await fetch('/api/bots');
      if (!res.ok) throw new Error('Failed to fetch bots');
      return res.json();
    },
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

  const subscribeMutation = useMutation({
    mutationFn: async (data: { userId: number; botId: number; investmentAmount: string }) => {
      const res = await fetch('/api/user-bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to subscribe');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription successful!",
        description: `You have successfully subscribed to ${selectedBot?.name}. The bot is now active.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${dbUser?.id}/balance`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${dbUser?.id}/bots`] });
      setIsSheetOpen(false);
      setSelectedBot(null);
      setInvestmentAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeBots = bots.filter(bot => bot.isActive);

  const handleBotClick = (bot: AiBot) => {
    setSelectedBot(bot);
    setInvestmentAmount(bot.minInvestment);
    setIsSheetOpen(true);
  };

  const handleSubscribe = () => {
    if (!dbUser?.id || !selectedBot) return;

    subscribeMutation.mutate({
      userId: dbUser.id,
      botId: selectedBot.id,
      investmentAmount: investmentAmount,
    });
  };

  const availableBalance = parseFloat(balance?.availableBalanceUsd || balance?.totalBalanceUsd || '0');
  const investmentNum = parseFloat(investmentAmount) || 0;
  const subscriptionFee = selectedBot ? parseFloat(selectedBot.subscriptionFee) : 0;
  const totalCost = subscriptionFee + investmentNum;
  const hasInsufficientBalance = totalCost > availableBalance;
  
  const minInv = selectedBot ? parseFloat(selectedBot.minInvestment) : 0;
  const maxInv = selectedBot ? parseFloat(selectedBot.maxInvestment) : 0;
  const isInvestmentValid = investmentNum >= minInv && investmentNum <= maxInv;
  const sliderPercentage = maxInv > 0 ? Math.round((investmentNum / maxInv) * 100) : 0;

  if (botsLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
        <div 
          className="pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(to bottom, #2563eb, #3b82f6)',
            color: 'white'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl pointer-events-none" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                <ArrowLeft size={20} />
              </div>
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                style={{ 
                  backgroundColor: 'rgba(74, 222, 128, 0.2)', 
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  color: '#dcfce7'
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4ade80' }}></div>
                AI-Powered Trading
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-3 tracking-tight" style={{ color: 'white' }} data-testid="text-page-title">Bot Trading Hub</h1>
              <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: '#bfdbfe' }}>
                Invest in AI-powered trading bots that work 24/7 to maximize your profits across multiple markets.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button 
                  className="border-none rounded-xl font-bold shadow-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  data-testid="button-dashboard"
                >
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/bot-investments">
                <Button 
                  className="border-none rounded-xl font-bold shadow-sm"
                  style={{ backgroundColor: 'white', color: '#2563eb' }}
                  data-testid="button-my-investments"
                >
                  <Activity size={16} className="mr-2" />
                  My Bot Investments
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 pt-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-section-title">Available Trading Bots</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose from our AI-powered trading bots</p>
          </div>

          {activeBots.length === 0 ? (
            <Card className="p-8 text-center border-none shadow-sm bg-white dark:bg-slate-800">
              <Bot className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Bots Available</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Check back later for new trading bots.</p>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full flex overflow-x-auto no-scrollbar justify-start gap-2 bg-transparent h-auto p-0 mb-6">
                <TabsTrigger 
                  value="all" 
                  className="rounded-full px-5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
                  data-testid="tab-all"
                >
                  All Bots
                </TabsTrigger>
                <TabsTrigger 
                  value="forex" 
                  className="rounded-full px-5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
                  data-testid="tab-forex"
                >
                  Forex
                </TabsTrigger>
                <TabsTrigger 
                  value="crypto" 
                  className="rounded-full px-5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
                  data-testid="tab-crypto"
                >
                  Crypto
                </TabsTrigger>
                <TabsTrigger 
                  value="stock" 
                  className="rounded-full px-5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
                  data-testid="tab-stock"
                >
                  Stocks
                </TabsTrigger>
              </TabsList>

              {["all", "forex", "crypto", "stock"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activeBots
                      .filter(b => tab === "all" || b.category === tab)
                      .map((bot) => {
                        return (
                          <Card 
                            key={bot.id} 
                            className="p-5 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white dark:bg-slate-800 overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleBotClick(bot)}
                            data-testid={`card-bot-${bot.id}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-3">
                                <Avatar className={`w-12 h-12 rounded-xl shadow-md ${
                                  bot.category === 'forex' ? 'bg-blue-500' : 
                                  bot.category === 'crypto' ? 'bg-purple-500' : 'bg-orange-500'
                                }`}>
                                  {bot.logo ? (
                                    <AvatarImage src={bot.logo} alt={bot.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-transparent text-white">
                                    <BarChart3 size={24} strokeWidth={2.5} />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-gray-900 dark:text-white text-lg" data-testid={`text-bot-name-${bot.id}`}>{bot.name}</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">{bot.category} Trading</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800 px-2 py-1">
                                {bot.winRate}% Win
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 line-clamp-2" data-testid={`text-bot-description-${bot.id}`}>
                              {bot.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-100 dark:border-slate-600 text-center">
                                <p className="text-lg font-black text-gray-900 dark:text-white" data-testid={`text-bot-profit-${bot.id}`}>
                                  {bot.minProfitPercent}-{bot.maxProfitPercent}%
                                </p>
                                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-1">Daily Profit</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-100 dark:border-slate-600 text-center">
                                <p className="text-lg font-black text-gray-900 dark:text-white" data-testid={`text-bot-duration-${bot.id}`}>{bot.durationDays} Days</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mt-1">Duration</p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center mb-4 text-sm">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Subscription Fee:</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400" data-testid={`text-bot-price-${bot.id}`}>${parseFloat(bot.subscriptionFee || bot.price).toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center mb-6 text-sm">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Investment Range:</span>
                              <span className="font-bold text-gray-900 dark:text-white" data-testid={`text-bot-investment-${bot.id}`}>
                                ${parseFloat(bot.minInvestment).toLocaleString()} - ${parseFloat(bot.maxInvestment).toLocaleString()}
                              </span>
                            </div>

                            <Button 
                              className="w-full h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                              data-testid={`button-activate-bot-${bot.id}`}
                            >
                              Subscribe to Bot
                              <ArrowLeft className="rotate-180 ml-2" size={18} />
                            </Button>
                          </Card>
                        );
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[2rem] px-6 pb-8 max-h-[90vh] overflow-y-auto">
          {selectedBot && (
            <>
              <SheetHeader className="text-left mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className={`w-12 h-12 rounded-xl shadow-md ${
                    selectedBot.category === 'forex' ? 'bg-blue-500' : 
                    selectedBot.category === 'crypto' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}>
                    {selectedBot.logo ? (
                      <AvatarImage src={selectedBot.logo} alt={selectedBot.name} />
                    ) : null}
                    <AvatarFallback className="bg-transparent text-white">
                      <BarChart3 size={24} strokeWidth={2.5} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl" data-testid="text-sheet-bot-name">{selectedBot.name}</SheetTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{selectedBot.category} Trading Bot</p>
                  </div>
                </div>
                <SheetDescription className="text-sm" data-testid="text-sheet-bot-description">
                  {selectedBot.description}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedBot.minProfitPercent}-{selectedBot.maxProfitPercent}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Daily Profit</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                  <Clock className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedBot.durationDays} {selectedBot.durationUnit || 'Days'}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Duration</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                  <DollarSign className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">${parseFloat(selectedBot.subscriptionFee).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Sub. Fee</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Investment Amount
                    </label>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{sliderPercentage}% of max</span>
                  </div>
                  <Slider
                    value={[investmentNum]}
                    min={minInv}
                    max={maxInv}
                    step={1}
                    onValueChange={(values) => setInvestmentAmount(values[0].toString())}
                    className="mb-3"
                    data-testid="slider-investment-amount"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder={`${selectedBot.minInvestment} - ${selectedBot.maxInvestment}`}
                      className="pl-7 h-12 rounded-xl"
                      min={parseFloat(selectedBot.minInvestment)}
                      max={parseFloat(selectedBot.maxInvestment)}
                      data-testid="input-investment-amount"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Min: ${parseFloat(selectedBot.minInvestment).toLocaleString()} • Max: ${parseFloat(selectedBot.maxInvestment).toLocaleString()}
                  </p>
                  {!isInvestmentValid && investmentAmount && (
                    <p className="text-xs text-red-500 mt-1">
                      Investment must be between ${parseFloat(selectedBot.minInvestment).toLocaleString()} and ${parseFloat(selectedBot.maxInvestment).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {selectedBot.tradingAssets && selectedBot.tradingAssets.length > 0 && (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6" data-testid="text-trading-assets">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Trading Assets</h4>
                  <div className="space-y-2">
                    {selectedBot.tradingAssets.map((asset, index) => {
                      const isObject = typeof asset === 'object' && asset !== null;
                      const assetId = isObject ? (asset as TradingAssetInfo).id : undefined;
                      const symbol = isObject ? (asset as TradingAssetInfo).symbol : (asset as string);
                      const name = isObject ? (asset as TradingAssetInfo).name : symbol;
                      const logoUrl = isObject ? (asset as TradingAssetInfo).logoUrl : undefined;
                      const distKey = symbol.toUpperCase();
                      const distKeyLower = symbol.toLowerCase();
                      const distribution = (assetId && selectedBot.assetDistribution?.[assetId]) || selectedBot.assetDistribution?.[distKey] || selectedBot.assetDistribution?.[distKeyLower] || selectedBot.assetDistribution?.[symbol];
                      
                      return (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            {logoUrl && (
                              <img src={logoUrl} alt={symbol} className="w-5 h-5 rounded-full" />
                            )}
                            <span className="text-gray-600 dark:text-gray-300">{name} ({symbol})</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {distribution ? `${distribution}%` : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subscription Fee</span>
                  <span className="font-medium" data-testid="text-subscription-fee">${subscriptionFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Investment Amount</span>
                  <span className="font-medium" data-testid="text-investment-amount">${investmentNum.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Cost</span>
                  <span className="font-bold text-blue-600" data-testid="text-total-cost">${totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Your Balance</span>
                </div>
                <span className={`font-bold ${hasInsufficientBalance ? 'text-red-500' : 'text-green-600'}`} data-testid="text-user-balance">
                  ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {hasInsufficientBalance && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Insufficient balance. You need ${(totalCost - availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more.
                  </p>
                </div>
              )}

              <Button 
                className="w-full h-14 rounded-xl text-lg font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hasInsufficientBalance || !isInvestmentValid || subscribeMutation.isPending}
                onClick={handleSubscribe}
                data-testid="button-subscribe"
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowLeft className="rotate-180 ml-2" size={20} />
                  </>
                )}
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MobileLayout>
  );
}
