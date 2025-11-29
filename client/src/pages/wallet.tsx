import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ShieldCheck, Loader2, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function WalletPage() {
  // In a real app, this state would come from a global store or context
  const [isConnected, setIsConnected] = useState(false);

  return (
    <MobileLayout>
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Wallet</h1>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={24} />
          </Button>
        </div>
        <p className="text-gray-500 mb-8">Manage your crypto assets and connections.</p>

        {!isConnected ? (
          <div className="space-y-4">
            <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white overflow-hidden relative min-h-[300px] flex flex-col justify-center">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
               <div className="absolute -left-10 -bottom-10 w-30 h-30 bg-black/10 rounded-full blur-2xl" />
               
               <div className="relative z-10 flex flex-col items-center text-center py-4">
                 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner border border-white/10">
                   <Wallet size={40} className="text-white" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3">Connect Wallet</h3>
                 <p className="text-blue-100 text-base mb-8 max-w-[240px] leading-relaxed">
                   Link your secure crypto wallet to start trading instantly.
                 </p>
                 
                 <Link href="/connect-wallet" className="w-full">
                   <Button 
                     className="bg-white text-blue-600 hover:bg-blue-50 font-bold w-full shadow-xl shadow-blue-900/20 h-14 text-lg rounded-xl transition-transform active:scale-95"
                   >
                     Connect Now
                   </Button>
                 </Link>
               </div>
            </Card>

            <div className="flex justify-center gap-6 pt-4 opacity-60">
              <div className="text-center">
                <ShieldCheck className="mx-auto mb-1" size={24} />
                <span className="text-xs font-medium">Secure</span>
              </div>
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-1" size={24} />
                <span className="text-xs font-medium">Verified</span>
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
