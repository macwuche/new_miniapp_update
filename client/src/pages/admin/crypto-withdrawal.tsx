import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface WithdrawalGateway {
  id: number;
  name: string;
  minAmount: string;
  maxAmount: string;
  charges: string;
  chargesType: string;
  imageUrl: string | null;
  networkType: string;
  status: 'enabled' | 'disabled';
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCryptoWithdrawal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<WithdrawalGateway | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    minAmount: '',
    maxAmount: '',
    charges: '',
    chargesType: 'percentage',
    imageUrl: '',
    networkType: '',
    status: 'enabled',
    note: ''
  });

  const { data: gateways = [], isLoading } = useQuery<WithdrawalGateway[]>({
    queryKey: ['/api/withdrawal-gateways'],
    queryFn: async () => {
      const res = await fetch('/api/withdrawal-gateways');
      if (!res.ok) throw new Error('Failed to fetch gateways');
      return res.json();
    }
  });

  const createGatewayMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/withdrawal-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create gateway');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-gateways'] });
      toast({ title: "Gateway Added", description: "New withdrawal method has been successfully added." });
      handleClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create withdrawal gateway.", variant: "destructive" });
    }
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/withdrawal-gateways/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update gateway');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-gateways'] });
      toast({ title: "Gateway Updated", description: "Withdrawal method has been successfully updated." });
      handleClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update withdrawal gateway.", variant: "destructive" });
    }
  });

  const deleteGatewayMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/withdrawal-gateways/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete gateway');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-gateways'] });
      toast({ title: "Gateway Deleted", description: "Withdrawal method has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete withdrawal gateway.", variant: "destructive" });
    }
  });

  const handleOpen = (gateway: WithdrawalGateway | null = null) => {
    if (gateway) {
      setEditingGateway(gateway);
      setFormData({
        name: gateway.name,
        minAmount: gateway.minAmount,
        maxAmount: gateway.maxAmount,
        charges: gateway.charges,
        chargesType: gateway.chargesType,
        imageUrl: gateway.imageUrl || '',
        networkType: gateway.networkType,
        status: gateway.status,
        note: gateway.note || ''
      });
    } else {
      setEditingGateway(null);
      setFormData({
        name: '',
        minAmount: '',
        maxAmount: '',
        charges: '',
        chargesType: 'percentage',
        imageUrl: '',
        networkType: '',
        status: 'enabled',
        note: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingGateway(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGateway) {
      updateGatewayMutation.mutate({ id: editingGateway.id, data: formData });
    } else {
      createGatewayMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this withdrawal gateway?')) {
      deleteGatewayMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Crypto Withdrawal Methods</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage cryptocurrency withdrawal options</p>
          </div>
        </div>
        <Button 
          onClick={() => handleOpen(null)}
          style={{ backgroundColor: '#6f42c1', color: 'white' }}
          data-testid="button-add-withdrawal-gateway"
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          Add Method
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>
              {editingGateway ? "Edit Withdrawal Method" : "Add New Withdrawal Method"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bitcoin, USDT TRC20" 
                required 
                data-testid="input-gateway-name"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Label htmlFor="minAmount">Minimum Amount ($)</Label>
                <Input 
                  id="minAmount" 
                  type="number"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  required 
                  data-testid="input-min-amount"
                />
              </div>

              <div>
                <Label htmlFor="maxAmount">Maximum Amount ($)</Label>
                <Input 
                  id="maxAmount" 
                  type="number"
                  step="0.01"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  required 
                  data-testid="input-max-amount"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Label htmlFor="charges">Charges</Label>
                <Input 
                  id="charges" 
                  type="number"
                  step="0.01"
                  value={formData.charges}
                  onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                  required 
                  data-testid="input-charges"
                />
              </div>

              <div>
                <Label htmlFor="chargesType">Charges Type</Label>
                <Select value={formData.chargesType} onValueChange={(value) => setFormData({ ...formData, chargesType: value })}>
                  <SelectTrigger data-testid="select-charges-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="networkType">Network Type</Label>
              <Input 
                id="networkType" 
                value={formData.networkType}
                onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                placeholder="e.g. BTC, TRC20, ERC20" 
                required 
                data-testid="input-network-type"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input 
                id="imageUrl" 
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..." 
                data-testid="input-image-url"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea 
                id="note" 
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Any additional information for users..."
                data-testid="input-note"
              />
            </div>

            <Button 
              type="submit" 
              style={{ backgroundColor: '#6f42c1', color: 'white', marginTop: '8px' }}
              disabled={createGatewayMutation.isPending || updateGatewayMutation.isPending}
              data-testid="button-save-gateway"
            >
              {createGatewayMutation.isPending || updateGatewayMutation.isPending 
                ? "Saving..." 
                : (editingGateway ? "Update Method" : "Add Method")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent style={{ padding: '0' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: '#6b7280' }}>Loading withdrawal methods...</p>
            </div>
          ) : gateways.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No withdrawal methods configured</p>
              <Button 
                onClick={() => handleOpen(null)}
                style={{ marginTop: '16px', backgroundColor: '#6f42c1', color: 'white' }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add First Method
              </Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateways.map((gateway) => (
                    <TableRow key={gateway.id}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {gateway.imageUrl && (
                            <img 
                              src={gateway.imageUrl} 
                              alt={gateway.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          )}
                          <span style={{ fontWeight: 500 }}>{gateway.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${parseFloat(gateway.minAmount).toFixed(2)} - ${parseFloat(gateway.maxAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {gateway.chargesType === 'percentage' 
                          ? `${gateway.charges}%` 
                          : `$${parseFloat(gateway.charges).toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{gateway.networkType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          style={{
                            backgroundColor: gateway.status === 'enabled' ? '#dcfce7' : '#fee2e2',
                            color: gateway.status === 'enabled' ? '#166534' : '#991b1b',
                            border: 'none'
                          }}
                        >
                          {gateway.status}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(gateway.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpen(gateway)}
                            data-testid={`button-edit-gateway-${gateway.id}`}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(gateway.id)}
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            data-testid={`button-delete-gateway-${gateway.id}`}
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
    </AdminLayout>
  );
}
