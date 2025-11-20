import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { Wallet, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Globe } from "lucide-react";
import { useState } from "react";

const WALLETS = [
  { name: "Wallet Connect", url: "walletconnect.com", color: "bg-blue-600" },
  { name: "Onchain", url: "onchain.com", color: "bg-indigo-500" },
  { name: "Trust Wallet", url: "trustwallet.com", color: "bg-blue-400" },
  { name: "MetaMask", url: "metamask.io", color: "bg-orange-500" },
  { name: "Blockchain", url: "blockchain.com", color: "bg-purple-600" },
  { name: "Phantom", url: "phantom.app", color: "bg-purple-500" },
  { name: "Coinbase", url: "coinbase.com", color: "bg-blue-700" },
];

export default function WalletPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = (walletName: string) => {
    setIsOpen(false);
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
                   Connect your crypto wallet to deposit funds and start trading.
                 </p>
                 
                 <Drawer open={isOpen} onOpenChange={setIsOpen}>
                   <DrawerTrigger asChild>
                     <Button 
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
                   </DrawerTrigger>
                   <DrawerContent className="h-[85vh]">
                     <div className="mx-auto w-full max-w-sm">
                       <DrawerHeader>
                         <DrawerTitle className="text-2xl font-bold text-center">Choose Wallet</DrawerTitle>
                         <DrawerDescription className="text-center">Select a wallet to connect to the platform</DrawerDescription>
                       </DrawerHeader>
                       <div className="p-4 overflow-y-auto h-full pb-20">
                         <div className="flex flex-col gap-3">
                           {WALLETS.map((wallet) => (
                             <button 
                               key={wallet.name}
                               onClick={() => handleConnect(wallet.name)}
                               className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 active:scale-[0.98] transition-all text-left"
                             >
                               <div className={`w-12 h-12 rounded-xl ${wallet.color} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
                                 {wallet.name[0]}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between">
                                   <h4 className="font-bold text-gray-900 text-base truncate">{wallet.name}</h4>
                                 </div>
                                 <p className="text-sm text-gray-500 font-medium truncate">{wallet.url}</p>
                               </div>
                               <ArrowRight size={20} className="text-gray-300" />
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>
                   </DrawerContent>
                 </Drawer>
               </div>
            </Card>
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
