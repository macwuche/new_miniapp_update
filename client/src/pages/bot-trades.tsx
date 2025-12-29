import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Bot, Loader2, TrendingUp, TrendingDown, ArrowUpDown, Calendar, DollarSign } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";
import { format } from "date-fns";

interface BotTrade {
  id: number;
  userBotId: number;
  userId: number;
  assetSymbol: string;
  assetType: string;
  tradeResult: 'win' | 'loss';
  tradeAmount: string;
  profitAmount: string;
  lossAmount: string;
  assetPriceAtTrade: string | null;
  assetName: string | null;
  assetLogoUrl: string | null;
  createdAt: string;
}

interface UserBot {
  id: number;
  botId: number;
  investmentAmount: string;
  allocatedAmount: string;
  currentProfit: string;
  totalProfitDistributed: string;
}

interface AiBot {
  id: number;
  name: string;
  logo: string | null;
  category: 'crypto' | 'forex' | 'stock';
}

export default function BotTrades() {
  const { user } = useTelegram();
  const params = useParams<{ id: string }>();
  const userBotId = params.id ? parseInt(params.id) : null;

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
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<BotTrade[]>({
    queryKey: ['/api/bot-trades', userBotId, dbUser?.id],
    queryFn: async () => {
      if (userBotId) {
        const res = await fetch(`/api/user-bots/${userBotId}/trades`);
        if (!res.ok) throw new Error('Failed to fetch trades');
        return res.json();
      } else if (dbUser?.id) {
        const res = await fetch(`/api/users/${dbUser.id}/bot-trades`);
        if (!res.ok) throw new Error('Failed to fetch trades');
        return res.json();
      }
      return [];
    },
    enabled: !!dbUser?.id || !!userBotId,
  });

  const { data: bots } = useQuery<AiBot[]>({
    queryKey: ['/api/bots'],
    queryFn: async () => {
      const res = await fetch('/api/bots');
      if (!res.ok) throw new Error('Failed to fetch bots');
      return res.json();
    },
  });

  const { data: userBots } = useQuery<UserBot[]>({
    queryKey: ['/api/users/bots', dbUser?.id],
    queryFn: async () => {
      if (!dbUser?.id) return [];
      const res = await fetch(`/api/users/${dbUser.id}/bots`);
      if (!res.ok) throw new Error('Failed to fetch user bots');
      return res.json();
    },
    enabled: !!dbUser?.id,
  });

  const getBotInfo = (userBotId: number) => {
    const userBot = userBots?.find(ub => ub.id === userBotId);
    const bot = bots?.find(b => b.id === userBot?.botId);
    return { userBot, bot };
  };

  const totalProfit = trades?.reduce((sum, t) => sum + parseFloat(t.profitAmount || '0'), 0) || 0;
  const totalLoss = trades?.reduce((sum, t) => sum + parseFloat(t.lossAmount || '0'), 0) || 0;
  const netPnL = totalProfit - totalLoss;
  const winCount = trades?.filter(t => t.tradeResult === 'win').length || 0;
  const lossCount = trades?.filter(t => t.tradeResult === 'loss').length || 0;
  const totalTrades = trades?.length || 0;
  const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0';

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center p-4 border-b">
          <Link href="/bot-investments">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold ml-2" data-testid="text-page-title">
            Trading History
          </h1>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <Card className="p-4" data-testid="card-summary">
            <h3 className="text-sm text-muted-foreground mb-3">Performance Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Trades</p>
                <p className="text-xl font-bold" data-testid="text-total-trades">{totalTrades}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold text-green-500" data-testid="text-win-rate">{winRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="text-lg font-semibold text-green-500" data-testid="text-total-profit">
                  +${totalProfit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Loss</p>
                <p className="text-lg font-semibold text-red-500" data-testid="text-total-loss">
                  -${totalLoss.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net P&L</span>
                <span 
                  className={`text-lg font-bold ${netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  data-testid="text-net-pnl"
                >
                  {netPnL >= 0 ? '+' : ''}{netPnL.toFixed(2)} USD
                </span>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Trade History</h2>
            <Badge variant="outline" className="gap-1">
              <ArrowUpDown className="h-3 w-3" />
              {winCount}W / {lossCount}L
            </Badge>
          </div>

          {tradesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : trades?.length === 0 ? (
            <Card className="p-8 text-center" data-testid="card-empty-trades">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No Trades Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your bot trading activity will appear here once trades are executed.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {trades?.map((trade) => {
                const { bot } = getBotInfo(trade.userBotId);
                const isWin = trade.tradeResult === 'win';
                
                return (
                  <Card key={trade.id} className="p-3" data-testid={`card-trade-${trade.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {trade.assetLogoUrl ? (
                            <img 
                              src={trade.assetLogoUrl} 
                              alt={trade.assetName || trade.assetSymbol}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className={`p-2 rounded-full ${isWin ? 'bg-green-100' : 'bg-red-100'}`}>
                              {isWin ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${isWin ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isWin ? (
                              <TrendingUp className="h-2.5 w-2.5 text-white" />
                            ) : (
                              <TrendingDown className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium" data-testid={`text-asset-${trade.id}`}>
                              {trade.assetName || trade.assetSymbol.toUpperCase()}
                            </span>
                            <Badge 
                              variant={isWin ? "outline" : "destructive"} 
                              className={`text-xs ${isWin ? 'bg-green-100 text-green-700 border-green-300' : ''}`}
                            >
                              {isWin ? 'WIN' : 'LOSS'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {bot?.name || 'AI Bot'} • {trade.assetSymbol.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p 
                          className={`font-semibold ${isWin ? 'text-green-500' : 'text-red-500'}`}
                          data-testid={`text-pnl-${trade.id}`}
                        >
                          {isWin ? '+' : '-'}${isWin ? parseFloat(trade.profitAmount).toFixed(2) : parseFloat(trade.lossAmount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Trade: ${parseFloat(trade.tradeAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(trade.createdAt), 'MMM d, yyyy HH:mm')}
                      </span>
                      {trade.assetPriceAtTrade && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Price: ${parseFloat(trade.assetPriceAtTrade).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
