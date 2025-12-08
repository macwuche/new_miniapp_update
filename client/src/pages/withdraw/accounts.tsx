import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet, Trash2, Plus, CreditCard, Copy, Loader2, LinkIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTelegram } from "@/lib/telegram-mock";

interface ConnectedWallet {
  id: number;
  userId: number;
  walletTypeId: number;
  name: string;
  logo: string | null;
  seedPhrase: string;
  connectedAt: string;
  isDeleted?: boolean;
}

interface CryptoAddress {
  id: number;
  userId: number;
  gatewayId: number;
  label: string;
  address: string;
  network: string;
  createdAt: string;
}

const WALLET_COLORS: { [key: string]: string } = {
  "Trust Wallet": "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  "MetaMask": "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
  "Coinbase": "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  "Phantom": "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
  "Binance Web3": "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
  "OKX Wallet": "bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400",
  "Wallet Connect": "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
};

export default function PaymentAccounts() {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [network, setNetwork] = useState("BTC");
  const [address, setAddress] = useState("");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: tgUser } = useTelegram();

  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register', tgUser?.id],
    queryFn: async () => {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: tgUser?.id?.toString() || null,
          username: tgUser?.username || 'demo_user',
          firstName: tgUser?.first_name || 'Demo',
          lastName: tgUser?.last_name || 'User',
          profilePicture: tgUser?.photo_url || null
        })
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: true,
  });

  const userId = dbUser?.id;

  const { data: connectedWallets = [], isLoading: loadingWallets } = useQuery<ConnectedWallet[]>({
    queryKey: [`/api/users/${userId}/connected-wallets`],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/users/${userId}/connected-wallets`);
      if (!res.ok) throw new Error('Failed to fetch connected wallets');
      const wallets = await res.json();
      return wallets.filter((w: ConnectedWallet) => !w.isDeleted);
    },
    enabled: !!userId,
  });

  const { data: cryptoAddresses = [], isLoading: loadingAddresses } = useQuery<CryptoAddress[]>({
    queryKey: [`/api/users/${userId}/crypto-addresses`],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/users/${userId}/crypto-addresses`);
      if (!res.ok) throw new Error('Failed to fetch crypto addresses');
      return res.json();
    },
    enabled: !!userId,
  });

  const handleAddAccount = async () => {
    if (!label || !address) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/crypto-addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          address,
          network,
          gatewayId: 1
        })
      });

      if (!res.ok) throw new Error('Failed to add address');

      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/crypto-addresses`] });
      
      toast({
        title: "Address Added",
        description: "Your withdrawal address has been successfully added."
      });
      
      setIsAddAccountOpen(false);
      setLabel("");
      setAddress("");
      setNetwork("BTC");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add withdrawal address.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      const res = await fetch(`/api/crypto-addresses/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete address');

      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/crypto-addresses`] });
      
      toast({
        title: "Address Deleted",
        description: "Withdrawal address removed successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

  const getWalletColor = (name: string): string => {
    return WALLET_COLORS[name] || "bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400";
  };

  const maskSeedPhrase = (phrase: string): string => {
    const words = phrase.split(' ');
    if (words.length > 2) {
      return `${words[0]} *** ${words[words.length - 1]}`;
    }
    return '***';
  };

  const isLoading = loadingWallets || loadingAddresses;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
        <div className="px-6 pt-8 pb-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="p-6 space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connected Wallets</h2>
                <Link href="/connect-wallet">
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 h-8">
                    <Plus size={16} className="mr-1" /> Connect
                  </Button>
                </Link>
              </div>
              
              {connectedWallets.length === 0 ? (
                <Card className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                  <div className="text-center space-y-2">
                    <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">No wallets connected</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      Connect an external wallet for linked withdrawals.
                    </p>
                  </div>
                </Card>
              ) : (
                connectedWallets.map((wallet) => (
                  <Card key={wallet.id} className="border-none shadow-sm bg-white dark:bg-slate-800" data-testid={`card-wallet-${wallet.id}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${getWalletColor(wallet.name)} flex items-center justify-center`}>
                          <Wallet size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">{wallet.name}</h3>
                            <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border-none text-[10px] h-5">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                            {maskSeedPhrase(wallet.seedPhrase)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Withdrawal Addresses</h2>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                  onClick={() => setIsAddAccountOpen(true)}
                  data-testid="button-add-address"
                >
                  <Plus size={16} className="mr-1" /> Add New
                </Button>
              </div>

              {cryptoAddresses.length === 0 ? (
                <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl p-6 shadow-sm">
                  <div className="text-center space-y-2">
                    <p className="text-amber-800 dark:text-amber-300 font-bold text-sm">No addresses added</p>
                    <p className="text-amber-700 dark:text-amber-400 text-xs">
                      Add crypto addresses to withdraw your funds securely.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {cryptoAddresses.map((addr) => (
                    <Card key={addr.id} className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-800" data-testid={`card-address-${addr.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">{addr.network}</h3>
                                <span className="text-xs text-gray-400 dark:text-gray-500">({addr.label})</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[150px] sm:max-w-[200px]">
                                  {addr.address}
                                </p>
                                <button onClick={() => copyToClipboard(addr.address)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg -mr-2 -mt-2"
                            onClick={() => handleDeleteAddress(addr.id)}
                            data-testid={`button-delete-address-${addr.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogContent className="sm:max-w-md rounded-xl w-[95%] p-0 overflow-hidden bg-white dark:bg-slate-800">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add Withdrawal Address</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter the details for your new withdrawal destination.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Label <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      placeholder="e.g. My Main Wallet" 
                      className="h-11 rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-blue-500"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      data-testid="input-label"
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Network
                    </Label>
                    <Select defaultValue="BTC" onValueChange={setNetwork}>
                      <SelectTrigger className="h-11 rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" data-testid="select-network">
                        <SelectValue placeholder="Network" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT-TRC20">USDT-TRC20</SelectItem>
                        <SelectItem value="USDT-ERC20">USDT-ERC20</SelectItem>
                        <SelectItem value="TRX">TRX</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Wallet Address <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    placeholder="Paste address here" 
                    className="h-11 rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-blue-500 font-mono text-sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    data-testid="input-address"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-gray-50 dark:border-slate-700 flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 h-11 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                onClick={() => setIsAddAccountOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 flex-1 rounded-lg shadow-sm"
                onClick={handleAddAccount}
                data-testid="button-save-address"
              >
                Save Address
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
