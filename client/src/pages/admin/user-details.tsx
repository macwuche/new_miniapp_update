import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Wallet, 
  History, 
  Bot, 
  CreditCard, 
  MoreHorizontal,
  Copy,
  ExternalLink,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Globe,
  Star,
  User,
  AlertCircle
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface UserData {
  id: number;
  telegramId: string | null;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profilePicture: string | null;
  isVerified: boolean;
  isSuspended?: boolean;
  joinedAt: string;
  languageCode?: string;
  role: string;
}

interface UserBalance {
  userId: number;
  totalBalanceUsd: string;
  availableBalanceUsd: string;
  lockedBalanceUsd: string;
}

interface ConnectedWallet {
  id: number;
  name: string;
  address: string;
  logo: string | null;
  connectedAt: string;
}

interface Deposit {
  id: number;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  id: number;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  destinationAddress: string | null;
}

interface TransactionsData {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}

export default function UserDetails() {
  const [, params] = useRoute("/admin/users/:id");
  const { toast } = useToast();
  const userId = params?.id;

  const { data: user, isLoading: userLoading, error: userError } = useQuery<UserData>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId
  });

  const { data: balance, isLoading: balanceLoading } = useQuery<UserBalance>({
    queryKey: ['userBalance', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/balance`, {
        credentials: 'include'
      });
      if (!response.ok) {
        return { userId: Number(userId), totalBalanceUsd: '0', availableBalanceUsd: '0', lockedBalanceUsd: '0' };
      }
      return response.json();
    },
    enabled: !!userId
  });

  const { data: wallets = [], isLoading: walletsLoading } = useQuery<ConnectedWallet[]>({
    queryKey: ['userWallets', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/wallets`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!userId
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionsData>({
    queryKey: ['userTransactions', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/transactions`, {
        credentials: 'include'
      });
      if (!response.ok) return { deposits: [], withdrawals: [] };
      return response.json();
    },
    enabled: !!userId
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: text,
    });
  };

  const getLanguageFlag = (code: string | undefined | null) => {
    if (!code) return '🌐';
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'ru': '🇷🇺',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'tr': '🇹🇷',
      'uk': '🇺🇦',
      'zh': '🇨🇳',
      'id': '🇮🇩',
      'vi': '🇻🇳',
    };
    return flags[code.toLowerCase()] || '🌐';
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: string | undefined | null) => {
    if (!amount) return '$0.00';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const truncateAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const buildActivity = () => {
    const activities: { id: string; action: string; date: string; details: string }[] = [];
    
    if (transactions?.deposits) {
      transactions.deposits.slice(0, 5).forEach((dep) => {
        activities.push({
          id: `dep-${dep.id}`,
          action: 'Deposit',
          date: formatDate(dep.createdAt),
          details: `Deposited ${formatCurrency(dep.amount)} ${dep.currency} - ${dep.status}`
        });
      });
    }
    
    if (transactions?.withdrawals) {
      transactions.withdrawals.slice(0, 5).forEach((wd) => {
        activities.push({
          id: `wd-${wd.id}`,
          action: 'Withdrawal',
          date: formatDate(wd.createdAt),
          details: `Withdrew ${formatCurrency(wd.amount)} ${wd.currency} - ${wd.status}`
        });
      });
    }
    
    return activities.slice(0, 10);
  };

  if (userLoading) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (userError || !user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-500 mb-6">The user you're looking for doesn't exist or has been deleted.</p>
          <Link href="/admin/users">
            <Button>
              <ArrowLeft size={16} className="mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
  const displayUsername = user.username.startsWith('@') ? user.username : `@${user.username}`;
  const userStatus = user.isSuspended ? 'Suspended' : (user.isVerified ? 'Active' : 'Unverified');
  const activity = buildActivity();

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" className="pl-0 text-gray-500 hover:text-gray-900 hover:bg-transparent mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back to Users
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                <AvatarImage src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=128`} />
                <AvatarFallback className="text-2xl">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900" data-testid="text-user-fullname">{fullName}</h1>
                <Badge 
                  className={
                    userStatus === "Active" 
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" 
                      : userStatus === "Suspended" 
                        ? "bg-red-100 text-red-700 border-none" 
                        : "bg-yellow-100 text-yellow-700 border-none"
                  }
                  data-testid="badge-user-status"
                >
                  {userStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-gray-500">
                <span className="flex items-center gap-1 text-sm">
                  <span className="font-medium text-blue-600" data-testid="text-username">{displayUsername}</span>
                </span>
                <span className="flex items-center gap-1 text-sm">
                  ID: <span className="font-mono" data-testid="text-user-id">{user.id}</span>
                  <Copy size={12} className="cursor-pointer hover:text-gray-700" onClick={() => copyToClipboard(String(user.id))} />
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" data-testid="button-suspend">
              <UserX size={16} className="text-red-500" />
              {user.isSuspended ? 'Unsuspend' : 'Suspend'}
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700" data-testid="button-message">
              <Mail size={16} />
              Message
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Full Name</div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-gray-900 font-medium" data-testid="text-fullname">{fullName}</span>
                </div>
              </div>
              <Separator />
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Telegram Username</div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-medium" data-testid="text-telegram-username">{displayUsername}</span>
                </div>
              </div>
              <Separator />

              {user.telegramId && (
                <>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase font-medium">Telegram ID</div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-mono" data-testid="text-telegram-id">{user.telegramId}</span>
                      <Copy size={12} className="cursor-pointer hover:text-gray-700" onClick={() => copyToClipboard(user.telegramId!)} />
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Email Address</div>
                <div className="flex items-center justify-between">
                  {user.email ? (
                    <>
                      <span className="text-gray-900" data-testid="text-email">{user.email}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5">Verified</Badge>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>
              </div>
              <Separator />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Language</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{getLanguageFlag(user.languageCode)}</span>
                  <span className="text-gray-900 uppercase font-medium" data-testid="text-language">{user.languageCode || 'N/A'}</span>
                </div>
              </div>
              <Separator />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Join Date</div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-900" data-testid="text-join-date">{formatDate(user.joinedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Verification Status</div>
                    <div className="text-xs text-gray-500" data-testid="text-verification-status">
                      {user.isVerified ? 'Verified' : 'Not Verified'}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600">View</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Account Role</div>
                    <div className="text-xs text-gray-500 capitalize" data-testid="text-role">{user.role}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                <h3 className="text-2xl font-bold" data-testid="text-total-balance">
                  {balanceLoading ? <Skeleton className="h-8 w-24 bg-blue-400" /> : formatCurrency(balance?.totalBalanceUsd)}
                </h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium mb-1">Available</p>
                <h3 className="text-2xl font-bold text-gray-900" data-testid="text-available-balance">
                  {balanceLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(balance?.availableBalanceUsd)}
                </h3>
                <p className="text-gray-400 text-xs mt-2">Withdrawable funds</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium mb-1">Locked / Staked</p>
                <h3 className="text-2xl font-bold text-gray-900" data-testid="text-locked-balance">
                  {balanceLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(balance?.lockedBalanceUsd)}
                </h3>
                <p className="text-gray-400 text-xs mt-2">In active trades/bots</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="w-full justify-start bg-white border-b border-gray-200 rounded-none h-auto p-0 mb-6">
              <TabsTrigger 
                value="activity" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-6 py-3"
              >
                Activity Log
              </TabsTrigger>
              <TabsTrigger 
                value="wallets" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-6 py-3"
              >
                Connected Wallets
              </TabsTrigger>
              <TabsTrigger 
                value="bots" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-6 py-3"
              >
                Trading Bots
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History size={20} className="text-gray-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4">
                          <Skeleton className="h-2 w-2 rounded-full mt-2" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No recent activity found for this user.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {activity.map((item) => (
                        <div key={item.id} className="flex items-start gap-4" data-testid={`activity-item-${item.id}`}>
                          <div className="relative mt-1">
                            <div className="h-2 w-2 rounded-full bg-blue-400 z-10 relative" />
                            <div className="absolute top-2 left-1 w-[1px] h-full bg-gray-200 -z-0 last:hidden" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">{item.action}</h4>
                              <span className="text-xs text-gray-500">{item.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" className="w-full mt-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View Full History
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallets" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet size={20} className="text-gray-500" />
                    Connected Wallets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {walletsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : wallets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Wallet size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No connected wallets found for this user.</p>
                    </div>
                  ) : (
                    wallets.map((wallet) => (
                      <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50" data-testid={`wallet-item-${wallet.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-full border shadow-sm">
                            {wallet.logo ? (
                              <img src={wallet.logo} alt={wallet.name} className="w-5 h-5" />
                            ) : (
                              <CreditCard size={20} className="text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{wallet.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="font-mono bg-gray-200 px-1.5 rounded text-xs">{truncateAddress(wallet.address)}</span>
                              <Copy size={12} className="cursor-pointer hover:text-gray-700" onClick={() => copyToClipboard(wallet.address)} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Connected {formatDate(wallet.connectedAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" className="w-full border-dashed" data-testid="button-disconnect-wallet">
                    <AlertTriangle size={16} className="mr-2 text-orange-500" />
                    Force Disconnect Wallet
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bots" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot size={20} className="text-gray-500" />
                    Active Trading Bots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Bot size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No active trading bots found for this user.</p>
                    <Button variant="link" className="text-blue-600 mt-2">
                      View Bot History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
