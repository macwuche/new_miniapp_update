import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail, 
  ShieldAlert, 
  Wallet,
  MoreVertical,
  PlusCircle,
  MinusCircle,
  Briefcase,
  Trash2,
  FileCheck,
  History,
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock data for users
const MOCK_USERS = [
  { id: "USR-1001", name: "Alex Thompson", username: "@alex_thompson", balance: "$12,450.00", rawBalance: 12450, kyc: "Verified", status: "Active", joined: "2024-01-15" },
  { id: "USR-1002", name: "Sarah Jenkins", username: "@sarah_j", balance: "$3,200.50", rawBalance: 3200.50, kyc: "Pending", status: "Active", joined: "2024-02-20" },
  { id: "USR-1003", name: "Michael Chen", username: "@m_chen99", balance: "$45,900.00", rawBalance: 45900, kyc: "Verified", status: "Suspended", joined: "2023-11-05" },
  { id: "USR-1004", name: "David Miller", username: "@david_miller", balance: "$0.00", rawBalance: 0, kyc: "Unverified", status: "Active", joined: "2024-05-10" },
  { id: "USR-1005", name: "Jessica Wu", username: "@jess_wu_trading", balance: "$8,750.25", rawBalance: 8750.25, kyc: "Verified", status: "Active", joined: "2024-03-12" },
  { id: "USR-1006", name: "Robert Wilson", username: "@rob_wilson", balance: "$1,500.00", rawBalance: 1500, kyc: "Rejected", status: "Active", joined: "2024-04-01" },
  { id: "USR-1007", name: "Emily Davis", username: "@emily_davis", balance: "$150.00", rawBalance: 150, kyc: "Unverified", status: "Active", joined: "2024-05-14" },
];

// Mock Transactions
const MOCK_TRANSACTIONS = [
  { id: "TX-101", type: "Deposit", amount: "$500.00", status: "Completed", date: "2024-05-20" },
  { id: "TX-102", type: "Withdrawal", amount: "$200.00", status: "Pending", date: "2024-05-19" },
  { id: "TX-103", type: "Trade", amount: "$1,200.00", status: "Completed", date: "2024-05-18" },
  { id: "TX-104", type: "Swap", amount: "$300.00", status: "Completed", date: "2024-05-15" },
];

