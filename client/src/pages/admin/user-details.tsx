import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  User
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Mock User Data (In a real app, this would be fetched based on ID)
const MOCK_USER_DETAILS = {
  id: "USR-1001",
  firstName: "Alex",
  lastName: "Thompson",
  username: "@alex_thompson",
  email: "alex.t@example.com",
  phone: "+1 (555) 123-4567",
  languageCode: "en",
  isPremium: true,
  photoUrl: "https://ui-avatars.com/api/?name=Alex+Thompson&background=random&size=128",
  country: "United States",
  joined: "January 15, 2024",
  status: "Active",
  kycLevel: "Level 2 (Verified)",
  lastLogin: "2 hours ago",
  device: "iPhone 13 Pro • iOS 17.4",
  ip: "192.168.1.1",
  
  balance: {
    total: "$12,450.00",
    available: "$8,200.00",
    locked: "$4,250.00",
    pnl: "+$1,240.50 (15.4%)"
  },
  
  wallets: [
    { id: 1, type: "Main Wallet", address: "0x71C...9A23", network: "Ethereum", balance: "2.5 ETH" },
    { id: 2, type: "Trading Wallet", address: "0x82D...1B45", network: "Solana", balance: "145 SOL" },
  ],

  activity: [
    { id: 1, action: "Login", date: "Today, 10:30 AM", details: "Login via Mobile App" },
    { id: 2, action: "Trade", date: "Yesterday, 2:15 PM", details: "Bought 0.5 BTC @ $62,000" },
    { id: 3, action: "Deposit", date: "May 20, 2024", details: "Deposited $5,000 via USDT" },
    { id: 4, action: "KYC Update", date: "May 15, 2024", details: "Address verification approved" },
  ]
};

export default function UserDetails() {
  const [, params] = useRoute("/admin/users/:id");
  const { toast } = useToast();
  const userId = params?.id || "USR-1001"; // Fallback for dev
  
  // In a real app, fetch user by ID here
  const user = MOCK_USER_DETAILS;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: text,
    });
  };

  // Helper for language flags
  const getLanguageFlag = (code: string) => {
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
                <AvatarImage src={user.photoUrl} />
                <AvatarFallback className="text-2xl">{user.firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              {user.isPremium && (
                <div className="absolute -bottom-1 -right-1 bg-[#6f42c1] text-white rounded-full p-1 border-2 border-white shadow-sm" title="Telegram Premium">
                  <Star size={14} fill="currentColor" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <Badge className={user.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : "bg-red-100 text-red-700"}>
                  {user.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-gray-500">
                <span className="flex items-center gap-1 text-sm">
                  <span className="font-medium text-blue-600">{user.username}</span>
                </span>
                <span className="flex items-center gap-1 text-sm">
                  ID: <span className="font-mono">{user.id}</span>
                  <Copy size={12} className="cursor-pointer hover:text-gray-700" onClick={() => copyToClipboard(user.id)} />
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <UserX size={16} className="text-red-500" />
              Suspend
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
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
        {/* Left Column - Info */}
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
                  <span className="text-gray-900 font-medium">{user.firstName} {user.lastName}</span>
                </div>
              </div>
              <Separator />
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Telegram Username</div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-medium">{user.username}</span>
                  <div className="flex gap-2">
                    {user.isPremium && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] h-5 gap-1">
                        <Star size={10} fill="currentColor" /> Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Separator />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Email Address</div>
                <div className="flex items-center justify-between">
                  {user.email ? (
                    <>
                      <span className="text-gray-900">{user.email}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5">Verified</Badge>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>
              </div>
              <Separator />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Phone Number</div>
                <div className="flex items-center justify-between">
                  {user.phone ? (
                    <>
                      <span className="text-gray-900">{user.phone}</span>
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
                  <span className="text-gray-900 uppercase font-medium">{user.languageCode}</span>
                </div>
              </div>
              <Separator />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Country</div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  {user.country ? (
                    <span className="text-gray-900">{user.country}</span>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>
              </div>
              <Separator />

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase font-medium">Join Date</div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-900">{user.joined}</span>
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
                    <div className="font-medium text-sm">KYC Status</div>
                    <div className="text-xs text-gray-500">{user.kycLevel}</div>
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
                    <div className="font-medium text-sm">Last Login</div>
                    <div className="text-xs text-gray-500">{user.lastLogin}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">IP Address:</span>
                  <span className="font-mono text-gray-700">{user.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Device:</span>
                  <span className="text-gray-700">{user.device}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Column - Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                <h3 className="text-2xl font-bold">{user.balance.total}</h3>
                <p className="text-blue-200 text-xs mt-2 flex items-center gap-1">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">PNL</span>
                  {user.balance.pnl}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium mb-1">Available</p>
                <h3 className="text-2xl font-bold text-gray-900">{user.balance.available}</h3>
                <p className="text-gray-400 text-xs mt-2">Withdrawable funds</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium mb-1">Locked / Staked</p>
                <h3 className="text-2xl font-bold text-gray-900">{user.balance.locked}</h3>
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
                  <div className="space-y-6">
                    {user.activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
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
                  {user.wallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full border shadow-sm">
                          <CreditCard size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{wallet.type}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono bg-gray-200 px-1.5 rounded text-xs">{wallet.address}</span>
                            <Copy size={12} className="cursor-pointer hover:text-gray-700" onClick={() => copyToClipboard(wallet.address)} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{wallet.balance}</p>
                        <p className="text-xs text-gray-500">{wallet.network}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed">
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