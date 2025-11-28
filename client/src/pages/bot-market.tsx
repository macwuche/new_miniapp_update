import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, CheckCircle2, TrendingUp, BarChart3, Activity, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BOTS = [
  {
    id: 1,
    name: "ForexMaster Pro",
    type: "Forex Trading",
    category: "forex",
    success: "87%",
    description: "Advanced forex trading bot specializing in major currency pairs. Uses sophisticated algorithms to analyze market trends.",
    dailyProfit: "0.80% - 2.50%",
    duration: "30 Days",
    minInvest: 100,
    maxInvest: 10000,
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"],
    activeUsers: 1240,
    totalEarned: 0
  },
  {
    id: 2,
    name: "CryptoGain Elite",
    type: "Crypto Trading",
    category: "crypto",
    success: "82%",
    description: "High-performance cryptocurrency trading bot designed for the volatile crypto markets. Leverages machine learning to identify opportunities.",
    dailyProfit: "1.20% - 4.50%",
    duration: "45 Days",
    minInvest: 250,
    maxInvest: 25000,
    pairs: ["BTC/USD", "ETH/USD", "BNB/USD", "ADA/USD"],
    activeUsers: 3500,
    totalEarned: 23
  },
  {
    id: 3,
    name: "StockTrader AI",
    type: "Stocks Trading",
    category: "stocks",
    success: "89%",
    description: "Intelligent stock trading bot focusing on blue-chip stocks and growth companies. Combines fundamental analysis with technical indicators.",
    dailyProfit: "0.50% - 2.00%",
    duration: "60 Days",
    minInvest: 500,
    maxInvest: 50000,
    pairs: ["AAPL", "GOOGL", "MSFT", "AMZN"],
    activeUsers: 850,
    totalEarned: 454
  },
  {
    id: 6,
    name: "Index Arbitrage Bot",
    type: "Indices Trading",
    category: "stocks",
    success: "95%",
    description: "Advanced arbitrage bot that exploits price differences between index futures and their underlying components. High-frequency strategies.",
    dailyProfit: "0.80% - 2.50%",
    duration: "365 Days",
    minInvest: 2500,
    maxInvest: 120000,
    pairs: ["SPX", "NDX", "RUT", "VIX"],
    activeUsers: 150,
    totalEarned: 0
  },
  {
    id: 7,
    name: "Bond Yield Hunter",
    type: "Bonds Trading",
    category: "stocks",
    success: "92%",
    description: "Sophisticated fixed-income trading bot that navigates interest rate changes and yield curve movements. Perfect for institutional-grade stability.",
    dailyProfit: "0.40% - 1.80%",
    duration: "365 Days",
    minInvest: 5000,
    maxInvest: 200000,
    pairs: ["10Y_TREASURY", "30Y_TREASURY", "2Y_TREASURY", "CORP_BONDS"],
    activeUsers: 95,
    totalEarned: 0
  },
  {
    id: 8,
    name: "AI Sentiment Trader",
    type: "Mixed Trading",
    category: "crypto",
    success: "86%",
    description: "Revolutionary sentiment-based trading bot that analyzes social media, news, and market sentiment across multiple asset classes.",
    dailyProfit: "1.90% - 5.80%",
    duration: "60 Days",
    minInvest: 600,
    maxInvest: 35000,
    pairs: ["BTC/USD", "ETH/USD", "AAPL", "TSLA"],
    activeUsers: 2100,
    totalEarned: 0
  },
  {
    id: 9,
    name: "Volatility Surface Bot",
    type: "Volatility Trading",
    category: "stocks",
    success: "88%",
    description: "Advanced volatility trading bot that maps and trades the volatility surface across multiple assets. Ideal for sophisticated investors.",
    dailyProfit: "1.10% - 4.20%",
    duration: "45 Days",
    minInvest: 3000,
    maxInvest: 150000,
    pairs: ["VIX", "VXX", "UVXY", "SVXY"],
    activeUsers: 180,
    totalEarned: 0
  }
];

export default function BotMarket() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-500 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 cursor-pointer transition-colors"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={20} />
              </div>
              <div className="px-3 py-1 rounded-full bg-green-400/20 border border-green-400/30 text-green-100 text-xs font-bold flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                AI-Powered Trading
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-3 tracking-tight">Bot Trading Hub</h1>
              <p className="text-blue-100 text-sm max-w-xs mx-auto leading-relaxed">
                Invest in AI-powered trading bots that work 24/7 to maximize your profits across multiple markets.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl backdrop-blur-md font-bold shadow-sm">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/bot-investments">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 border-none rounded-xl font-bold shadow-sm">
                  <Activity size={16} className="mr-2" />
                  My Bot Investments
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pt-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Available Trading Bots</h2>
            <p className="text-xs text-gray-500">Choose from our AI-powered trading bots</p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex overflow-x-auto no-scrollbar justify-start gap-2 bg-transparent h-auto p-0 mb-6">
              <TabsTrigger 
                value="all" 
                className="rounded-full px-5 py-2 text-xs font-bold bg-white border border-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
              >
                All Bots
              </TabsTrigger>
              <TabsTrigger 
                value="forex" 
                className="rounded-full px-5 py-2 text-xs font-bold bg-white border border-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
              >
                Forex
              </TabsTrigger>
              <TabsTrigger 
                value="crypto" 
                className="rounded-full px-5 py-2 text-xs font-bold bg-white border border-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
              >
                Crypto
              </TabsTrigger>
              <TabsTrigger 
                value="stocks" 
                className="rounded-full px-5 py-2 text-xs font-bold bg-white border border-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 shadow-sm"
              >
                Stocks
              </TabsTrigger>
            </TabsList>

            {["all", "forex", "crypto", "stocks"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {BOTS.filter(b => tab === "all" || b.category === tab).map((bot) => (
                    <Card key={bot.id} className="p-5 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md
                            ${bot.category === 'forex' ? 'bg-blue-500' : 
                              bot.category === 'crypto' ? 'bg-purple-500' : 'bg-orange-500'}`}>
                            <BarChart3 size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{bot.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">{bot.type}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-2 py-1">
                          {bot.success} Success
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {bot.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-lg font-black text-gray-900">{bot.dailyProfit}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Daily Profit</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                          <p className="text-lg font-black text-gray-900">{bot.duration}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Duration</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6 text-sm">
                        <span className="text-gray-500 font-medium">Investment Range:</span>
                        <span className="font-bold text-gray-900">${bot.minInvest.toLocaleString()} - ${bot.maxInvest.toLocaleString()}</span>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Trading Pairs</p>
                        <div className="flex flex-wrap gap-2">
                          {bot.pairs.map(pair => (
                            <span key={pair} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                              {pair}
                            </span>
                          ))}
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-100">
                            +2 more
                          </span>
                        </div>
                      </div>

                      <Link href={`/bot/${bot.id}`}>
                        <Button className="w-full h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                          Activate this bot
                          <ArrowLeft className="rotate-180 ml-2" size={18} />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
