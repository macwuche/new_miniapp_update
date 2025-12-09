import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronRight, Copy, CheckCircle2, CheckCircle, Check, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";

interface PaymentGateway {
  id: number;
  name: string;
  minAmount: string;
  maxAmount: string;
  charges: string;
  chargesType: string;
  imageUrl: string | null;
  walletAddress: string;
  barcodeImage: string | null;
  networkType: string;
  status: 'enabled' | 'disabled';
  note: string | null;
}

const CRYPTO_ICONS: Record<string, { color: string; icon: string }> = {
  bitcoin: { color: "bg-orange-500", icon: "₿" },
  btc: { color: "bg-orange-500", icon: "₿" },
  ethereum: { color: "bg-blue-600", icon: "Ξ" },
  eth: { color: "bg-blue-600", icon: "Ξ" },
  tether: { color: "bg-green-500", icon: "₮" },
  usdt: { color: "bg-green-500", icon: "₮" },
  tron: { color: "bg-red-500", icon: "♦" },
  trx: { color: "bg-red-500", icon: "♦" },
  bnb: { color: "bg-yellow-500", icon: "B" },
  solana: { color: "bg-purple-500", icon: "◎" },
  sol: { color: "bg-purple-500", icon: "◎" },
  usdc: { color: "bg-blue-500", icon: "$" },
  default: { color: "bg-gray-500", icon: "₿" }
};

function getIconForGateway(name: string): { color: string; icon: string } {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(CRYPTO_ICONS)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return CRYPTO_ICONS.default;
}

