import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ShieldCheck, Loader2, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function WalletPage() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <MobileLayout>
      <div className="min-h-screen bg-white dark:bg-slate-900 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <Link href="/linked-wallets">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreHorizontal size={24} />
            </Button>
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Manage your crypto assets and connections.</p>

        {!isConnected ? (
          <div className="space-y-4">
            <Card className="p-6 border-none shadow-lg bg-white dark:bg-slate-800 overflow-hidden relative min-h-[300px] flex flex-col justify-center">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl" />
               <div className="absolute -left-10 -bottom-10 w-30 h-30 bg-purple-500/10 dark:bg-purple-400/10 rounded-full blur-2xl" />
               
               <div className="relative z-10 flex flex-col items-center text-center py-4">
                 <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-blue-200 dark:border-blue-700">
                   <Wallet size={40} className="text-blue-600 dark:text-blue-400" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Connect Wallet</h3>
                 <p className="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-[240px] leading-relaxed">
                   Link your secure crypto wallet to start trading instantly.
                 </p>
                 
                 <Link href="/connect-wallet" className="w-full">
                   <Button 
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full shadow-xl shadow-blue-600/20 h-14 text-lg rounded-xl transition-transform active:scale-95"
                   >
                     Connect Now
                   </Button>
                 </Link>
               </div>
            </Card>

            <div className="flex justify-center gap-6 pt-4">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <ShieldCheck className="mx-auto mb-1" size={24} />
                <span className="text-xs font-medium">Secure</span>
              </div>
              <div className="text-center text-gray-500 dark:text-gray-400">
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
               <Card className="p-4 bg-white dark:bg-slate-800 border-none shadow-sm">
                 <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">TON Balance</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">450.5 TON</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500">≈ $2,340.50</p>
               </Card>
               <Card className="p-4 bg-white dark:bg-slate-800 border-none shadow-sm">
                 <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">USDT Balance</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">1,200.00</p>
                 <p className="text-xs text-gray-400 dark:text-gray-500">USDT</p>
               </Card>
             </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
