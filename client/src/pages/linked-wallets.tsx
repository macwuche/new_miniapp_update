import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowLeft, Link as LinkIcon, Plus, Trash2, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LinkedWallets() {
  const [location, setLocation] = useLocation();
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnPath = params.get('returnTo');
    if (returnPath) {
      setReturnTo(returnPath);
    }
  }, []);

  // Fetch user from database
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
    staleTime: 1000 * 60,
  });

  // Fetch connected wallets from API
  const { data: wallets, isLoading } = useQuery({
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

  // Delete wallet mutation
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

  const handleSelectWallet = (wallet: any) => {
    if (returnTo) {
      localStorage.setItem('selected_withdrawal_method', 'connected');
      localStorage.setItem('selected_withdrawal_wallet', JSON.stringify(wallet));
      setLocation(`${returnTo}?action=withdraw`);
    }
  };

  const handleDeleteWallet = (e: React.MouseEvent, walletId: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this wallet?")) {
      deleteMutation.mutate(walletId);
    }
  };

  // Generate color based on wallet name
  const getWalletColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-orange-100 text-orange-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Truncate address for display
  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-gray-500 text-sm">Loading wallets...</p>
            </div>
          ) : wallets && wallets.length > 0 ? (
            wallets.map((wallet: any) => (
              <Card 
                key={wallet.id} 
                className={`p-4 border-none shadow-sm bg-white flex items-center justify-between ${returnTo ? 'cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all ring-1 ring-transparent hover:ring-blue-200' : ''}`}
                onClick={() => handleSelectWallet(wallet)}
                data-testid={`card-wallet-${wallet.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${getWalletColor(wallet.name)} flex items-center justify-center overflow-hidden`}>
                    {wallet.logo ? (
                      <img src={wallet.logo} alt={wallet.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Wallet size={24} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{wallet.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">{truncateAddress(wallet.address)}</p>
                    <p className="text-xs text-gray-400">
                      Connected {new Date(wallet.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {!returnTo && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
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
                )}
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={32} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">No Wallets Connected</h3>
              <p className="text-gray-500 text-sm">Connect a wallet to get started</p>
            </div>
          )}

          <Link href="/connect-wallet">
            <Button className="w-full h-14 mt-4 bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2 font-medium transition-all" data-testid="button-connect-wallet">
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