export default function Deposit() {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useTelegram();

  const { data: gateways = [], isLoading } = useQuery<PaymentGateway[]>({
    queryKey: ['/api/payment-gateways/enabled'],
    queryFn: async () => {
      const res = await fetch('/api/payment-gateways/enabled');
      if (!res.ok) throw new Error('Failed to fetch payment gateways');
      return res.json();
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSent = async () => {
    if (!selectedGateway || !depositAmount || !user) return;

    setIsSubmitting(true);
    try {
      const userRes = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.id?.toString(),
          username: user.username || 'user',
          firstName: user.first_name,
          lastName: user.last_name,
          profilePicture: user.photo_url
        })
      });

      if (!userRes.ok) {
        throw new Error('Failed to register user');
      }

      const userData = await userRes.json();

      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          gatewayId: selectedGateway.id,
          amount: depositAmount,
          currency: 'USD',
          method: 'crypto_address',
          network: selectedGateway.networkType,
          address: selectedGateway.walletAddress
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create deposit');
      }

      setShowConfirmation(true);
      queryClient.invalidateQueries({ queryKey: ['/api/deposits'] });
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Error",
        description: "Failed to submit deposit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedGateway(null);
    setDepositAmount("");
  };

  const generateQRCodeUrl = (address: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
  };

  const calculateCharges = (amount: number, gateway: PaymentGateway): number => {
    const chargeRate = parseFloat(gateway.charges) || 0;
    if (gateway.chargesType === 'percentage') {
      return amount * (chargeRate / 100);
    }
    return chargeRate;
  };

  const getAmountAfterCharges = (amount: number, gateway: PaymentGateway): number => {
    const charges = calculateCharges(amount, gateway);
    return amount - charges;
  };

  const isAmountValid = (amount: string, gateway: PaymentGateway): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    const min = parseFloat(gateway.minAmount);
    const max = parseFloat(gateway.maxAmount);
    return numAmount >= min && numAmount <= max;
  };

  return (
    <MobileLayout>
      <div className="bg-white dark:bg-slate-900 min-h-screen pb-20">
        <div className="px-6 pt-8 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-gray-50 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Crypto Payment</h1>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Select a cryptocurrency to make your deposit.</p>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading payment methods...</p>
            </div>
          ) : gateways.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No payment methods available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {gateways.map((gateway) => {
                const iconConfig = getIconForGateway(gateway.name);
                return (
                  <button 
                    key={gateway.id}
                    data-testid={`deposit-option-${gateway.id}`}
                    onClick={() => setSelectedGateway(gateway)}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-800 active:scale-[0.98] transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-full ${iconConfig.color} flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                      {gateway.imageUrl ? (
                        <img src={gateway.imageUrl} alt={gateway.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        iconConfig.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-base mb-0.5">{gateway.name}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-md text-gray-600 dark:text-gray-300">
                          {gateway.networkType}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Min: ${parseFloat(gateway.minAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Deposit Dialog */}
        <Dialog open={!!selectedGateway && !showConfirmation} onOpenChange={(open) => !open && setSelectedGateway(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white dark:bg-slate-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-col items-center text-center pt-4 pb-2">
              {selectedGateway && (
                <div className={`w-16 h-16 rounded-full ${getIconForGateway(selectedGateway.name).color} flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4`}>
                  {selectedGateway.imageUrl ? (
                    <img src={selectedGateway.imageUrl} alt={selectedGateway.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    getIconForGateway(selectedGateway.name).icon
                  )}
                </div>
              )}
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Deposit via {selectedGateway?.name}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Network: {selectedGateway?.networkType}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deposit Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-12 text-lg font-medium pr-16 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                    data-testid="deposit-amount-input"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 dark:text-gray-400">
                    USD
                  </span>
                </div>
                {selectedGateway && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Min: ${parseFloat(selectedGateway.minAmount).toLocaleString()} - Max: ${parseFloat(selectedGateway.maxAmount).toLocaleString()}
                  </p>
                )}
                {selectedGateway && depositAmount && parseFloat(depositAmount) > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span>Charges ({selectedGateway.charges}{selectedGateway.chargesType === 'percentage' ? '%' : ' USD'}):</span>
                      <span className="font-medium">-${calculateCharges(parseFloat(depositAmount), selectedGateway).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mt-1 font-bold text-green-600 dark:text-green-400">
                      <span>You'll receive:</span>
                      <span>${getAmountAfterCharges(parseFloat(depositAmount), selectedGateway).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {selectedGateway && (
                <div className="flex justify-center py-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                    <img 
                      src={selectedGateway.barcodeImage || generateQRCodeUrl(selectedGateway.walletAddress)} 
                      alt={`QR Code for ${selectedGateway.name} address`}
                      className="w-48 h-48"
                      data-testid="deposit-qr-code"
                    />
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border border-gray-100 dark:border-slate-600 break-all text-center font-mono text-sm text-gray-600 dark:text-gray-300 relative group">
                {selectedGateway?.walletAddress}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 shadow-sm transition-all ${copied ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900' : 'bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500'}`}
                  onClick={() => selectedGateway && copyToClipboard(selectedGateway.walletAddress)}
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

              {/* Note from admin */}
              {selectedGateway?.note && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{selectedGateway.note}</p>
                </div>
              )}

              {/* Important Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl flex gap-3 items-start">
                <CheckCircle2 className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-bold mb-1">Important</p>
                  <p className="opacity-80">
                    Please ensure you are sending assets on the <span className="font-bold">{selectedGateway?.networkType}</span> network. Sending to the wrong network may result in permanent loss.
                  </p>
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-xl font-bold text-base shadow-lg"
                onClick={handlePaymentSent}
                disabled={!depositAmount || !selectedGateway || !isAmountValid(depositAmount, selectedGateway) || isSubmitting}
                data-testid="confirm-payment-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "I Have Sent the Payment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={(open) => !open && handleCloseConfirmation()}>
          <DialogContent className="sm:max-w-md rounded-2xl w-[90%] bg-white dark:bg-slate-800">
            <div className="flex flex-col items-center text-center py-8 px-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-6">
                <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Deposit Submitted!
              </h2>
              
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Your deposit of <span className="font-bold text-gray-900 dark:text-white">${depositAmount} USD</span> via {selectedGateway?.name} has been submitted for review.
              </p>
              
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
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
