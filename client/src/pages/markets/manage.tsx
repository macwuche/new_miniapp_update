import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, Search, Plus, Check } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock available assets to add
const AVAILABLE_ASSETS = {
  crypto: [
    { name: "Cardano", symbol: "ADA/USDT", added: false },
    { name: "Polkadot", symbol: "DOT/USDT", added: false },
    { name: "Dogecoin", symbol: "DOGE/USDT", added: false },
    { name: "Chainlink", symbol: "LINK/USDT", added: false },
    { name: "Litecoin", symbol: "LTC/USDT", added: false },
    { name: "Binance Coin", symbol: "BNB/USDT", added: false },
  ],
  stocks: [
    { name: "Amazon", symbol: "AMZN", added: false },
    { name: "Google", symbol: "GOOGL", added: false },
    { name: "Netflix", symbol: "NFLX", added: false },
    { name: "Meta", symbol: "META", added: false },
  ],
  forex: [
    { name: "AUD/USD", symbol: "AUD", added: false },
    { name: "USD/CAD", symbol: "CAD", added: false },
    { name: "USD/CHF", symbol: "CHF", added: false },
  ]
};

export default function ManageAssets() {
  const { toast } = useToast();
  const [assets, setAssets] = useState(AVAILABLE_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAsset = (category: keyof typeof AVAILABLE_ASSETS, index: number) => {
    const newAssets = { ...assets };
    const asset = newAssets[category][index];
    asset.added = !asset.added;
    setAssets(newAssets);

    toast({
      title: asset.added ? "Asset Added" : "Asset Removed",
      description: `${asset.symbol} has been ${asset.added ? "added to" : "removed from"} your watchlist.`,
      duration: 2000,
    });
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/markets">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Manage Assets</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search pair to add..." 
              className="pl-10 bg-gray-50 border-none h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          <Tabs defaultValue="crypto" className="w-full">
            <TabsList className="w-full bg-gray-100 p-1 rounded-xl mb-6 h-10">
              <TabsTrigger value="crypto" className="rounded-lg flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Crypto</TabsTrigger>
              <TabsTrigger value="stocks" className="rounded-lg flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Stocks</TabsTrigger>
              <TabsTrigger value="forex" className="rounded-lg flex-1 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Forex</TabsTrigger>
            </TabsList>

            {Object.entries(assets).map(([category, items]) => (
              <TabsContent key={category} value={category} className="space-y-3 mt-0">
                {items
                  .filter(item => 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((asset, index) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 font-bold text-xs border border-gray-100">
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{asset.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{asset.symbol}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={asset.added ? "secondary" : "default"}
                      className={`h-9 px-4 rounded-lg font-bold transition-all ${
                        asset.added 
                          ? "bg-green-50 text-green-600 hover:bg-green-100" 
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                      onClick={() => toggleAsset(category as keyof typeof AVAILABLE_ASSETS, index)}
                    >
                      {asset.added ? (
                        <>
                          <Check size={16} className="mr-1" /> Added
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-1" /> Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
                
                {items.filter(item => 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p>No assets found</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}
