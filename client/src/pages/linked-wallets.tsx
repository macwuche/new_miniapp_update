import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowLeft, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function LinkedWallets() {
  // Mock data for linked wallets
  const linkedWallets = [
    {
      id: 1,
      name: "Tonkeeper",
      address: "EQD4...8j92",
      type: "TON",
      color: "bg-blue-100 text-blue-600",
      isConnected: true
    },
    {
      id: 2,
      name: "Trust Wallet",
      address: "0x71C...9A23",
      type: "EVM",
      color: "bg-green-100 text-green-600",
      isConnected: false
    },
    {
      id: 3,
      name: "MetaMask",
      address: "0x82B...1F45",
      type: "EVM",
      color: "bg-orange-100 text-orange-600",
      isConnected: false
    }
  ];

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
        <div className="mb-6 pt-2 flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Linked Wallets</h1>
        </div>

        <div className="space-y-4">
          {linkedWallets.map((wallet) => (
            <Card key={wallet.id} className="p-4 border-none shadow-sm bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${wallet.color} flex items-center justify-center`}>
                  <Wallet size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{wallet.name}</h3>
                    {wallet.isConnected && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono">{wallet.address}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={18} />
              </Button>
            </Card>
          ))}

          <Link href="/connect-wallet">
            <Button className="w-full h-14 mt-4 bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2 font-medium transition-all">
              <Plus size={20} />
              Connect New Wallet
            </Button>
          </Link>
        </div>

        <div className="mt-8 px-2">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
              <LinkIcon size={16} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-1">About Linked Wallets</h4>
              <p className="text-blue-700 text-xs leading-relaxed">
                Linked wallets allow you to easily switch between different accounts for trading and withdrawals. You can manage all your connections here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
