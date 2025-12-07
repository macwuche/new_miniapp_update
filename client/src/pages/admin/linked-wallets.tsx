import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Wallet, Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface LinkedWalletType {
  id: number;
  name: string;
  logo: string | null;
  minAmount: string;
  maxAmount: string;
  supportedCoins: string[];
  preloaderTime: number;
  status: string;
  createdAt: string;
}

const DEFAULT_COINS = ["Bitcoin", "Ethereum", "USDT", "TRON", "BNB", "Solana"];

export default function AdminLinkedWallets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<LinkedWalletType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    minAmount: "",
    maxAmount: "",
    supportedCoins: [] as string[],
    preloaderTime: "5",
    status: "enabled"
  });

  const { data: walletTypes = [], isLoading } = useQuery<LinkedWalletType[]>({
    queryKey: ['/api/linked-wallet-types'],
    queryFn: async () => {
      const res = await fetch('/api/linked-wallet-types');
      if (!res.ok) throw new Error('Failed to fetch wallet types');
      return res.json();
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      minAmount: "",
      maxAmount: "",
      supportedCoins: [],
      preloaderTime: "5",
      status: "enabled"
    });
    setEditingWallet(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (walletType: LinkedWalletType) => {
    setEditingWallet(walletType);
    setFormData({
      name: walletType.name,
      logo: walletType.logo || "",
      minAmount: walletType.minAmount,
      maxAmount: walletType.maxAmount,
      supportedCoins: walletType.supportedCoins || [],
      preloaderTime: (walletType.preloaderTime || 5).toString(),
      status: walletType.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.minAmount || !formData.maxAmount) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const minAmt = parseFloat(formData.minAmount);
    const maxAmt = parseFloat(formData.maxAmount);

    if (isNaN(minAmt) || minAmt < 0) {
      toast({
        title: "Invalid Minimum Amount",
        description: "Please enter a valid minimum amount (0 or greater).",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(maxAmt) || maxAmt <= 0) {
      toast({
        title: "Invalid Maximum Amount",
        description: "Please enter a valid maximum amount (greater than 0).",
        variant: "destructive"
      });
      return;
    }

    if (minAmt >= maxAmt) {
      toast({
        title: "Invalid Amount Range",
        description: "Maximum amount must be greater than minimum amount.",
        variant: "destructive"
      });
      return;
    }

    if (formData.supportedCoins.length === 0) {
      toast({
        title: "No Coins Selected",
        description: "Please select at least one supported coin.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingWallet 
        ? `/api/linked-wallet-types/${editingWallet.id}`
        : '/api/linked-wallet-types';
      
      const method = editingWallet ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save wallet type');

      toast({
        title: editingWallet ? "Wallet Type Updated" : "Wallet Type Created",
        description: `${formData.name} has been ${editingWallet ? 'updated' : 'created'} successfully.`
      });

      queryClient.invalidateQueries({ queryKey: ['/api/linked-wallet-types'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet type. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this wallet type?")) return;

    try {
      const res = await fetch(`/api/linked-wallet-types/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      toast({
        title: "Wallet Type Deleted",
        description: "The wallet type has been deleted successfully."
      });

      queryClient.invalidateQueries({ queryKey: ['/api/linked-wallet-types'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete wallet type.",
        variant: "destructive"
      });
    }
  };

  const toggleCoin = (coin: string) => {
    setFormData(prev => ({
      ...prev,
      supportedCoins: prev.supportedCoins.includes(coin)
        ? prev.supportedCoins.filter(c => c !== coin)
        : [...prev.supportedCoins, coin]
    }));
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/withdrawals">
            <Button variant="ghost" size="sm" data-testid="button-back-withdrawals">
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Back
            </Button>
          </Link>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Linked Wallet Types</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage wallet options users can connect (Trust Wallet, MetaMask, etc.)</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin/wallet-phrases">
            <Button variant="outline" size="sm" data-testid="button-view-phrases">
              <Eye size={16} style={{ marginRight: '8px' }} />
              View Wallet Phrases
            </Button>
          </Link>
          <Button onClick={openAddDialog} data-testid="button-add-wallet-type">
            <Plus size={16} style={{ marginRight: '8px' }} />
            Add Wallet Type
          </Button>
        </div>
      </div>

      <Card>
        <CardContent style={{ padding: '0' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: '#6b7280' }} />
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading wallet types...</p>
            </div>
          ) : walletTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
              <Wallet size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No wallet types configured</p>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                Add wallet types like Trust Wallet, MetaMask, Phantom for users to connect
              </p>
              <Button onClick={openAddDialog} style={{ marginTop: '16px' }} data-testid="button-add-first-wallet-type">
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add First Wallet Type
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Min Amount</TableHead>
                    <TableHead>Max Amount</TableHead>
                    <TableHead>Supported Coins</TableHead>
                    <TableHead>Preloader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletTypes.map((wallet) => (
                    <TableRow key={wallet.id} data-testid={`row-wallet-type-${wallet.id}`}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {wallet.logo ? (
                            <img 
                              src={wallet.logo} 
                              alt={wallet.name} 
                              style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                          ) : (
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Wallet size={16} style={{ color: '#9ca3af' }} />
                            </div>
                          )}
                          <span style={{ fontWeight: 500 }}>{wallet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>${parseFloat(wallet.minAmount).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(wallet.maxAmount).toFixed(2)}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(wallet.supportedCoins || []).slice(0, 3).map((coin) => (
                            <Badge key={coin} variant="secondary" style={{ fontSize: '10px' }}>{coin}</Badge>
                          ))}
                          {(wallet.supportedCoins || []).length > 3 && (
                            <Badge variant="outline" style={{ fontSize: '10px' }}>+{wallet.supportedCoins.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{wallet.preloaderTime || 5}s</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={wallet.status === 'enabled' ? 'default' : 'secondary'}>
                          {wallet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDialog(wallet)}
                            data-testid={`button-edit-wallet-${wallet.id}`}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(wallet.id)}
                            style={{ color: '#ef4444' }}
                            data-testid={`button-delete-wallet-${wallet.id}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWallet ? 'Edit Wallet Type' : 'Add Wallet Type'}</DialogTitle>
            <DialogDescription>
              Configure a wallet option that users can connect to withdraw funds
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Wallet Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Trust Wallet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-wallet-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                data-testid="input-wallet-logo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Min Amount (USD) *</Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="10.00"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  data-testid="input-min-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Max Amount (USD) *</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="10000.00"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  data-testid="input-max-amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supported Coins</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                {DEFAULT_COINS.map((coin) => (
                  <Badge
                    key={coin}
                    variant={formData.supportedCoins.includes(coin) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCoin(coin)}
                    data-testid={`badge-coin-${coin}`}
                  >
                    {coin}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preloaderTime">Preloader Time (seconds)</Label>
              <Input
                id="preloaderTime"
                type="number"
                placeholder="5"
                min="1"
                max="60"
                value={formData.preloaderTime}
                onChange={(e) => setFormData({ ...formData, preloaderTime: e.target.value })}
                data-testid="input-preloader-time"
              />
              <p className="text-xs text-gray-500">
                Duration of loading animation when users connect this wallet (1-60 seconds)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-save-wallet-type">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingWallet ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
