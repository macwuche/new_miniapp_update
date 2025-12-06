import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, XCircle, Loader2, Wallet, Link2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Withdrawal {
  id: number;
  transactionId: number;
  userId: number;
  amount: string;
  currency: string;
  method: string;
  destinationAddress: string | null;
  status: string;
  approvedBy: number | null;
  approvedAt: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: pendingWithdrawals = [], isLoading: pendingLoading } = useQuery<Withdrawal[]>({
    queryKey: ['/api/withdrawals', 'pending'],
    queryFn: async () => {
      const res = await fetch('/api/withdrawals?status=pending');
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const withdrawals = await res.json();
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (w: Withdrawal) => {
          try {
            const userRes = await fetch(`/api/users/${w.userId}`);
            if (userRes.ok) {
              const user = await userRes.json();
              return { ...w, user };
            }
          } catch (e) {}
          return w;
        })
      );
      return withdrawalsWithUsers;
    }
  });

  const { data: approvedWithdrawals = [], isLoading: approvedLoading } = useQuery<Withdrawal[]>({
    queryKey: ['/api/withdrawals', 'approved'],
    queryFn: async () => {
      const res = await fetch('/api/withdrawals?status=approved');
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const withdrawals = await res.json();
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (w: Withdrawal) => {
          try {
            const userRes = await fetch(`/api/users/${w.userId}`);
            if (userRes.ok) {
              const user = await userRes.json();
              return { ...w, user };
            }
          } catch (e) {}
          return w;
        })
      );
      return withdrawalsWithUsers;
    }
  });

  const { data: rejectedWithdrawals = [], isLoading: rejectedLoading } = useQuery<Withdrawal[]>({
    queryKey: ['/api/withdrawals', 'rejected'],
    queryFn: async () => {
      const res = await fetch('/api/withdrawals?status=rejected');
      if (!res.ok) throw new Error('Failed to fetch withdrawals');
      const withdrawals = await res.json();
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (w: Withdrawal) => {
          try {
            const userRes = await fetch(`/api/users/${w.userId}`);
            if (userRes.ok) {
              const user = await userRes.json();
              return { ...w, user };
            }
          } catch (e) {}
          return w;
        })
      );
      return withdrawalsWithUsers;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      setProcessingId(id);
      const res = await fetch(`/api/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve withdrawal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({ title: "Withdrawal Approved", description: "The withdrawal has been approved and user balance updated." });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setProcessingId(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      setProcessingId(id);
      const res = await fetch(`/api/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by admin' })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject withdrawal');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({ title: "Withdrawal Rejected", description: "The withdrawal request has been rejected." });
      setProcessingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setProcessingId(null);
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const totalApproved = approvedWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const totalRejected = rejectedWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);

  const renderWithdrawalsTable = (withdrawals: Withdrawal[], showActions: boolean) => {
    if (withdrawals.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No withdrawals found</p>
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{withdrawal.id}</TableCell>
                <TableCell>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '14px' }}>
                      {withdrawal.user?.firstName || 'User'} {withdrawal.user?.lastName || ''}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      @{withdrawal.user?.username || `user_${withdrawal.userId}`}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>
                    -${parseFloat(withdrawal.amount).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                    {withdrawal.destinationAddress 
                      ? `${withdrawal.destinationAddress.slice(0, 12)}...${withdrawal.destinationAddress.slice(-6)}`
                      : 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {withdrawal.method || 'crypto'}
                  </Badge>
                </TableCell>
                <TableCell style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formatDate(withdrawal.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge 
                    style={{
                      backgroundColor: withdrawal.status === 'approved' ? '#dcfce7' : 
                                       withdrawal.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: withdrawal.status === 'approved' ? '#166534' : 
                             withdrawal.status === 'rejected' ? '#991b1b' : '#92400e',
                      border: 'none'
                    }}
                  >
                    {withdrawal.status}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(withdrawal.id)}
                        disabled={processingId === withdrawal.id}
                        style={{ backgroundColor: '#22c55e', color: 'white', fontSize: '12px', padding: '4px 12px' }}
                        data-testid={`button-approve-withdrawal-${withdrawal.id}`}
                      >
                        {processingId === withdrawal.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(withdrawal.id)}
                        disabled={processingId === withdrawal.id}
                        style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '12px', padding: '4px 12px' }}
                        data-testid={`button-reject-withdrawal-${withdrawal.id}`}
                      >
                        <XCircle size={14} style={{ marginRight: '4px' }} />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Withdrawal Management</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Review and process user withdrawal requests</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/crypto-withdrawal">
            <Button 
              style={{ backgroundColor: '#6f42c1', color: 'white' }}
              data-testid="button-crypto-withdrawal"
            >
              <Wallet size={16} style={{ marginRight: '8px' }} />
              Crypto Withdrawal
            </Button>
          </Link>
          <Link href="/admin/linked-wallets">
            <Button 
              variant="outline"
              style={{ borderColor: '#6f42c1', color: '#6f42c1' }}
              data-testid="button-linked-wallets"
            >
              <Link2 size={16} style={{ marginRight: '8px' }} />
              Linked Wallets
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Pending</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{pendingWithdrawals.length}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>${totalPending.toFixed(2)}</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} style={{ color: '#f59e0b' }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Approved</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{approvedWithdrawals.length}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>${totalApproved.toFixed(2)}</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} style={{ color: '#22c55e' }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Rejected</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{rejectedWithdrawals.length}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>${totalRejected.toFixed(2)}</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={24} style={{ color: '#ef4444' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" style={{ width: '100%' }}>
        <TabsList style={{ marginBottom: '24px', backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
          <TabsTrigger value="pending" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            <Clock size={14} style={{ marginRight: '4px' }} /> Pending ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-[#6f42c1] data-[state=active]:text-white">
            <XCircle size={14} style={{ marginRight: '4px' }} /> Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent style={{ padding: '0' }}>
              {pendingLoading ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: '#6b7280' }} />
                  <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading withdrawals...</p>
                </div>
              ) : (
                renderWithdrawalsTable(pendingWithdrawals, true)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent style={{ padding: '0' }}>
              {approvedLoading ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: '#6b7280' }} />
                  <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading withdrawals...</p>
                </div>
              ) : (
                renderWithdrawalsTable(approvedWithdrawals, false)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent style={{ padding: '0' }}>
              {rejectedLoading ? (
                <div style={{ textAlign: 'center', padding: '48px' }}>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: '#6b7280' }} />
                  <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading withdrawals...</p>
                </div>
              ) : (
                renderWithdrawalsTable(rejectedWithdrawals, false)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
