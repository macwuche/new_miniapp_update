import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Download,
  Activity,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: string;
  currency: string;
  status: string;
  description: string | null;
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    }
  });

  const handleAction = (action: string, id: number) => {
    toast({
      title: `Transaction ${action}`,
      description: `Successfully ${action.toLowerCase()} transaction #${id}`,
    });
  };

  const filteredTransactions = transactions.filter(tx => {
    const userName = tx.user 
      ? `${tx.user.firstName || ''} ${tx.user.lastName || ''} ${tx.user.username}`.toLowerCase()
      : '';
    return userName.includes(searchTerm.toLowerCase()) || 
      tx.id.toString().includes(searchTerm) ||
      tx.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit": return <ArrowDownLeft size={16} className="text-green-600" />;
      case "withdrawal": return <ArrowUpRight size={16} className="text-red-600" />;
      case "swap": return <Repeat size={16} className="text-blue-600" />;
      case "trade": return <Repeat size={16} className="text-purple-600" />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": 
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle2 size={12} className="mr-1" /> {status}</Badge>;
      case "pending": 
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"><Clock size={12} className="mr-1" /> Pending</Badge>;
      case "rejected":
      case "failed": 
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"><XCircle size={12} className="mr-1" /> {status}</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
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

  const getUserDisplayName = (user: Transaction['user']) => {
    if (!user) return 'Unknown User';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || 'Unknown User';
  };

  const totalDeposits = transactions
    .filter(tx => tx.type === 'deposit' && (tx.status === 'completed' || tx.status === 'approved'))
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const totalWithdrawals = transactions
    .filter(tx => tx.type === 'withdrawal' && (tx.status === 'completed' || tx.status === 'approved'))
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-2">View and manage all financial operations across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Filter size={16} />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Deposits</p>
            <h3 className="text-2xl font-bold text-gray-900">${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-xs text-green-600 font-medium flex items-center mt-2">
              <ArrowDownLeft size={12} className="mr-1" /> All time
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Withdrawals</p>
            <h3 className="text-2xl font-bold text-gray-900">${totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-xs text-red-600 font-medium flex items-center mt-2">
              <ArrowUpRight size={12} className="mr-1" /> All time
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-yellow-50 border-yellow-100">
          <CardContent className="p-6">
            <p className="text-yellow-800 text-sm font-medium mb-1">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-yellow-900">{pendingCount}</h3>
            <span className="text-xs text-yellow-700 font-medium flex items-center mt-2">
              <Clock size={12} className="mr-1" /> {pendingCount > 0 ? 'Requires attention' : 'All clear'}
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Net Flow</p>
            <h3 className={cn("text-2xl font-bold", totalDeposits - totalWithdrawals >= 0 ? "text-blue-600" : "text-red-600")}>
              {totalDeposits - totalWithdrawals >= 0 ? '+' : ''}${(totalDeposits - totalWithdrawals).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-xs text-gray-400 font-medium flex items-center mt-2">
              All time
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Latest financial movements sorted by date</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search ID, user or type..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No transactions match your search' : 'No transactions yet'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs font-medium text-gray-500">
                      TX-{tx.id}
                    </TableCell>
                    <TableCell className="font-medium">{getUserDisplayName(tx.user)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-full",
                          tx.type === "deposit" ? "bg-green-100" : 
                          tx.type === "withdrawal" ? "bg-red-100" : "bg-blue-100"
                        )}>
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className="text-sm capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      ${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      <span className="text-xs font-normal text-gray-500 ml-1">{tx.currency}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                      {tx.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleAction('Viewed', tx.id)}>
                            View Details
                          </DropdownMenuItem>
                          {tx.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAction('Approved', tx.id)} className="text-green-600">
                                <CheckCircle2 size={14} className="mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('Rejected', tx.id)} className="text-red-600">
                                <XCircle size={14} className="mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
