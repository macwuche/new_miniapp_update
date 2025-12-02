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
  Activity
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock data for transactions
const MOCK_TRANSACTIONS = [
  { id: "TX-8821", user: "Alex Thompson", type: "Deposit", asset: "USDT", amount: "5,000.00", status: "Completed", date: "2024-05-15 14:30", wallet: "0x71...9A21" },
  { id: "TX-8822", user: "Sarah Jenkins", type: "Withdrawal", asset: "BTC", amount: "0.45", status: "Pending", date: "2024-05-15 13:15", wallet: "bc1q...8z9x" },
  { id: "TX-8823", user: "Michael Chen", type: "Trade", asset: "SOL/USDT", amount: "1,250.00", status: "Completed", date: "2024-05-15 12:45", wallet: "Internal" },
  { id: "TX-8824", user: "David Miller", type: "Deposit", asset: "ETH", amount: "12.5", status: "Completed", date: "2024-05-14 18:20", wallet: "0x3a...4B5C" },
  { id: "TX-8825", user: "Jessica Wu", type: "Withdrawal", asset: "USDT", amount: "15,000.00", status: "Rejected", date: "2024-05-14 09:10", wallet: "TR7N...jK9L" },
  { id: "TX-8826", user: "Robert Wilson", type: "Trade", asset: "BTC/USDT", amount: "540.00", status: "Completed", date: "2024-05-13 22:15", wallet: "Internal" },
  { id: "TX-8827", user: "Emily Davis", type: "Deposit", asset: "USDT", amount: "1,000.00", status: "Pending", date: "2024-05-13 16:40", wallet: "0x8b...2C1D" },
];

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleAction = (action: string, id: string) => {
    toast({
      title: `Transaction ${action}`,
      description: `Successfully ${action.toLowerCase()} transaction ${id}`,
    });
  };

  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => 
    tx.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Deposit": return <ArrowDownLeft size={16} className="text-green-600" />;
      case "Withdrawal": return <ArrowUpRight size={16} className="text-red-600" />;
      case "Trade": return <Repeat size={16} className="text-blue-600" />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": 
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle2 size={12} className="mr-1" /> Completed</Badge>;
      case "Pending": 
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"><Clock size={12} className="mr-1" /> Pending</Badge>;
      case "Rejected": 
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"><XCircle size={12} className="mr-1" /> Rejected</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Deposits (24h)</p>
            <h3 className="text-2xl font-bold text-gray-900">$245,000.00</h3>
            <span className="text-xs text-green-600 font-medium flex items-center mt-2">
              <ArrowDownLeft size={12} className="mr-1" /> +12.5% vs yesterday
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Withdrawals (24h)</p>
            <h3 className="text-2xl font-bold text-gray-900">$82,450.00</h3>
            <span className="text-xs text-red-600 font-medium flex items-center mt-2">
              <ArrowUpRight size={12} className="mr-1" /> -5.2% vs yesterday
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-yellow-50 border-yellow-100">
          <CardContent className="p-6">
            <p className="text-yellow-800 text-sm font-medium mb-1">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-yellow-900">12</h3>
            <span className="text-xs text-yellow-700 font-medium flex items-center mt-2">
              <Clock size={12} className="mr-1" /> Requires attention
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Net Flow (24h)</p>
            <h3 className="text-2xl font-bold text-blue-600">+$162,550.00</h3>
            <span className="text-xs text-gray-400 font-medium flex items-center mt-2">
              System healthy
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
                placeholder="Search ID, user or asset..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Wallet / Info</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs font-medium text-gray-500">
                    {tx.id}
                  </TableCell>
                  <TableCell className="font-medium">{tx.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-full",
                        tx.type === "Deposit" ? "bg-green-100" : 
                        tx.type === "Withdrawal" ? "bg-red-100" : "bg-blue-100"
                      )}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <span className="text-sm">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    {tx.amount} <span className="text-xs font-normal text-gray-500">{tx.asset}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-500">
                    {tx.wallet}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {tx.date}
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
                        {tx.status === 'Pending' && (
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
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
