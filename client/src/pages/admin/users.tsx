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
  Search, 
  Filter, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail, 
  ShieldAlert, 
  Wallet,
  MoreVertical
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock data for users
const MOCK_USERS = [
  { id: "USR-1001", name: "Alex Thompson", email: "alex.t@example.com", balance: "$12,450.00", kyc: "Verified", status: "Active", joined: "2024-01-15" },
  { id: "USR-1002", name: "Sarah Jenkins", email: "sarah.j@example.com", balance: "$3,200.50", kyc: "Pending", status: "Active", joined: "2024-02-20" },
  { id: "USR-1003", name: "Michael Chen", email: "m.chen@example.com", balance: "$45,900.00", kyc: "Verified", status: "Suspended", joined: "2023-11-05" },
  { id: "USR-1004", name: "David Miller", email: "d.miller@example.com", balance: "$0.00", kyc: "Unverified", status: "Active", joined: "2024-05-10" },
  { id: "USR-1005", name: "Jessica Wu", email: "jess.wu@example.com", balance: "$8,750.25", kyc: "Verified", status: "Active", joined: "2024-03-12" },
  { id: "USR-1006", name: "Robert Wilson", email: "r.wilson@example.com", balance: "$1,500.00", kyc: "Rejected", status: "Active", joined: "2024-04-01" },
  { id: "USR-1007", name: "Emily Davis", email: "emily.d@example.com", balance: "$150.00", kyc: "Unverified", status: "Active", joined: "2024-05-14" },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleAction = (action: string, userId: string) => {
    toast({
      title: `User ${action}`,
      description: `Successfully applied ${action.toLowerCase()} to user ${userId}`,
    });
  };

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                placeholder="Search name, email or ID..." 
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
                        <p className="text-xs text-gray-500">{user.email}</p>
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction('Viewed Profile', user.id)}>
                          <UserCheck size={14} className="mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Emailed', user.id)}>
                          <Mail size={14} className="mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Wallet Checked', user.id)}>
                          <Wallet size={14} className="mr-2" />
                          Check Wallet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('Suspended', user.id)} className="text-red-600">
                          <ShieldAlert size={14} className="mr-2" />
                          Suspend Account
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
    </AdminLayout>
  );
}
