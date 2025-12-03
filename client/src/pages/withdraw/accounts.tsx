import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Wallet, Trash2, Plus, CreditCard, Copy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock data for connected wallets (Web3)
const CONNECTED_WALLETS = [
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
  }
];

export default function PaymentAccounts() {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("BTC");
  const [address, setAddress] = useState("");
  const [withdrawWallets, setWithdrawWallets] = useState<any[]>([]);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("withdraw_wallets") || "[]");
    setWithdrawWallets(stored);
  }, []);

  const handleAddAccount = () => {
    if (!email || !address) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const existingWallets = JSON.parse(localStorage.getItem("withdraw_wallets") || "[]");
    
    // Check for duplicates
    const isDuplicate = existingWallets.some((w: any) => w.address === address);
    if (isDuplicate) {
      toast({
        title: "Duplicate Wallet",
        description: "This wallet address has already been added.",
        variant: "destructive"
      });
      return;
    }

    const newWallet = {
      id: Date.now(),
      email,
      currency,
      address,
      createdAt: new Date().toISOString()
    };

    const updatedWallets = [...existingWallets, newWallet];
    localStorage.setItem("withdraw_wallets", JSON.stringify(updatedWallets));
    setWithdrawWallets(updatedWallets);
    
    toast({
      title: "Account Added",
      description: "Your withdrawal account has been successfully added."
    });
    
    setIsAddAccountOpen(false);
    setEmail("");
    setAddress("");
    setCurrency("BTC");
  };

  const handleDelete = (id: number) => {
    const updatedWallets = withdrawWallets.filter(w => w.id !== id);
    localStorage.setItem("withdraw_wallets", JSON.stringify(updatedWallets));
    setWithdrawWallets(updatedWallets);
    toast({
      title: "Method Deleted",
      description: "Payment method removed successfully."
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Payment Methods</h1>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Section 1: Connected Web3 Wallets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Connected Wallets</h2>
              <Link href="/linked-wallets">
                <Button variant="ghost" size="sm" className="text-blue-600 h-8">Manage</Button>
              </Link>
            </div>
            
            {CONNECTED_WALLETS.map((wallet) => (
              <Card key={wallet.id} className="border-none shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${wallet.color} flex items-center justify-center`}>
                      <Wallet size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{wallet.name}</h3>
                        {wallet.isConnected && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px] h-5">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{wallet.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section 2: Withdrawal Addresses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Withdrawal Addresses</h2>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white h-8"
                onClick={() => setIsAddAccountOpen(true)}
              >
                <Plus size={16} className="mr-1" /> Add New
              </Button>
            </div>

            {withdrawWallets.length === 0 ? (
              <Card className="bg-amber-50 border border-amber-100 rounded-xl p-6 shadow-sm">
                <div className="text-center space-y-2">
                  <p className="text-amber-800 font-bold text-sm">No addresses added</p>
                  <p className="text-amber-700 text-xs">
                    Add crypto addresses to withdraw your funds securely.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {withdrawWallets.map((wallet) => (
                  <Card key={wallet.id} className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{wallet.currency} Address</h3>
                              <span className="text-xs text-gray-400">({wallet.email})</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500 font-mono truncate max-w-[150px] sm:max-w-[200px]">
                                {wallet.address}
                              </p>
                              <button onClick={() => copyToClipboard(wallet.address)} className="text-gray-400 hover:text-gray-600">
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg -mr-2 -mt-2"
                          onClick={() => handleDelete(wallet.id)}
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

        {/* Add Account Dialog */}
        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogContent className="sm:max-w-md rounded-xl w-[95%] p-0 overflow-hidden bg-white">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-gray-900">Add Withdrawal Method</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Enter the details for your new withdrawal destination.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Email & Currency Row */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Label / Email <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      placeholder="e.g. My Main Wallet" 
                      className="h-11 rounded-lg border-gray-200 bg-white focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Asset
                    </Label>
                    <Select defaultValue="BTC" onValueChange={setCurrency}>
                      <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white">
                        <SelectValue placeholder="Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="TRX">TRX</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Wallet Address
                  </Label>
                  <Input 
                    placeholder="Paste address here" 
                    className="h-11 rounded-lg border-gray-200 bg-white focus:border-blue-500 font-mono text-sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-gray-50 flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setIsAddAccountOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 flex-1 rounded-lg shadow-sm"
                onClick={handleAddAccount}
              >
                Save Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
