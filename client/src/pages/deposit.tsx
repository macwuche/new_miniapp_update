import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronRight, Copy, CheckCircle2, CheckCircle, Check } from "lucide-react";
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
  const [depositAmount, setDepositAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSent = () => {
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedOption(null);
    setDepositAmount("");
  };

  const generateQRCodeUrl = (address: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
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
                data-testid={`deposit-option-${option.id}`}
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

        {/* Deposit Dialog */}
        <Dialog open={!!selectedOption && !showConfirmation} onOpenChange={(open) => !open && setSelectedOption(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white max-h-[90vh] overflow-y-auto">
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
            
            <div className="space-y-5 py-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Deposit Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-12 text-lg font-medium pr-16 rounded-xl text-gray-900 bg-white border-gray-200"
                    data-testid="deposit-amount-input"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                    USD
                  </span>
                </div>
              </div>

              {/* QR Code */}
              {selectedOption && (
                <div className="flex justify-center py-4">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100">
                    <img 
                      src={generateQRCodeUrl(selectedOption.address)} 
                      alt={`QR Code for ${selectedOption.symbol} address`}
                      className="w-48 h-48"
                      data-testid="deposit-qr-code"
                    />
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 break-all text-center font-mono text-sm text-gray-600 relative group">
                {selectedOption?.address}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 shadow-sm transition-all ${copied ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-white hover:bg-gray-100'}`}
                  onClick={() => selectedOption && copyToClipboard(selectedOption.address)}
                  data-testid="copy-address-btn"
                >
                  {copied ? (
                    <span className="flex items-center gap-1">
                      <Check size={14} />
                      <span className="text-xs font-medium">Copied</span>
                    </span>
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>

              {/* Important Notice */}
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
                onClick={handlePaymentSent}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                data-testid="confirm-payment-btn"
              >
                I Have Sent the Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={(open) => !open && handleCloseConfirmation()}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white">
            <div className="flex flex-col items-center text-center py-8 px-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Deposit Submitted!
              </h2>
              
              <p className="text-gray-500 mb-2">
                Your deposit of <span className="font-bold text-gray-900">${depositAmount} USD</span> via {selectedOption?.symbol} has been submitted for review.
              </p>
              
              <p className="text-sm text-gray-400 mb-6">
                Your balance will be updated once the admin approves your deposit. This usually takes a few minutes.
              </p>

              <Button 
                className="w-full h-12 rounded-xl font-bold text-base"
                onClick={handleCloseConfirmation}
                data-testid="close-confirmation-btn"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
