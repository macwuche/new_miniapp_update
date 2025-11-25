import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRightLeft, ArrowUpRight, Wallet } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Mock data extended with types
const ASSETS = [
  { name: "Bitcoin", symbol: "BTC", type: "crypto", amount: 0.45, value: 38880.56 },
  { name: "Ethereum", symbol: "ETH", type: "crypto", amount: 12.5, value: 42765.00 },
  { name: "Tether", symbol: "USDT", type: "crypto", amount: 12450.00, value: 12450.00 },
  { name: "Solana", symbol: "SOL", type: "crypto", amount: 145.2, value: 21054.00 },
  { name: "Cardano", symbol: "ADA", type: "crypto", amount: 4500.0, value: 2700.00 },
  { name: "Polkadot", symbol: "DOT", type: "crypto", amount: 2300.0, value: 16100.00 },
  { name: "Apple", symbol: "AAPL", type: "stock", amount: 10, value: 1850.00 },
  { name: "Tesla", symbol: "TSLA", type: "stock", amount: 5, value: 1200.00 },
  { name: "EUR/USD", symbol: "EUR", type: "forex", amount: 1000, value: 1085.00 },
];

export default function PortfolioAssetAction() {
  const [match, params] = useRoute("/portfolio/:symbol");
  const symbol = params?.symbol || "BTC";
  
  const asset = ASSETS.find(a => a.symbol === symbol) || ASSETS[0];
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("");

  // Filter available assets for conversion based on type (Crypto <-> Crypto only, etc.)
  const availableToAssets = ASSETS.filter(a => a.type === asset.type && a.symbol !== asset.symbol);

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/portfolio">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{asset.name} ({asset.symbol})</h1>
          </div>
        </div>

        <div className="p-6">
          {/* Asset Card */}
          <Card className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20 mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-3xl font-black tracking-tight">{asset.amount} {asset.symbol}</h2>
                <p className="text-blue-200 text-sm font-medium mt-1">≈ ${asset.value.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-xl font-bold">
                {asset.symbol[0]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/withdraw">
                <Button className="w-full bg-white text-primary hover:bg-blue-50 border-none font-bold h-12 rounded-xl shadow-sm">
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Withdraw
                </Button>
              </Link>
              <Button 
                className="w-full bg-white/20 hover:bg-white/30 text-white border-none font-bold h-12 rounded-xl backdrop-blur-md"
                onClick={() => setIsConvertOpen(true)}
              >
                <ArrowRightLeft className="mr-2 h-5 w-5" />
                Convert
              </Button>
            </div>
          </Card>

          {/* Recent Activity Placeholder */}
          <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    <ArrowRightLeft size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Converted to USDT</p>
                    <p className="text-xs text-gray-500">Today, 10:2{i} AM</p>
                  </div>
                </div>
                <p className="font-bold text-red-500 text-sm">-0.002 {asset.symbol}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Convert Dialog */}
        <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[95%] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Convert {asset.symbol}</DialogTitle>
              <DialogDescription>
                Swap your {asset.type} assets instantly with zero fees.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* From Asset */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">From</Label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="h-14 text-lg font-bold bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      Max: {asset.amount}
                    </div>
                  </div>
                  <div className="w-32 flex items-center gap-2 px-3 h-14 bg-gray-100 rounded-lg border border-gray-200 opacity-80 cursor-not-allowed">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                      {asset.symbol[0]}
                    </div>
                    <span className="font-bold text-gray-700">{asset.symbol}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-white p-2 rounded-full border border-gray-100 shadow-sm text-gray-400">
                  <ArrowRightLeft size={20} />
                </div>
              </div>

              {/* To Asset */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">To</Label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="h-14 text-lg font-bold bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      readOnly
                      value={convertAmount ? (parseFloat(convertAmount) * 0.98).toFixed(4) : ""} 
                    />
                  </div>
                  <div className="w-32">
                    <Select defaultValue={availableToAssets[0]?.symbol}>
                      <SelectTrigger className="h-14 bg-white border-gray-200 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableToAssets.map((a) => (
                          <SelectItem key={a.symbol} value={a.symbol}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                                {a.symbol[0]}
                              </div>
                              {a.symbol}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span className="font-bold">1 {asset.symbol} ≈ 0.98 {availableToAssets[0]?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee</span>
                  <span className="font-bold">0%</span>
                </div>
              </div>

              <Button className="w-full h-12 font-bold text-base rounded-xl" disabled={!convertAmount}>
                Preview Conversion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
