import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ShieldCheck, Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const WALLET_COLORS: { [key: string]: string } = {
  "Trust Wallet": "bg-blue-400",
  "MetaMask": "bg-orange-500",
  "Coinbase": "bg-blue-700",
  "Phantom": "bg-purple-500",
  "Binance Web3": "bg-yellow-500",
  "OKX Wallet": "bg-black",
  "Wallet Connect": "bg-blue-600",
  "Blockchain": "bg-purple-600",
};

const getWalletColor = (name: string): string => {
  return WALLET_COLORS[name] || "bg-gray-600";
};

const truncateAddress = (address: string) => {
  if (!address || address.length <= 12) return address || "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function WalletPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
          telegramId: "123456789",
          username: "alextrader",
          firstName: "Alex",
          lastName: "Trader",
          profilePicture: null
        }) as Promise<{ id: number }>;
      }
    },
    staleTime: 1000 * 60,
  });

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['/api/connected-wallets', dbUser?.id],
    queryFn: async () => {
      if (!dbUser?.id) return [];
      const res = await fetch(`/api/users/${dbUser.id}/connected-wallets`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!dbUser?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (walletId: number) => {
      const res = await fetch(`/api/wallets/${walletId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete wallet');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Wallet Removed",
        description: "The wallet has been disconnected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/connected-wallets', dbUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteWallet = (e: React.MouseEvent, walletId: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this wallet?")) {
      deleteMutation.mutate(walletId);
    }
  };

  const hasWallets = wallets && wallets.length > 0;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900 px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <Link href="/connect-wallet">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-10 px-4 text-sm shadow-md shadow-blue-600/20" data-testid="button-connect-new-wallet">
              <Plus size={16} className="mr-1" />
              Connect
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-wallet-title">Wallet</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Manage your crypto assets and connections.</p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading wallets...</p>
          </div>
        ) : !hasWallets ? (
          <div className="space-y-4">
            <Card className="p-6 border-none shadow-lg bg-white dark:bg-gray-800 overflow-hidden relative min-h-[300px] flex flex-col justify-center">
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
                     data-testid="button-connect-now"
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
          <div className="space-y-4">
            {wallets.map((wallet: any) => (
              <Card 
                key={wallet.id} 
                className="p-4 border-none shadow-sm bg-white dark:bg-gray-800 flex items-center justify-between"
                data-testid={`card-wallet-${wallet.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${getWalletColor(wallet.name)} flex items-center justify-center overflow-hidden shadow-sm`}>
                    {wallet.logo ? (
                      <img src={wallet.logo} alt={wallet.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-2xl font-bold text-white">{wallet.name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{wallet.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{truncateAddress(wallet.address)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Connected {new Date(wallet.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={(e) => handleDeleteWallet(e, wallet.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-wallet-${wallet.id}`}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </Button>
              </Card>
            ))}

            <Link href="/connect-wallet">
              <Button className="w-full h-14 mt-2 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl flex items-center justify-center gap-2 font-medium transition-all" data-testid="button-add-wallet">
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
