import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
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

  const filteredWallets = WALLETS.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = (walletName: string) => {
    // In a real app, this would trigger the specific wallet connection logic
    // For now, we'll just go back to the wallet page which simulates a connected state
    // You might want to pass a state or query param to indicate success
    setLocation("/wallet"); 
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
                onClick={() => handleConnect(wallet.name)}
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
      </div>
    </MobileLayout>
  );
}
