import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LogOut, ArrowLeft, Wallet, Trash2, Plus, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, balanceAPI } from "@/lib/api";

interface WithdrawalGateway {
  id: number;
  name: string;
  minAmount: string;
  maxAmount: string;
  charges: string;
  chargesType: string;
  imageUrl: string | null;
  networkType: string;
  status: string;
  note: string | null;
}

interface CryptoAddress {
  id: number;
  userId: number;
  gatewayId: number | null;
  label: string;
  address: string;
  network: string;
  currency: string | null;
  createdAt: string;
}

export default function Withdraw() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // View states: 'gateways' | 'addresses' | 'add-address' | 'withdraw'
  const [view, setView] = useState<'gateways' | 'addresses' | 'add-address' | 'withdraw'>('gateways');
  const [selectedGateway, setSelectedGateway] = useState<WithdrawalGateway | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<CryptoAddress | null>(null);
  const [amount, setAmount] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [returnTo, setReturnTo] = useState<string | null>(null);

  // Get database user
  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register'],
    queryFn: async (): Promise<{ id: number } | null> => {
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const userData = tg.initDataUnsafe.user;
        return usersAPI.register({
          telegramId: userData.id.toString(),
          username: userData.username || userData.first_name,
          firstName: userData.first_name,
          lastName: userData.last_name,
          profilePicture: userData.photo_url
        }) as Promise<{ id: number }>;
      } else {
        return usersAPI.register({
          telegramId: null,
          username: "demo_user",
          firstName: "Demo",
          lastName: "User",
          profilePicture: null
        }) as Promise<{ id: number }>;
      }
    },
  });

  // Get user balance
  const { data: userBalance } = useQuery({
    queryKey: ['/api/balances', dbUser?.id],
    queryFn: async (): Promise<{ totalBalanceUsd?: string; availableBalanceUsd?: string } | null> => {
      if (!dbUser?.id) return null;
      return balanceAPI.getUser(dbUser.id) as Promise<{ totalBalanceUsd?: string; availableBalanceUsd?: string }>;
    },
    enabled: !!dbUser?.id,
  });

  // Get enabled withdrawal gateways
  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery<WithdrawalGateway[]>({
    queryKey: ['/api/withdrawal-gateways/enabled'],
    queryFn: async () => {
      const res = await fetch('/api/withdrawal-gateways/enabled');
      if (!res.ok) throw new Error('Failed to fetch gateways');
      return res.json();
    }
  });

  // Get user's saved addresses for selected gateway
  const { data: savedAddresses = [], isLoading: addressesLoading, refetch: refetchAddresses } = useQuery<CryptoAddress[]>({
    queryKey: ['/api/crypto-addresses', dbUser?.id, selectedGateway?.id],
    queryFn: async () => {
      if (!dbUser?.id || !selectedGateway?.id) return [];
      const res = await fetch(`/api/users/${dbUser.id}/crypto-addresses/gateway/${selectedGateway.id}`);
      if (!res.ok) throw new Error('Failed to fetch addresses');
      return res.json();
    },
    enabled: !!dbUser?.id && !!selectedGateway?.id
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnPath = params.get('returnTo');
    if (returnPath) {
      setReturnTo(returnPath);
    }
  }, []);

  const handleSelectGateway = (gateway: WithdrawalGateway) => {
    setSelectedGateway(gateway);
    setView('addresses');
  };

  const handleSelectAddress = (address: CryptoAddress) => {
    setSelectedAddress(address);
    setView('withdraw');
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim() || !newLabel.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both a label and wallet address.",
        variant: "destructive"
      });
      return;
    }

    if (!dbUser?.id || !selectedGateway) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${dbUser.id}/crypto-addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayId: selectedGateway.id,
          label: newLabel,
          address: newAddress,
          network: selectedGateway.networkType,
          currency: selectedGateway.name
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save address');
      }

      toast({
        title: "Address Saved",
        description: "Your wallet address has been saved successfully."
      });

      setNewAddress("");
      setNewLabel("");
      refetchAddresses();
      setView('addresses');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/crypto-addresses/${addressId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast({
        title: "Address Removed",
        description: "The wallet address has been removed."
      });
      refetchAddresses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove address.",
        variant: "destructive"
      });
    }
  };

  const calculateFee = (amt: number) => {
    if (!selectedGateway) return 0;
    const chargeRate = parseFloat(selectedGateway.charges);
    if (selectedGateway.chargesType === 'percentage') {
      return (amt * chargeRate) / 100;
    }
    return chargeRate;
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Enter Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive"
      });
      return;
    }

    if (!dbUser?.id || !selectedGateway || !selectedAddress) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    const minAmount = parseFloat(selectedGateway.minAmount);
    const maxAmount = parseFloat(selectedGateway.maxAmount);
    const availableBalance = parseFloat(userBalance?.availableBalanceUsd || "0");

    if (withdrawAmount < minAmount) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal is $${minAmount.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    if (withdrawAmount > maxAmount) {
      toast({
        title: "Amount Too High",
        description: `Maximum withdrawal is $${maxAmount.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You can only withdraw up to $${availableBalance.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: dbUser.id,
          amount: amount,
          currency: selectedGateway.name,
          method: 'crypto_address',
          destinationAddress: selectedAddress.address,
          gatewayId: selectedGateway.id,
          cryptoAddressId: selectedAddress.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create withdrawal');
      }

      const fee = calculateFee(withdrawAmount);
      const netAmount = withdrawAmount - fee;

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal of $${withdrawAmount.toFixed(2)} (receiving $${netAmount.toFixed(2)} after fees) is pending approval.`
      });

      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
      // Reset and go back
      setAmount("");
      setView('gateways');
      setSelectedGateway(null);
      setSelectedAddress(null);
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal request.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (view === 'withdraw') {
      setView('addresses');
      setSelectedAddress(null);
    } else if (view === 'add-address') {
      setView('addresses');
    } else if (view === 'addresses') {
      setView('gateways');
      setSelectedGateway(null);
    } else {
      window.history.back();
    }
  };

  // Empty state - no withdrawal methods available
  if (!gatewaysLoading && gateways.length === 0) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
          <div className="mb-8 pt-2">
            <div 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <LogOut className="text-white" size={40} strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              No Withdrawal Methods
            </h1>

            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
              There are currently no withdrawal methods available. Please check back later or contact support.
            </p>

            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // View: Select withdrawal gateway
  if (view === 'gateways') {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Withdraw Funds</h1>
            <div className="w-10" />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start mb-6">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-blue-700 leading-relaxed font-medium">
                Available Balance: ${parseFloat(userBalance?.availableBalanceUsd || "0").toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Select a withdrawal method below
              </p>
            </div>
          </div>

          {gatewaysLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {gateways.map((gateway) => (
                <Card 
                  key={gateway.id}
                  className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleSelectGateway(gateway)}
                  data-testid={`card-gateway-${gateway.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {gateway.imageUrl ? (
                          <img src={gateway.imageUrl} alt={gateway.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <Wallet className="text-gray-500" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{gateway.name}</h3>
                        <p className="text-xs text-gray-500">
                          {gateway.networkType} • Fee: {gateway.charges}{gateway.chargesType === 'percentage' ? '%' : ' USD'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Min: ${parseFloat(gateway.minAmount).toFixed(2)} - Max: ${parseFloat(gateway.maxAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" size={20} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // View: Select or add wallet address
  if (view === 'addresses') {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{selectedGateway?.name}</h1>
            <div className="w-10" />
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 mb-6 text-white">
            <div className="flex items-center gap-3">
              {selectedGateway?.imageUrl && (
                <img src={selectedGateway.imageUrl} alt={selectedGateway.name} className="w-10 h-10 object-contain" />
              )}
              <div>
                <p className="text-sm opacity-80">Withdrawal Method</p>
                <p className="font-bold">{selectedGateway?.name} ({selectedGateway?.networkType})</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 font-medium">Your Saved Addresses</p>

          {addressesLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="text-gray-400" size={28} />
              </div>
              <p className="text-gray-500 mb-6">No saved addresses for {selectedGateway?.name}</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                onClick={() => setView('add-address')}
                data-testid="button-add-first-address"
              >
                <Plus size={18} className="mr-2" />
                Add Wallet Address
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <Card 
                  key={addr.id}
                  className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => handleSelectAddress(addr)}
                  data-testid={`card-address-${addr.id}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <div className="flex items-center justify-between">
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900">{addr.label}</h3>
                      <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">
                        {addr.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        data-testid={`button-delete-address-${addr.id}`}
                      >
                        <Trash2 size={18} />
                      </Button>
                      <ChevronRight className="text-gray-300 group-hover:text-gray-500" size={20} />
                    </div>
                  </div>
                </Card>
              ))}

              <Button 
                className="w-full h-14 mt-4 bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                onClick={() => setView('add-address')}
                data-testid="button-add-another-address"
              >
                <Plus size={20} />
                Add Another Address
              </Button>
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // View: Add new wallet address
  if (view === 'add-address') {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Add Address</h1>
            <div className="w-10" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              {selectedGateway?.imageUrl && (
                <img src={selectedGateway.imageUrl} alt={selectedGateway.name} className="w-10 h-10 object-contain" />
              )}
              <div>
                <p className="font-bold text-gray-900">{selectedGateway?.name}</p>
                <p className="text-xs text-gray-500">{selectedGateway?.networkType}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Address Label</Label>
              <Input 
                id="label"
                placeholder="e.g., My Main Wallet"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                data-testid="input-address-label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input 
                id="address"
                placeholder={`Enter your ${selectedGateway?.name} address`}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="font-mono text-sm"
                data-testid="input-wallet-address"
              />
            </div>

            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              onClick={handleAddAddress}
              disabled={isSubmitting}
              data-testid="button-save-address"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // View: Withdrawal form
  if (view === 'withdraw') {
    const withdrawAmount = parseFloat(amount) || 0;
    const fee = calculateFee(withdrawAmount);
    const netAmount = withdrawAmount - fee;
    const availableBalance = parseFloat(userBalance?.availableBalanceUsd || "0");

    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Withdraw</h1>
            <div className="w-10" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
            {/* Selected method and address */}
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {selectedGateway?.imageUrl && (
                  <img src={selectedGateway.imageUrl} alt={selectedGateway.name} className="w-8 h-8 object-contain" />
                )}
                <div>
                  <p className="font-bold text-gray-900">{selectedGateway?.name}</p>
                  <p className="text-xs text-gray-500">{selectedGateway?.networkType}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Sending to</p>
                <p className="font-medium text-gray-900">{selectedAddress?.label}</p>
                <p className="text-xs text-gray-500 font-mono truncate">{selectedAddress?.address}</p>
              </div>
            </div>

            {/* Balance info */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600">Available Balance</p>
              <p className="text-xl font-bold text-blue-700">${availableBalance.toFixed(2)}</p>
            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg h-14"
                data-testid="input-withdraw-amount"
              />
              <p className="text-xs text-gray-500">
                Min: ${parseFloat(selectedGateway?.minAmount || "0").toFixed(2)} | 
                Max: ${parseFloat(selectedGateway?.maxAmount || "0").toFixed(2)}
              </p>
            </div>

            {/* Fee breakdown */}
            {withdrawAmount > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Withdrawal Amount</span>
                  <span className="font-medium">${withdrawAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee ({selectedGateway?.charges}{selectedGateway?.chargesType === 'percentage' ? '%' : ' USD'})</span>
                  <span className="font-medium text-red-500">-${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">You'll Receive</span>
                  <span className="font-bold text-green-600">${netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base"
              onClick={handleWithdraw}
              disabled={isSubmitting || withdrawAmount <= 0}
              data-testid="button-confirm-withdraw"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Make Withdrawal"
              )}
            </Button>

            {selectedGateway?.note && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <p className="text-xs text-yellow-700">{selectedGateway.note}</p>
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return null;
}
