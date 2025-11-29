import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, Copy, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_OPTIONS = [
  { 
    id: "bitcoin", 
    name: "Bitcoin Payment", 
    symbol: "BTC", 
    network: "Bitcoin Network",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    color: "bg-orange-500",
    icon: "₿"
  },
  { 
    id: "tether", 
    name: "Tether Payment", 
    symbol: "USDT", 
    network: "TRC20",
    address: "TJ3a1y2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    color: "bg-green-500",
    icon: "₮"
  },
  { 
    id: "tron", 
    name: "Tron Payment", 
    symbol: "TRX", 
    network: "TRC20",
    address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    color: "bg-red-500",
    icon: "♦"
  },
  { 
    id: "ethereum", 
    name: "Ethereum Payment", 
    symbol: "ETH", 
    network: "ERC20",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    color: "bg-blue-600",
    icon: "Ξ"
  },
];

export default function Deposit() {
  const [selectedOption, setSelectedOption] = useState<typeof PAYMENT_OPTIONS[0] | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Address copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <MobileLayout>
      <div className="bg-white min-h-screen pb-20">
        <div className="px-6 pt-8 pb-4 sticky top-0 bg-white z-10 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold">Crypto Payment</h1>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-6">Select a cryptocurrency to make your deposit.</p>
          
          <div className="flex flex-col gap-4">
            {PAYMENT_OPTIONS.map((option) => (
              <button 
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.98] transition-all text-left group"
              >
                <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base mb-0.5">{option.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">
                      {option.network}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <Dialog open={!!selectedOption} onOpenChange={(open) => !open && setSelectedOption(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white">
            <DialogHeader className="flex flex-col items-center text-center pt-4 pb-2">
              {selectedOption && (
                <div className={`w-16 h-16 rounded-full ${selectedOption.color} flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4`}>
                  {selectedOption.icon}
                </div>
              )}
              <DialogTitle className="text-xl font-bold text-gray-900">
                Deposit {selectedOption?.symbol}
              </DialogTitle>
              <DialogDescription>
                Send only {selectedOption?.symbol} to this address
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 break-all text-center font-mono text-sm text-gray-600 relative group">
                {selectedOption?.address}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white shadow-sm hover:bg-gray-100"
                  onClick={() => selectedOption && copyToClipboard(selectedOption.address)}
                >
                  <Copy size={14} />
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-1">Important</p>
                  <p className="opacity-80">
                    Please ensure you are sending assets on the <span className="font-bold">{selectedOption?.network}</span>. Sending to the wrong network may result in permanent loss.
                  </p>
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-xl font-bold text-base shadow-lg"
                onClick={() => setSelectedOption(null)}
              >
                I Have Sent the Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
