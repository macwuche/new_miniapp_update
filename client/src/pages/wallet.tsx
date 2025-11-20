import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function WalletPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
        <p className="text-gray-500 mb-8">Link your crypto wallet to start trading securely.</p>

        {!isConnected ? (
          <div className="space-y-4">
            <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white overflow-hidden relative">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
               <div className="absolute -left-10 -bottom-10 w-30 h-30 bg-black/10 rounded-full blur-2xl" />
               
               <div className="relative z-10 flex flex-col items-center text-center py-4">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                   <Wallet size={32} className="text-white" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">No Wallet Connected</h3>
                 <p className="text-blue-100 text-sm mb-6 max-w-[200px]">
                   Connect your TON or Ethereum wallet to deposit funds.
                 </p>
                 
                 <Button 
                   onClick={handleConnect}
                   className="bg-white text-blue-600 hover:bg-blue-50 font-bold w-full shadow-lg shadow-blue-900/20 h-12 rounded-xl"
                   disabled={isConnecting}
                 >
                   {isConnecting ? (
                     <>
                       <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                       Connecting...
                     </>
                   ) : (
                     "Connect Wallet"
                   )}
                 </Button>
               </div>
            </Card>

            <div className="mt-8">
              <h4 className="font-bold text-gray-900 mb-4">Supported Wallets</h4>
              <div className="space-y-3">
                {[
                  { name: "Tonkeeper", color: "bg-blue-400" },
                  { name: "MetaMask", color: "bg-orange-500" },
                  { name: "WalletConnect", color: "bg-blue-600" }
                ].map((wallet) => (
                  <button 
                    key={wallet.name} 
                    onClick={handleConnect}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${wallet.color} flex items-center justify-center text-white font-bold text-xs`}>
                        {wallet.name[0]}
                      </div>
                      <span className="font-medium text-gray-900">{wallet.name}</span>
                    </div>
                    <ArrowRight size={20} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <Card className="p-6 border-none shadow-lg bg-green-500 text-white relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-20">
                  <ShieldCheck size={80} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1 text-green-100">
                    <CheckCircle2 size={18} />
                    <span className="font-medium text-sm">Wallet Connected</span>
                  </div>
                  <h3 className="text-2xl font-mono font-bold mb-4">EQD4...8j92</h3>
                  <div className="flex gap-3">
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none h-8">
                      Copy Address
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white text-green-600 hover:bg-green-50 border-none h-8" onClick={() => setIsConnected(false)}>
                      Disconnect
                    </Button>
                  </div>
                </div>
             </Card>

             <div className="grid grid-cols-2 gap-4">
               <Card className="p-4 bg-white border-none shadow-sm">
                 <p className="text-gray-500 text-xs mb-1">TON Balance</p>
                 <p className="text-xl font-bold text-gray-900">450.5 TON</p>
                 <p className="text-xs text-gray-400">≈ $2,340.50</p>
               </Card>
               <Card className="p-4 bg-white border-none shadow-sm">
                 <p className="text-gray-500 text-xs mb-1">USDT Balance</p>
                 <p className="text-xl font-bold text-gray-900">1,200.00</p>
                 <p className="text-xs text-gray-400">USDT</p>
               </Card>
             </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
