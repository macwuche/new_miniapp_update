import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Power, Activity, Cpu, Settings, ShoppingCart } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import aiLogo from "@assets/ai (1)_1764071986101.png";

export default function BotStatus() {
  const [match, params] = useRoute("/asset/:symbol/bot-status");
  const symbol = params?.symbol ? decodeURIComponent(params.symbol) : "BTC";
  
  // Mock state - in a real app this would come from the backend
  const [isActive, setIsActive] = useState(false);

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/asset/${encodeURIComponent(symbol)}`}>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">AI Trading Bot</h1>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 text-gray-600 hover:bg-gray-50">
            <ShoppingCart size={24} />
          </Button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Status Card */}
          <Card className="w-full p-6 rounded-2xl border-none shadow-lg bg-white mb-6 flex flex-col items-center">
            <div className={`w-32 h-32 mb-6 transition-all duration-500 ${isActive ? 'grayscale-0 scale-105' : 'grayscale opacity-70'}`}>
              <img src={aiLogo} alt="AI Trading Bot" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isActive ? "Bot is Active" : "Bot is Offline"}
              </h2>
              <p className="text-gray-500 text-center text-sm">
                {isActive 
                  ? `AI is currently analyzing and trading ${symbol} pairs automatically.` 
                  : `Activate the AI bot to start automated trading for ${symbol}.`}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="font-bold text-sm text-gray-700">
                Status: {isActive ? "RUNNING" : "STOPPED"}
              </span>
            </div>
          </Card>

          {/* Stats / Info (Placeholder) */}
          <div className="w-full grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-3">
                <Activity size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">24h Profit</p>
              <p className="text-lg font-bold text-gray-900">{isActive ? "+1.2%" : "---"}</p>
            </Card>
            <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3">
                <Cpu size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">Algorithm</p>
              <p className="text-lg font-bold text-gray-900">HFT-v4</p>
            </Card>
          </div>

          {/* Control (Admin Controlled Message) */}
          <Card className="w-full p-5 bg-blue-50 border-blue-100 rounded-2xl">
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
            <Button 
              className="flex-1 h-14 text-base font-bold rounded-xl bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
            >
              Buy trading bot
            </Button>

            <Button 
              className={`flex-1 h-14 text-base font-bold rounded-xl shadow-lg transition-all ${
                isActive 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-100' 
                  : 'bg-primary text-white hover:bg-primary/90 shadow-blue-200'
              }`}
              onClick={() => setIsActive(!isActive)}
            >
              <Power className="mr-2" size={20} strokeWidth={2.5} />
              {isActive ? "Stop Bot" : "Activate Bot"}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
