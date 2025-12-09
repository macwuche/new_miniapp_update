import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Bot, Loader2, Calendar, DollarSign, TrendingUp, Clock, Square, Plus, Play } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AiBot {
  id: number;
  name: string;
  description: string;
  price: string;
  durationDays: number;
  expectedRoi: string;
  minInvestment: string;
  maxInvestment: string;
  minProfitPercent: string;
  maxProfitPercent: string;
  logo: string | null;
  isActive: boolean;
}

interface UserBot {
  id: number;
  userId: number;
  botId: number;
  investmentAmount: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
  isStopped: boolean;
  currentProfit: string;
  lastProfitDate: string | null;
  createdAt: string;
}

export default function BotInvestments() {
  const { user } = useTelegram();
  const queryClient = useQueryClient();

  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.id?.toString() || null,
          username: user?.username || 'demo_user',
          firstName: user?.first_name || 'Demo',
          lastName: user?.last_name || 'User',
          profilePicture: user?.photo_url || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to register user');
      return res.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const { data: userBots = [], isLoading: botsLoading } = useQuery<UserBot[]>({
    queryKey: [`/api/users/${dbUser?.id}/bots`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${dbUser?.id}/bots`);
      if (!res.ok) throw new Error('Failed to fetch user bots');
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const { data: allBots = [] } = useQuery<AiBot[]>({
    queryKey: ['/api/bots'],
    queryFn: async () => {
      const res = await fetch('/api/bots');
      if (!res.ok) throw new Error('Failed to fetch bots');
      return res.json();
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: async (userBotId: number) => {
      const res = await fetch(`/api/user-bots/${userBotId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: dbUser?.id }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to stop bot');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Stopped",
        description: "The bot has been stopped and will no longer accumulate profits.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${dbUser?.id}/bots`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to stop bot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reactivateBotMutation = useMutation({
    mutationFn: async (userBotId: number) => {
      const res = await fetch(`/api/user-bots/${userBotId}/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: dbUser?.id }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reactivate bot');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Reactivated",
        description: "The bot is now active and will resume accumulating profits.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${dbUser?.id}/bots`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reactivate bot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getBotDetails = (botId: number): AiBot | undefined => {
    return allBots.find(b => b.id === botId);
  };

  const getStatus = (userBot: UserBot): 'active' | 'stopped' | 'expired' => {
    const now = new Date();
    const expiry = new Date(userBot.expiryDate);
    if (expiry < now) return 'expired';
    if (userBot.isStopped) return 'stopped';
    return 'active';
  };

  const getStatusBadge = (status: 'active' | 'stopped' | 'expired') => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100" data-testid="badge-status-active">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
            Active
          </Badge>
        );
      case 'stopped':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100" data-testid="badge-status-stopped">
            <Square className="w-3 h-3 mr-1.5" />
            Stopped
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-testid="badge-status-expired">
            Expired
          </Badge>
        );
    }
  };

  const getDaysRemaining = (expiryDate: string): number => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgressPercent = (userBot: UserBot, bot: AiBot | undefined): number => {
    if (!bot) return 0;
    const purchase = new Date(userBot.purchaseDate).getTime();
    const expiry = new Date(userBot.expiryDate).getTime();
    const now = Date.now();
    const total = expiry - purchase;
    const elapsed = now - purchase;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeBots = userBots.filter(ub => {
    const status = getStatus(ub);
    return status === 'active' || status === 'stopped';
  });

  const historyBots = userBots.filter(ub => {
    const status = getStatus(ub);
    return status === 'expired';
  });

  const totalInvested = userBots.reduce((sum, ub) => sum + parseFloat(ub.investmentAmount), 0);
  const totalProfit = userBots.reduce((sum, ub) => sum + parseFloat(ub.currentProfit), 0);

  if (botsLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const renderBotCard = (userBot: UserBot) => {
    const bot = getBotDetails(userBot.botId);
    const status = getStatus(userBot);
    const daysRemaining = getDaysRemaining(userBot.expiryDate);
    const progress = getProgressPercent(userBot, bot);
    const dailyProfit = bot ? `${bot.minProfitPercent}% - ${bot.maxProfitPercent}%` : 'N/A';

    return (
      <Card 
        key={userBot.id} 
        className="p-5 border-none shadow-lg bg-white dark:bg-slate-800 rounded-2xl"
        data-testid={`card-bot-${userBot.id}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 rounded-xl">
              <AvatarImage src={bot?.logo || undefined} alt={bot?.name} />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                <Bot size={24} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white" data-testid={`text-bot-name-${userBot.id}`}>
                {bot?.name || 'Unknown Bot'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {bot?.description?.slice(0, 50)}...
              </p>
            </div>
          </div>
          {getStatusBadge(status)}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <DollarSign size={12} />
              Investment
            </div>
            <p className="font-bold text-gray-900 dark:text-white" data-testid={`text-investment-${userBot.id}`}>
              ${parseFloat(userBot.investmentAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp size={12} />
              Current Profit
            </div>
            <p className={`font-bold ${parseFloat(userBot.currentProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid={`text-profit-${userBot.id}`}>
              {parseFloat(userBot.currentProfit) >= 0 ? '+' : ''}${parseFloat(userBot.currentProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={12} />
              Purchase Date
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-sm" data-testid={`text-purchase-date-${userBot.id}`}>
              {formatDate(userBot.purchaseDate)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={12} />
              Expiry Date
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-sm" data-testid={`text-expiry-date-${userBot.id}`}>
              {formatDate(userBot.expiryDate)}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Daily Profit: {dailyProfit}</span>
            {status !== 'expired' && (
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={10} />
                {daysRemaining} days left
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {status === 'stopped' && (
          <div className="space-y-3 mb-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                This bot has been stopped and will no longer accumulate profits. The subscription will continue until expiry.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
              data-testid={`button-reactivate-bot-${userBot.id}`}
              onClick={() => reactivateBotMutation.mutate(userBot.id)}
              disabled={reactivateBotMutation.isPending}
            >
              {reactivateBotMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play size={14} className="mr-2" />
              )}
              Reactivate Bot
            </Button>
          </div>
        )}

        {status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                data-testid={`button-stop-bot-${userBot.id}`}
              >
                <Square size={14} className="mr-2" />
                Stop Bot
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%] rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Stop this bot?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will stop the bot from accumulating profits. The subscription will continue until its expiry date ({formatDate(userBot.expiryDate)}), but you won't earn any more profits.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-stop">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => stopBotMutation.mutate(userBot.id)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={stopBotMutation.isPending}
                  data-testid="button-confirm-stop"
                >
                  {stopBotMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Stop Bot
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Card>
    );
  };

  const renderEmptyState = (type: 'active' | 'history') => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
        <Bot className="text-gray-400 dark:text-gray-500" size={32} />
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
        {type === 'active' ? 'No Active Bots' : 'No Bot History'}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mb-6">
        {type === 'active' 
          ? 'Start your automated trading journey today' 
          : 'Your expired bot subscriptions will appear here'}
      </p>
      {type === 'active' && (
        <Link href="/bot-market">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            Browse Bots
          </Button>
        </Link>
      )}
    </div>
  );

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
            <div className="flex justify-between items-center mb-6">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                <ArrowLeft size={20} />
              </div>
              <Link href="/bot-market">
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
                  data-testid="button-browse-bots"
                >
                  <Plus size={14} className="mr-1" />
                  New Bot
                </Button>
              </Link>
            </div>

            <h1 className="text-2xl font-black mb-2">Bot Investments</h1>
            <p className="text-blue-100 text-sm">Manage your automated trading bots</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-xs mb-1">Total Invested</p>
                <p className="text-xl font-bold" data-testid="text-total-invested">
                  ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-xs mb-1">Total Profit</p>
                <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-300' : 'text-red-300'}`} data-testid="text-total-profit">
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
              <TabsTrigger 
                value="active" 
                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
                data-testid="tab-active"
              >
                Active ({activeBots.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
                data-testid="tab-history"
              >
                History ({historyBots.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeBots.length > 0 
                ? activeBots.map(renderBotCard)
                : renderEmptyState('active')
              }
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {historyBots.length > 0 
                ? historyBots.map(renderBotCard)
                : renderEmptyState('history')
              }
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
