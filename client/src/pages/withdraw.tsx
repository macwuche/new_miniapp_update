import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LogOut, ArrowLeft, Wallet, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI, balanceAPI } from "@/lib/api";
import bitcoinLogo from "@/assets/bitcoin.png";

interface WithdrawWallet {
  id: number;
  email: string;
  currency: string;
  address: string;
  createdAt: string;
  image?: string; // Added for compatibility
  name?: string; // Added for compatibility
}

export default function Withdraw() {
  const [wallets, setWallets] = useState<WithdrawWallet[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WithdrawWallet | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [location, setLocation] = useLocation();
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  useEffect(() => {
    const savedWallets = localStorage.getItem("withdraw_wallets");
    if (savedWallets) {
      const parsedWallets = JSON.parse(savedWallets);
      const walletsWithImages = parsedWallets.map((w: any) => ({
        ...w,
        image: w.currency === 'BTC' ? bitcoinLogo : undefined,
        name: `${w.currency} Wallet`
      }));
      setWallets(walletsWithImages);
    }
    setIsLoaded(true);

    const params = new URLSearchParams(window.location.search);
    const returnPath = params.get('returnTo');
    if (returnPath) {
      setReturnTo(returnPath);
    }
  }, []);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const updatedWallets = wallets.filter(w => w.id !== id);
    setWallets(updatedWallets);
    localStorage.setItem("withdraw_wallets", JSON.stringify(updatedWallets));
    
    toast({
      title: "Wallet Removed",
      description: "The wallet address has been removed from your account."
    });
  };

  const handleWalletClick = (wallet: WithdrawWallet) => {
    if (returnTo) {
      localStorage.setItem('selected_withdrawal_method', 'crypto');
      localStorage.setItem('selected_withdrawal_wallet', JSON.stringify(wallet));
      setLocation(`${returnTo}?action=withdraw`);
      return;
    }
    
    setSelectedWallet(wallet);
    setWithdrawalOpen(true);
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

    if (!dbUser?.id) {
      toast({
        title: "Error",
        description: "User not found. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    const availableBalance = parseFloat(userBalance?.availableBalanceUsd || "0");
    const withdrawAmount = parseFloat(amount);

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
          currency: selectedWallet?.currency || 'USD',
          method: 'crypto_address',
          destinationAddress: selectedWallet?.address,
          walletId: selectedWallet?.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create withdrawal');
      }

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal of $${amount} to ${selectedWallet?.address.slice(0, 8)}... is pending approval.`
      });

      // Invalidate balance query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      
      setWithdrawalOpen(false);
      setAmount("");
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

  if (!isLoaded) return null;

  // Empty State
  if (wallets.length === 0) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
          <div className="mb-8 pt-2">
            <div 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={20} />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
            <div className="w-24 h-24 bg-blue-400 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
              <LogOut className="text-white" size={40} strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              You're almost ready to withdraw!
            </h1>

            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
              To make a withdraw, please add a withdraw account from your profile (withdraw accounts).
            </p>

            <div className="w-full max-w-xs space-y-6">
              <Link href="/withdraw/accounts">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-lg shadow-blue-600/20">
                  Add Withdraw Account
                </Button>
              </Link>

              <Link href="/">
                <button className="text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-24 left-0 right-0 text-center px-6">
            <p className="text-xs text-gray-400">
              Please feel free to contact us if you have any question.
            </p>
          </div>

        </div>
      </MobileLayout>
    );
  }

  // List View
  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 pb-24">
        <div className="mb-6 pt-2 flex items-center justify-between">
          <div 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer shadow-sm transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Withdrawal Wallets</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-blue-700 leading-relaxed">
              Select a wallet below to withdraw your funds. You can add multiple withdrawal addresses.
            </p>
          </div>

          {wallets.map((wallet) => (
            <Card 
              key={wallet.id} 
              className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
              onClick={() => handleWalletClick(wallet)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-600 font-bold overflow-hidden">
                    {wallet.currency === "BTC" ? (
                      <img src={bitcoinLogo} alt="Bitcoin" className="w-8 h-8 object-contain" />
                    ) : (
                      <span>{wallet.currency}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{wallet.currency} Wallet</h3>
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">
                        {wallet.currency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono truncate max-w-[180px]">
                      {wallet.address}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  onClick={(e) => handleDelete(wallet.id, e)}
                  disabled={!!returnTo}
                >
                  <Trash2 size={18} className={returnTo ? "opacity-20" : ""} />
                </Button>
              </div>
            </Card>
          ))}

          <Link href="/withdraw/accounts">
            <Button className="w-full h-14 mt-4 bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2 font-medium transition-all">
              <Plus size={20} />
              Add Another Wallet
            </Button>
          </Link>
        </div>

        {/* Withdrawal Dialog */}
        <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
          <DialogContent className="sm:max-w-md rounded-xl w-[95%] bg-white">
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw to <span className="font-mono text-gray-700 font-bold">{selectedWallet?.address.slice(0, 8)}...</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Available Balance</p>
                <p className="text-lg font-bold text-gray-900">
                  ${parseFloat(userBalance?.availableBalanceUsd || "0").toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                  data-testid="input-withdraw-amount"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-row gap-2 justify-end">
              <Button variant="outline" onClick={() => setWithdrawalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
                data-testid="button-confirm-withdraw"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Withdraw"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