// Mock Bots
const MOCK_BOTS = [
  { id: "BOT-01", name: "BTC Scalper", strategy: "Scalping", profit: "+12.5%", status: "Active" },
  { id: "BOT-02", name: "ETH Swing", strategy: "Swing Trading", profit: "-2.1%", status: "Paused" },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Dialog States
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (type: string, user: typeof MOCK_USERS[0]) => {
    setSelectedUser(user);
    setDialogType(type);
    setAmount("");
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedUser(null);
    setAmount("");
    setIsLoading(false);
  };

  const handleSubmitAction = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let message = "";
    switch (dialogType) {
      case 'add-balance':
        message = `Successfully added $${amount} to ${selectedUser.name}'s balance`;
        break;
      case 'subtract-balance':
        message = `Successfully subtracted $${amount} from ${selectedUser.name}'s balance`;
        break;
      case 'add-portfolio':
        message = `Successfully added $${amount} to ${selectedUser.name}'s investment portfolio`;
        break;
      case 'delete-user':
        message = `User ${selectedUser.name} has been permanently deleted`;
        break;
      case 'send-email':
        message = `Message sent to ${selectedUser.username}`;
        break;
    }
    
    toast({
      title: "Action Completed",
      description: message,
    });
    
    closeDialog();
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case "Verified": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Verified</Badge>;
      case "Pending": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Pending</Badge>;
      case "Rejected": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline" className="text-gray-500">Unverified</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-2">Manage user accounts, KYC status, and access permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filter
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <UserCheck size={16} />
            Verify All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-gray-900">12,453</h3>
            <span className="text-xs text-green-600 font-medium flex items-center mt-2">
              +125 this week
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Active Today</p>
            <h3 className="text-3xl font-bold text-gray-900">3,201</h3>
            <span className="text-xs text-gray-500 font-medium flex items-center mt-2">
              25% of total base
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <p className="text-blue-800 text-sm font-medium mb-1">Pending KYC</p>
            <h3 className="text-3xl font-bold text-blue-900">45</h3>
            <span className="text-xs text-blue-700 font-medium flex items-center mt-2">
              Requires verification
            </span>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">Suspended</p>
            <h3 className="text-3xl font-bold text-red-600">12</h3>
            <span className="text-xs text-gray-400 font-medium flex items-center mt-2">
              Restricted accounts
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Directory of all registered platform users</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search name, username or ID..." 
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
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC Level</TableHead>
                <TableHead>Total Balance</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-blue-600 font-medium">{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        user.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getKycBadge(user.kyc)}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {user.balance}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {user.joined}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction('view-profile', user)}>
                          <UserCheck size={14} className="mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('send-email', user)}>
                          <Mail size={14} className="mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('check-wallet', user)}>
                          <Wallet size={14} className="mr-2" />
                          Check Wallet
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-gray-500">Financial</DropdownMenuLabel>
                        
                        <DropdownMenuItem onClick={() => handleAction('add-balance', user)}>
                          <PlusCircle size={14} className="mr-2 text-green-600" />
                          Add to Balance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('subtract-balance', user)}>
                          <MinusCircle size={14} className="mr-2 text-red-600" />
                          Subtract from Balance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('add-portfolio', user)}>
                          <Briefcase size={14} className="mr-2 text-blue-600" />
                          Add to Portfolio
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-gray-500">Monitoring</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => handleAction('check-kyc', user)}>
                          <FileCheck size={14} className="mr-2" />
                          Check KYC
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('check-transactions', user)}>
                          <History size={14} className="mr-2" />
                          Check Transactions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('check-bots', user)}>
                          <Bot size={14} className="mr-2" />
                          Check Trading Bots
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleAction('delete-user', user)} className="text-red-600 focus:text-red-600">
                          <Trash2 size={14} className="mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Dialogs --- */}

      {/* Add/Subtract Balance Dialog */}
      <Dialog open={dialogType === 'add-balance' || dialogType === 'subtract-balance'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogType === 'add-balance' ? 'Add Balance' : 'Subtract Balance'}</DialogTitle>
            <DialogDescription>
              {dialogType === 'add-balance' ? 'Add funds to' : 'Remove funds from'} {selectedUser?.name}'s main wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Balance</Label>
              <div className="text-2xl font-bold font-mono">{selectedUser?.balance}</div>
            </div>
            <div className="space-y-2">
              <Label>Amount ({dialogType === 'add-balance' ? 'Credit' : 'Debit'})</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-7" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitAction} 
              disabled={!amount || isLoading}
              className={dialogType === 'subtract-balance' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isLoading ? 'Processing...' : (dialogType === 'add-balance' ? 'Add Funds' : 'Subtract Funds')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Portfolio Dialog */}
      <Dialog open={dialogType === 'add-portfolio'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Portfolio</DialogTitle>
            <DialogDescription>
              Inject funds directly into {selectedUser?.name}'s investment portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
              <p className="text-sm text-blue-800">
                This action will add funds to the user's "Investment" portfolio, separate from their main wallet balance.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Investment Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-7" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Input placeholder="Reason for portfolio adjustment" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitAction} 
              disabled={!amount || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Processing...' : 'Add to Portfolio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={dialogType === 'delete-user'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle size={20} />
              Delete User Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-100 text-red-800 text-sm">
            <p className="font-bold mb-1">Warning:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>User profile and personal data will be removed.</li>
              <li>Wallet balance ({selectedUser?.balance}) will be frozen.</li>
              <li>Active trading bots will be stopped.</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitAction} 
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check KYC Dialog */}
      <Dialog open={dialogType === 'check-kyc'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>KYC Status</DialogTitle>
            <DialogDescription>
              Verification details for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 mb-6">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <div className="mt-1">{selectedUser && getKycBadge(selectedUser.kyc)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono font-medium">{selectedUser?.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Submitted Documents</h4>
              {selectedUser?.kyc === 'Verified' ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center p-3 border rounded-lg">
                    <FileCheck className="text-green-500 mr-3" size={20} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">National ID Card</p>
                      <p className="text-xs text-gray-500">Verified on 2024-03-15</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <FileCheck className="text-green-500 mr-3" size={20} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Proof of Address</p>
                      <p className="text-xs text-gray-500">Verified on 2024-03-15</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                  <p className="text-gray-500">No documents available for review.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Transactions Dialog */}
      <Dialog open={dialogType === 'check-transactions'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>
              Recent activity for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type === 'Deposit' ? <ArrowDownLeft size={16} className="text-green-500" /> : 
                           tx.type === 'Withdrawal' ? <ArrowUpRight size={16} className="text-red-500" /> :
                           <History size={16} className="text-blue-500" />}
                          {tx.type}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{tx.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          tx.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }>{tx.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-500">{tx.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Close</Button>
            <Button className="bg-blue-600">View Full History</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Bots Dialog */}
      <Dialog open={dialogType === 'check-bots'} onOpenChange={closeDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Active Trading Bots</DialogTitle>
            <DialogDescription>
              AI trading assistants managed by {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {MOCK_BOTS.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{bot.name}</h4>
                    <p className="text-xs text-gray-500">{bot.strategy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${bot.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {bot.profit}
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {bot.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={closeDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog (Placeholder) */}
      <Dialog open={dialogType === 'send-email'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a notification to {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Important notification..." />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea className="w-full min-h-[100px] p-3 rounded-md border text-sm" placeholder="Type your message here..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmitAction}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
