import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LogOut, ArrowLeft, Wallet, Trash2, Plus, AlertCircle, Loader2, ChevronRight, Link2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, balanceAPI } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface ConnectedWallet {
  id: number;
  userId: number;
  name: string;
  logo: string | null;
  address: string;
  walletTypeId: number | null;
  connectedAt: string;
}

interface LinkedWalletType {
  id: number;
  name: string;
  logo: string | null;
  minAmount: string;
  maxAmount: string;
  supportedCoins: string[];
  status: string;
}

export default function Withdraw() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // View states
  const [view, setView] = useState<'gateways' | 'addresses' | 'add-address' | 'withdraw' | 'linked-wallets' | 'linked-withdraw'>('gateways');
  const [selectedGateway, setSelectedGateway] = useState<WithdrawalGateway | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<CryptoAddress | null>(null);
  const [amount, setAmount] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [returnTo, setReturnTo] = useState<string | null>(null);
  
  // Linked wallet states
  const [selectedLinkedWallet, setSelectedLinkedWallet] = useState<ConnectedWallet | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [linkedWithdrawProgress, setLinkedWithdrawProgress] = useState(0);
  const [showLinkedSuccess, setShowLinkedSuccess] = useState(false);

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
        // Use consistent mock user data to match existing deposits/balances
        return usersAPI.register({
          telegramId: "123456789",
          username: "alextrader",
          firstName: "Alex",
          lastName: "Trader",
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

  // Get user's connected wallets for linked withdrawal
  const { data: connectedWallets = [], isLoading: walletsLoading } = useQuery<ConnectedWallet[]>({
    queryKey: ['/api/connected-wallets', dbUser?.id],
    queryFn: async () => {
      if (!dbUser?.id) return [];
      const res = await fetch(`/api/users/${dbUser.id}/connected-wallets`);
      if (!res.ok) throw new Error('Failed to fetch connected wallets');
      return res.json();
    },
    enabled: !!dbUser?.id
  });

  // Get enabled wallet types for coin options
  const { data: walletTypes = [] } = useQuery<LinkedWalletType[]>({
    queryKey: ['/api/linked-wallet-types/enabled'],
    queryFn: async () => {
      const res = await fetch('/api/linked-wallet-types/enabled');
      if (!res.ok) throw new Error('Failed to fetch wallet types');
      return res.json();
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnPath = params.get('returnTo');
    if (returnPath) {
      setReturnTo(returnPath);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const method = params.get('method');
    if (method === 'linked' && !walletsLoading && connectedWallets.length > 0) {
      setView('linked-wallets');
    }
  }, [connectedWallets, walletsLoading]);

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
    } else if (view === 'linked-withdraw') {
      setView('linked-wallets');
      setSelectedLinkedWallet(null);
      setSelectedCoin("");
      setAmount("");
    } else if (view === 'linked-wallets') {
      setView('gateways');
    } else {
      window.history.back();
    }
  };

  // Get supported coins from connected wallet's type
  const getWalletCoins = (wallet: ConnectedWallet): string[] => {
    if (!wallet.walletTypeId) return ["Bitcoin", "Ethereum", "USDT"];
    const walletType = walletTypes.find(wt => wt.id === wallet.walletTypeId);
    return walletType?.supportedCoins?.length ? walletType.supportedCoins : ["Bitcoin", "Ethereum", "USDT"];
  };

  // Get limits from wallet type
  const getWalletLimits = (wallet: ConnectedWallet): { min: number; max: number } => {
    if (!wallet.walletTypeId) return { min: 10, max: 10000 };
    const walletType = walletTypes.find(wt => wt.id === wallet.walletTypeId);
    return {
      min: parseFloat(walletType?.minAmount || "10"),
      max: parseFloat(walletType?.maxAmount || "10000")
    };
  };

  const handleLinkedWalletWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedCoin) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount and select a coin.",
        variant: "destructive"
      });
      return;
    }

    if (!dbUser?.id || !selectedLinkedWallet) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    const limits = getWalletLimits(selectedLinkedWallet);
    const availableBalance = parseFloat(userBalance?.availableBalanceUsd || "0");

    if (withdrawAmount < limits.min) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal is $${limits.min.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    if (withdrawAmount > limits.max) {
      toast({
        title: "Amount Too High",
        description: `Maximum withdrawal is $${limits.max.toFixed(2)}`,
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
    setLinkedWithdrawProgress(0);

    const interval = setInterval(() => {
      setLinkedWithdrawProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      setLinkedWithdrawProgress(100);

      try {
        const response = await fetch('/api/withdrawals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: dbUser.id,
            amount: amount,
            currency: selectedCoin,
            method: 'linked_wallet',
            destinationAddress: selectedLinkedWallet.address,
            connectedWalletId: selectedLinkedWallet.id
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create withdrawal');
        }

        setShowLinkedSuccess(true);

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
          
          setShowLinkedSuccess(false);
          setIsSubmitting(false);
          setAmount("");
          setSelectedCoin("");
          setSelectedLinkedWallet(null);
          setLinkedWithdrawProgress(0);
          setView('gateways');
        }, 2000);

      } catch (error: any) {
        setIsSubmitting(false);
        setLinkedWithdrawProgress(0);
        toast({
          title: "Withdrawal Failed",
          description: error.message || "Failed to process withdrawal request.",
          variant: "destructive"
        });
      }
    }, 10000);
  };

  // Empty state - no withdrawal methods available
  if (!gatewaysLoading && gateways.length === 0) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-8 pt-2">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
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

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              No Withdrawal Methods
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
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
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Linked Wallet Option */}
              {connectedWallets.length > 0 && (
                <Card 
                  className="p-4 border-2 border-purple-200 shadow-sm bg-gradient-to-r from-purple-50 to-white hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setView('linked-wallets')}
                  data-testid="card-linked-wallet"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        <Link2 className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Linked Wallet</h3>
                        <p className="text-xs text-purple-600 font-medium">
                          Withdraw to connected external wallet
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {connectedWallets.length} wallet{connectedWallets.length !== 1 ? 's' : ''} connected
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-purple-300 group-hover:text-purple-500 transition-colors" size={20} />
                  </div>
                </Card>
              )}

              {/* Crypto Gateways */}
              {gateways.map((gateway) => (
                <Card 
                  key={gateway.id}
                  className="p-4 border-none shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleSelectGateway(gateway)}
                  data-testid={`card-gateway-${gateway.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {gateway.imageUrl ? (
                          <img src={gateway.imageUrl} alt={gateway.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <Wallet className="text-gray-500 dark:text-gray-400" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{gateway.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {gateway.networkType} • Fee: {gateway.charges}{gateway.chargesType === 'percentage' ? '%' : ' USD'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Min: ${parseFloat(gateway.minAmount).toFixed(2)} - Max: ${parseFloat(gateway.maxAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-gray-500 dark:text-gray-400 transition-colors" size={20} />
                  </div>
                </Card>
              ))}

              {/* No connected wallets - show connect option */}
              {connectedWallets.length === 0 && (
                <Link href="/connect-wallet">
                  <Card 
                    className="p-4 border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-all cursor-pointer group"
                    data-testid="card-connect-wallet"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                          <Plus className="text-purple-500" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-purple-700">Connect External Wallet</h3>
                          <p className="text-xs text-purple-600">
                            Link Trust Wallet, MetaMask, or other wallets
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-purple-300 group-hover:text-purple-500 transition-colors" size={20} />
                    </div>
                  </Card>
                </Link>
              )}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // View: Select linked wallet
  if (view === 'linked-wallets') {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Linked Wallets</h1>
            <div className="w-10" />
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 items-start mb-6">
            <Link2 className="text-purple-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm text-purple-700 leading-relaxed font-medium">
                Select a connected wallet to withdraw funds
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Available: ${parseFloat(userBalance?.availableBalanceUsd || "0").toFixed(2)}
              </p>
            </div>
          </div>

          {walletsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {connectedWallets.map((wallet) => (
                <Card 
                  key={wallet.id}
                  className="p-4 border-none shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedLinkedWallet(wallet);
                    setView('linked-withdraw');
                  }}
                  data-testid={`card-wallet-${wallet.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {wallet.logo ? (
                        <img src={wallet.logo} alt={wallet.name} className="w-12 h-12 rounded-xl object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                          <Wallet className="text-purple-600" size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{wallet.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[180px]">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-gray-500 dark:text-gray-400 transition-colors" size={20} />
                  </div>
                </Card>
              ))}

              <Link href="/connect-wallet">
                <Button 
                  className="w-full h-14 mt-4 bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 text-purple-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                  data-testid="button-connect-new-wallet"
                >
                  <Plus size={20} />
                  Connect Another Wallet
                </Button>
              </Link>
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // View: Linked wallet withdrawal form with preloader
  if (view === 'linked-withdraw') {
    const availableBalance = parseFloat(userBalance?.availableBalanceUsd || "0");
    const limits = selectedLinkedWallet ? getWalletLimits(selectedLinkedWallet) : { min: 10, max: 10000 };
    const coins = selectedLinkedWallet ? getWalletCoins(selectedLinkedWallet) : [];

    // Show preloader during submission
    if (isSubmitting) {
      return (
        <MobileLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-6">
            {showLinkedSuccess ? (
              <div className="text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-14 h-14 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Withdrawal Submitted!</h2>
                <p className="text-gray-500 dark:text-gray-400">Your withdrawal request is pending approval.</p>
              </div>
            ) : (
              <div className="text-center w-full max-w-xs">
                {selectedLinkedWallet?.logo ? (
                  <img 
                    src={selectedLinkedWallet.logo} 
                    alt={selectedLinkedWallet.name}
                    className="w-20 h-20 rounded-2xl mx-auto mb-6 animate-pulse object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Wallet className="w-10 h-10 text-purple-600" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Withdrawal</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2">${parseFloat(amount).toFixed(2)} in {selectedCoin}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Please wait while we process your request...</p>
                
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all duration-100 ease-linear"
                      style={{ width: `${linkedWithdrawProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{linkedWithdrawProgress}% Complete</p>
                </div>
              </div>
            )}
          </div>
        </MobileLayout>
      );
    }

    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw to Wallet</h1>
            <div className="w-10" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6">
            {/* Selected wallet */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              {selectedLinkedWallet?.logo ? (
                <img src={selectedLinkedWallet.logo} alt={selectedLinkedWallet.name} className="w-12 h-12 rounded-xl object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Wallet className="text-purple-600" size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white">{selectedLinkedWallet?.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                  {selectedLinkedWallet?.address}
                </p>
              </div>
            </div>

            {/* Balance info */}
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600">Available Balance</p>
              <p className="text-xl font-bold text-purple-700">${availableBalance.toFixed(2)}</p>
            </div>

            {/* Coin selection */}
            <div className="space-y-2">
              <Label>Select Coin</Label>
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger data-testid="select-coin">
                  <SelectValue placeholder="Choose a coin to receive" />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((coin) => (
                    <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                data-testid="input-amount"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Min: ${limits.min.toFixed(2)} | Max: ${limits.max.toFixed(2)}
              </p>
            </div>

            {/* Summary */}
            {parseFloat(amount) > 0 && selectedCoin && (
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Coin</span>
                  <span className="font-medium">{selectedCoin}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white">Receiving</span>
                  <span className="font-bold text-purple-600">${parseFloat(amount).toFixed(2)} in {selectedCoin}</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-base"
              onClick={handleLinkedWalletWithdraw}
              disabled={!amount || parseFloat(amount) <= 0 || !selectedCoin}
              data-testid="button-withdraw"
            >
              Make Withdrawal
            </Button>

            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Withdrawal requests are processed within 24 hours
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // View: Select or add wallet address
  if (view === 'addresses') {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGateway?.name}</h1>
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

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">Your Saved Addresses</p>

          {addressesLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Wallet className="text-gray-400 dark:text-gray-500" size={28} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">No saved addresses for {selectedGateway?.name}</p>
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
                  className="p-4 border-none shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => handleSelectAddress(addr)}
                  data-testid={`card-address-${addr.id}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <div className="flex items-center justify-between">
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900 dark:text-white">{addr.label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[200px]">
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
                      <ChevronRight className="text-gray-300 group-hover:text-gray-500 dark:text-gray-400" size={20} />
                    </div>
                  </div>
                </Card>
              ))}

              <Button 
                className="w-full h-14 mt-4 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add Address</h1>
            <div className="w-10" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              {selectedGateway?.imageUrl && (
                <img src={selectedGateway.imageUrl} alt={selectedGateway.name} className="w-10 h-10 object-contain" />
              )}
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{selectedGateway?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedGateway?.networkType}</p>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col p-6 pb-24">
          <div className="mb-6 pt-2 flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
              onClick={goBack}
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw</h1>
            <div className="w-10" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6">
            {/* Selected method and address */}
            <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {selectedGateway?.imageUrl && (
                  <img src={selectedGateway.imageUrl} alt={selectedGateway.name} className="w-8 h-8 object-contain" />
                )}
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedGateway?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedGateway?.networkType}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sending to</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedAddress?.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{selectedAddress?.address}</p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Min: ${parseFloat(selectedGateway?.minAmount || "0").toFixed(2)} | 
                Max: ${parseFloat(selectedGateway?.maxAmount || "0").toFixed(2)}
              </p>
            </div>

            {/* Fee breakdown */}
            {withdrawAmount > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Withdrawal Amount</span>
                  <span className="font-medium">${withdrawAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Fee ({selectedGateway?.charges}{selectedGateway?.chargesType === 'percentage' ? '%' : ' USD'})</span>
                  <span className="font-medium text-red-500">-${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-white">You'll Receive</span>
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
