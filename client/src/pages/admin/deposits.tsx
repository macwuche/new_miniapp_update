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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

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
  createdAt: string;
  updatedAt: string;
}

export default function AdminDeposits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    minAmount: '',
    maxAmount: '',
    charges: '',
    chargesType: 'percentage',
    imageUrl: '',
    walletAddress: '',
    barcodeImage: '',
    networkType: '',
    status: 'enabled',
    note: ''
  });

  const { data: gateways = [], isLoading } = useQuery<PaymentGateway[]>({
    queryKey: ['/api/payment-gateways'],
    queryFn: async () => {
      const res = await fetch('/api/payment-gateways');
      if (!res.ok) throw new Error('Failed to fetch gateways');
      return res.json();
    }
  });

  const createGatewayMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/payment-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create gateway');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({ title: "Gateway Added", description: "New payment method has been successfully added." });
      handleClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create payment gateway.", variant: "destructive" });
    }
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/payment-gateways/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update gateway');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({ title: "Gateway Updated", description: "Payment method has been successfully updated." });
      handleClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update payment gateway.", variant: "destructive" });
    }
  });

  const deleteGatewayMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/payment-gateways/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete gateway');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({ title: "Gateway Deleted", description: "Payment method has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete payment gateway.", variant: "destructive" });
    }
  });

  const handleOpen = (gateway: PaymentGateway | null = null) => {
    if (gateway) {
      setEditingGateway(gateway);
      setFormData({
        name: gateway.name,
        minAmount: gateway.minAmount,
        maxAmount: gateway.maxAmount,
        charges: gateway.charges,
        chargesType: gateway.chargesType,
        imageUrl: gateway.imageUrl || '',
        walletAddress: gateway.walletAddress,
        barcodeImage: gateway.barcodeImage || '',
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
        walletAddress: '',
        barcodeImage: '',
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
    if (confirm('Are you sure you want to delete this payment gateway?')) {
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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Deposit Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage payment gateways and view deposit requests</p>
      </div>

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="mb-6 bg-white border border-gray-200">
          <TabsTrigger value="gateways" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            Manual Gateways
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            <Clock size={14} className="mr-1" /> Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            <CheckCircle2 size={14} className="mr-1" /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            <XCircle size={14} className="mr-1" /> Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gateways">
          <div className="mb-6">
            <Button 
              onClick={() => handleOpen(null)}
              className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium px-6 py-2 h-auto rounded-md text-sm"
            >
              <Plus size={16} className="mr-2" />
              Add Manual Gateway
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4 mb-4">
                  <DialogTitle className="text-lg font-normal text-gray-700">
                    {editingGateway ? "Edit Payment Method" : "Add New Payment Method"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-600 font-normal">Payment Method Name *</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Bitcoin, USDT, Ethereum" 
                      className="bg-white border-gray-200" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minAmount" className="text-gray-600 font-normal">Minimum Amount *</Label>
                      <Input 
                        id="minAmount" 
                        type="number"
                        step="0.01"
                        value={formData.minAmount}
                        onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                        placeholder="100"
                        className="bg-white border-gray-200" 
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAmount" className="text-gray-600 font-normal">Maximum Amount *</Label>
                      <Input 
                        id="maxAmount"
                        type="number"
                        step="0.01"
                        value={formData.maxAmount}
                        onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                        placeholder="1000000"
                        className="bg-white border-gray-200" 
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="charges" className="text-gray-600 font-normal">Charges *</Label>
                      <Input 
                        id="charges"
                        type="number"
                        step="0.01"
                        value={formData.charges}
                        onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                        placeholder="0"
                        className="bg-white border-gray-200" 
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chargesType" className="text-gray-600 font-normal">Charges Type *</Label>
                      <Select 
                        value={formData.chargesType} 
                        onValueChange={(value) => setFormData({ ...formData, chargesType: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-gray-600 font-normal">Image URL (Logo)</Label>
                      <Input 
                        id="imageUrl" 
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="bg-white border-gray-200" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="networkType" className="text-gray-600 font-normal">Network Type *</Label>
                      <Input 
                        id="networkType" 
                        value={formData.networkType}
                        onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                        placeholder="e.g., ERC20, TRC20, BTC Network" 
                        className="bg-white border-gray-200"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="walletAddress" className="text-gray-600 font-normal">Wallet Address *</Label>
                      <Input 
                        id="walletAddress" 
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                        placeholder="Enter the wallet address for deposits"
                        className="bg-white border-gray-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcodeImage" className="text-gray-600 font-normal">Barcode/QR Image URL (Optional)</Label>
                      <Input 
                        id="barcodeImage" 
                        value={formData.barcodeImage}
                        onChange={(e) => setFormData({ ...formData, barcodeImage: e.target.value })}
                        placeholder="https://example.com/qr-code.png"
                        className="bg-white border-gray-200" 
                      />
                      <p className="text-xs text-gray-500">Leave empty to auto-generate QR code from wallet address</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-gray-600 font-normal">Status *</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="note" className="text-gray-600 font-normal">Optional Note</Label>
                      <Textarea 
                        id="note" 
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Additional instructions for users (e.g., 'Payment may take up to 24 hours to process')" 
                        className="bg-white border-gray-200 min-h-[80px]" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="submit" 
                      className="bg-[#1a1f36] hover:bg-[#2c324c] text-white font-medium px-6 py-2 h-10 rounded-md"
                      disabled={createGatewayMutation.isPending || updateGatewayMutation.isPending}
                    >
                      {(createGatewayMutation.isPending || updateGatewayMutation.isPending) 
                        ? "Saving..." 
                        : (editingGateway ? "Update Method" : "Save Method")}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="rounded-sm border border-gray-100 overflow-x-auto min-h-[400px] bg-white">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading gateways...</div>
                  </div>
                ) : gateways.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>No payment gateways found</p>
                    <p className="text-sm mt-1">Click "Add Manual Gateway" to create one</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                        <TableHead className="font-bold text-gray-700 py-4 w-[180px]">Name</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4">Network</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4">Deposit Limit</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4">Charges</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4">Created At</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4">Status</TableHead>
                        <TableHead className="font-bold text-gray-700 py-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gateways.map((gateway) => (
                        <TableRow key={gateway.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-700 py-4">
                            <div className="flex items-center gap-2">
                              {gateway.imageUrl && (
                                <img src={gateway.imageUrl} alt={gateway.name} className="w-6 h-6 rounded" />
                              )}
                              {gateway.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 py-4">{gateway.networkType}</TableCell>
                          <TableCell className="text-gray-600 py-4 font-medium">
                            ${parseFloat(gateway.minAmount).toLocaleString()} - ${parseFloat(gateway.maxAmount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-gray-600 py-4">
                            {gateway.charges}{gateway.chargesType === 'percentage' ? '%' : ' USD'}
                          </TableCell>
                          <TableCell className="text-gray-600 py-4 text-sm">
                            {formatDate(gateway.createdAt)}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge 
                              className={`rounded-md px-2 py-1 text-xs font-normal ${
                                gateway.status === "enabled" 
                                  ? "bg-[#10b981] hover:bg-[#059669] text-white" 
                                  : "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                              }`}
                            >
                              {gateway.status === 'enabled' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                onClick={() => handleOpen(gateway)}
                                variant="ghost" 
                                size="sm"
                                className="text-[#3b82f6] hover:text-[#2563eb] hover:bg-blue-50 h-8 px-2"
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(gateway.id)}
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <PendingDeposits />
        </TabsContent>

        <TabsContent value="approved">
          <ApprovedDeposits />
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedDeposits />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function PendingDeposits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['/api/deposits', 'pending'],
    queryFn: async () => {
      const res = await fetch('/api/deposits?status=pending');
      if (!res.ok) throw new Error('Failed to fetch deposits');
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/deposits/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve deposit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deposits'] });
      toast({ title: "Deposit Approved", description: "User balance has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve deposit.", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/deposits/${id}/reject`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by admin' })
      });
      if (!res.ok) throw new Error('Failed to reject deposit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deposits'] });
      toast({ title: "Deposit Rejected", description: "The deposit has been rejected." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject deposit.", variant: "destructive" });
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading pending deposits...</div>;
  }

  if (deposits.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="py-12 text-center text-gray-500">
          <Clock size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No pending deposits</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="font-bold text-gray-700">User ID</TableHead>
              <TableHead className="font-bold text-gray-700">Amount</TableHead>
              <TableHead className="font-bold text-gray-700">Currency</TableHead>
              <TableHead className="font-bold text-gray-700">Network</TableHead>
              <TableHead className="font-bold text-gray-700">Date</TableHead>
              <TableHead className="font-bold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit: any) => (
              <TableRow key={deposit.id}>
                <TableCell>{deposit.userId}</TableCell>
                <TableCell className="font-medium">${parseFloat(deposit.amount).toLocaleString()}</TableCell>
                <TableCell>{deposit.currency}</TableCell>
                <TableCell>{deposit.network || 'N/A'}</TableCell>
                <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(deposit.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 size={14} className="mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(deposit.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ApprovedDeposits() {
  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['/api/deposits', 'approved'],
    queryFn: async () => {
      const res = await fetch('/api/deposits?status=approved');
      if (!res.ok) throw new Error('Failed to fetch deposits');
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading approved deposits...</div>;
  }

  if (deposits.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="py-12 text-center text-gray-500">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No approved deposits yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="font-bold text-gray-700">User ID</TableHead>
              <TableHead className="font-bold text-gray-700">Amount</TableHead>
              <TableHead className="font-bold text-gray-700">Currency</TableHead>
              <TableHead className="font-bold text-gray-700">Date</TableHead>
              <TableHead className="font-bold text-gray-700">Approved At</TableHead>
              <TableHead className="font-bold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit: any) => (
              <TableRow key={deposit.id}>
                <TableCell>{deposit.userId}</TableCell>
                <TableCell className="font-medium">${parseFloat(deposit.amount).toLocaleString()}</TableCell>
                <TableCell>{deposit.currency}</TableCell>
                <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{deposit.approvedAt ? new Date(deposit.approvedAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-white">Approved</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RejectedDeposits() {
  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['/api/deposits', 'rejected'],
    queryFn: async () => {
      const res = await fetch('/api/deposits?status=rejected');
      if (!res.ok) throw new Error('Failed to fetch deposits');
      return res.json();
    }
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading rejected deposits...</div>;
  }

  if (deposits.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="py-12 text-center text-gray-500">
          <XCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No rejected deposits</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="font-bold text-gray-700">User ID</TableHead>
              <TableHead className="font-bold text-gray-700">Amount</TableHead>
              <TableHead className="font-bold text-gray-700">Currency</TableHead>
              <TableHead className="font-bold text-gray-700">Date</TableHead>
              <TableHead className="font-bold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit: any) => (
              <TableRow key={deposit.id}>
                <TableCell>{deposit.userId}</TableCell>
                <TableCell className="font-medium">${parseFloat(deposit.amount).toLocaleString()}</TableCell>
                <TableCell>{deposit.currency}</TableCell>
                <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className="bg-red-600 text-white">Rejected</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
