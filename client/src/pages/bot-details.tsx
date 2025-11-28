import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, CheckCircle2, TrendingUp, AlertCircle, XCircle } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
    totalEarned: 0,
    strategy: "Advanced Scalping",
    frequency: "Multiple times daily",
    fullDescription: "ForexMaster Pro utilizes high-frequency trading algorithms to capitalize on small price movements in major currency pairs. It's designed for consistent daily returns with strict risk management protocols."
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
    totalEarned: 23,
    strategy: "Trend Following",
    frequency: "Hourly trades",
    fullDescription: "CryptoGain Elite uses advanced trend-following strategies to capture significant moves in the cryptocurrency market. It adapts to market volatility to protect capital while maximizing upside potential."
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
    totalEarned: 454,
    strategy: "Advanced AI Trading",
    frequency: "Multiple times daily",
    fullDescription: "Advanced machine learning algorithms analyze market patterns to execute profitable trades. Focuses on high-liquidity blue-chip stocks for stable and consistent growth."
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
    totalEarned: 0,
    strategy: "Statistical Arbitrage",
    frequency: "High Frequency",
    fullDescription: "Exploits temporary price inefficiencies between index futures and the spot market. Extremely low risk due to the market-neutral nature of the strategy."
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
    totalEarned: 0,
    strategy: "Yield Curve Analysis",
    frequency: "Daily rebalancing",
    fullDescription: "Analyzes macroeconomic data and yield curve shifts to position in the most favorable bond maturities. Focuses on capital preservation and steady income generation."
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
    totalEarned: 0,
    strategy: "Sentiment Analysis",
    frequency: "Event-driven",
    fullDescription: "Scans millions of data points from social media, news, and financial reports to gauge market sentiment. Executes trades before the broader market reacts to news."
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
    totalEarned: 0,
    strategy: "Volatility Arbitrage",
    frequency: "Intraday",
    fullDescription: "Trades the spread between implied and realized volatility. Profits from the mean-reverting nature of volatility indices and related ETFs."
  }
];

export default function BotDetails() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const botId = params.id ? parseInt(params.id) : 0;
  const bot = BOTS.find(b => b.id === botId);
  
  const [amount, setAmount] = useState("");
  const [autoReinvest, setAutoReinvest] = useState(false);
  const [isInvested, setIsInvested] = useState(false);
  const [investedAmount, setInvestedAmount] = useState(0);

  if (!bot) {
    return (
      <MobileLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Bot not found</p>
          <Button onClick={() => setLocation("/bot-market")}>Back to Bots</Button>
        </div>
      </MobileLayout>
    );
  }

  const handleInvest = () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount.",
        variant: "destructive"
      });
      return;
    }
    
    if (Number(amount) < bot.minInvest) {
      toast({
        title: "Below Minimum",
        description: `Minimum investment is $${bot.minInvest}.`,
        variant: "destructive"
      });
      return;
    }

    if (Number(amount) > bot.maxInvest) {
      toast({
        title: "Exceeds Maximum",
        description: `Maximum investment is $${bot.maxInvest}.`,
        variant: "destructive"
      });
      return;
    }

    setInvestedAmount(Number(amount));
    setIsInvested(true);
    
    toast({
      title: "Investment Successful",
      description: `You have successfully invested $${amount} in ${bot.name}.`,
    });
  };

  const handleCancelInvestment = () => {
    setIsInvested(false);
    setInvestedAmount(0);
    setAmount("");
    toast({
      title: "Investment Cancelled",
      description: "Your investment has been cancelled and funds returned to your wallet.",
    });
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="px-6 pt-8">
          {/* Header */}
          <div className="mb-8">
            <div 
              className="flex items-center text-gray-500 text-sm mb-4 cursor-pointer hover:text-gray-800 transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Bots
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{bot.name}</h1>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                  {bot.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center border-none shadow-sm bg-white">
                  <p className="text-xl font-bold text-gray-900 mb-1">{bot.success}</p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </Card>
                <Card className="p-4 text-center border-none shadow-sm bg-white">
                  <p className="text-xl font-bold text-gray-900 mb-1">{bot.totalEarned > 0 ? bot.totalEarned : "0"}</p>
                  <p className="text-xs text-gray-500">Total Trades</p>
                </Card>
                <Card className="p-4 text-center border-none shadow-sm bg-white">
                  <p className="text-xl font-bold text-green-600 mb-1">$0.00</p>
                  <p className="text-xs text-gray-500">Total Profit</p>
                </Card>
                <Card className="p-4 text-center border-none shadow-sm bg-white">
                  <p className="text-xl font-bold text-blue-600 mb-1">{bot.dailyProfit.split('-')[0].trim()}</p>
                  <p className="text-xs text-gray-500">Expected Return</p>
                </Card>
              </div>

              {/* Trading Strategy */}
              <Card className="p-6 border-none shadow-sm bg-white">
                <h3 className="font-bold text-gray-900 mb-4">Trading Strategy</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs font-medium">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">S</div>
                      Strategy Type
                    </div>
                    <p className="font-medium text-gray-900">{bot.strategy || "Advanced AI Trading"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs font-medium">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">T</div>
                      Trading Frequency
                    </div>
                    <p className="font-medium text-gray-900">{bot.frequency || "Multiple times daily"}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-medium">
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">i</div>
                    Description
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {bot.fullDescription || bot.description}
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - Investment */}
            <div className="space-y-6">
              <Card className="p-6 border-none shadow-sm bg-white">
                <h3 className="font-bold text-gray-900 mb-6">Investment Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum Trading Amount</span>
                    <span className="font-bold text-gray-900">${bot.minInvest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Maximum Trading Amount</span>
                    <span className="font-bold text-gray-900">${bot.maxInvest.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expected ROI</span>
                    <span className="font-bold text-green-600">{bot.dailyProfit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Risk Level</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-4 bg-orange-300 rounded-sm"></div>
                      <div className="w-2 h-4 bg-orange-300 rounded-sm"></div>
                      <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {isInvested ? (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Your Investment</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount Invested</span>
                        <span className="font-bold text-gray-900">${investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Profit</span>
                        <span className="font-bold text-green-600">+$0.00</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-500 font-medium">Total Value</span>
                        <span className="font-bold text-gray-900">${investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4 h-10 bg-red-600 hover:bg-red-700 font-bold rounded-xl shadow-md text-sm"
                      onClick={handleCancelInvestment}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Investment
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-medium text-gray-500">Investment Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-7 h-12 bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={bot.minInvest.toString()}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Min: ${bot.minInvest.toFixed(2)}</span>
                        <span>Max: ${bot.maxInvest.toLocaleString()}.00</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-6">
                      <Checkbox 
                        id="reinvest" 
                        checked={autoReinvest}
                        onCheckedChange={(checked) => setAutoReinvest(checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label
                        htmlFor="reinvest"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                      >
                        Auto-purchase profits
                      </label>
                    </div>

                    <Button 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
                      onClick={handleInvest}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Start trading
                    </Button>
                  </>
                )}
              </Card>

              <Card className="p-6 border-none shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold text-sm">
                  <AlertCircle size={16} />
                  <h3>Risk Information</h3>
                </div>
                <ul className="space-y-3 text-xs text-gray-500 leading-relaxed list-disc pl-4">
                  <li>Trading involves substantial risk and may result in loss of capital.</li>
                  <li>Past performance does not guarantee future results.</li>
                  <li>Only invest what you can afford to lose.</li>
                  <li>Bot trading is automated but not guaranteed to be profitable.</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
