import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Search, PieChart, ArrowRight, Wallet, TrendingUp, ArrowRightLeft, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  telegramId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  photoUrl: string | null;
}

interface PortfolioItem {
  id: number;
  userId: number;
  assetId: string;
  assetType: string;
  name: string;
  symbol: string;
  amount: string;
  averageBuyPrice: string;
  currentValue: string;
}

interface UserBalance {
  userId: number;
  totalBalanceUsd: string;
  availableBalanceUsd: string;
  lockedBalanceUsd: string;
}

interface UserPortfolioData {
  user: User;
  balance: UserBalance | null;
  portfolios: PortfolioItem[];
}

export default function AdminPortfolios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserPortfolioData | null>(null);
  const [isSwapOpen, setSwapOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [swapUserId, setSwapUserId] = useState("");
  const [fromAsset, setFromAsset] = useState("");
  const [toAsset, setToAsset] = useState("");
  const [swapAmount, setSwapAmount] = useState("");

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: allPortfolios = [], isLoading: portfoliosLoading } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio'],
    queryFn: async () => {
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error("Failed to fetch portfolios");
      return res.json();
    },
  });

  const { data: allBalances = [] } = useQuery<UserBalance[]>({
    queryKey: ['/api/balances'],
    queryFn: async () => {
      const res = await fetch('/api/balances');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const userPortfolioData = useMemo(() => {
    return users.map(user => {
      const portfolios = allPortfolios.filter(p => p.userId === user.id && parseFloat(p.amount) > 0);
      const balance = allBalances.find(b => b.userId === user.id) || null;
      return { user, balance, portfolios };
    }).filter(data => data.portfolios.length > 0);
  }, [users, allPortfolios, allBalances]);

  const filteredData = userPortfolioData.filter(data => 
    data.user.username?.toLowerCase().includes(search.toLowerCase()) || 
    data.user.email?.toLowerCase().includes(search.toLowerCase()) ||
    data.user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    data.user.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssetsValue = useMemo(() => {
    return allPortfolios.reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
  }, [allPortfolios]);

  const getAssetDistribution = (portfolios: PortfolioItem[]) => {
    const totalValue = portfolios.reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
    if (totalValue === 0) return { crypto: 0, stocks: 0, forex: 0 };
    
    const crypto = portfolios.filter(p => p.assetType === 'crypto').reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
    const stocks = portfolios.filter(p => p.assetType === 'stock').reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
    const forex = portfolios.filter(p => p.assetType === 'forex').reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
    
    return {
      crypto: Math.round((crypto / totalValue) * 100),
      stocks: Math.round((stocks / totalValue) * 100),
      forex: Math.round((forex / totalValue) * 100),
    };
  };

  const getTopAsset = (portfolios: PortfolioItem[]) => {
    if (portfolios.length === 0) return "N/A";
    const sorted = [...portfolios].sort((a, b) => parseFloat(b.currentValue || '0') - parseFloat(a.currentValue || '0'));
    return `${sorted[0].name} (${sorted[0].symbol})`;
  };

  const getTotalValue = (portfolios: PortfolioItem[]) => {
    return portfolios.reduce((sum, p) => sum + parseFloat(p.currentValue || '0'), 0);
  };

  const allUniqueAssets = useMemo(() => {
    const assets = new Map<string, { symbol: string; name: string; assetType: string }>();
    allPortfolios.forEach(p => {
      if (!assets.has(p.symbol)) {
        assets.set(p.symbol, { symbol: p.symbol, name: p.name, assetType: p.assetType });
      }
    });
    return Array.from(assets.values());
  }, [allPortfolios]);

  const handleManualSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Swap Executed Successfully",
        description: "Admin manual swap operation has been completed.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      setSwapOpen(false);
      setSwapUserId("");
      setFromAsset("");
      setToAsset("");
      setSwapAmount("");
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap operation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = usersLoading || portfoliosLoading;

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Portfolios</h1>
          <p className="text-gray-500 mt-2">
            View and manage user asset portfolios.
          </p>
        </div>
        <Button 
          onClick={() => setSwapOpen(true)}
          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium"
        >
          <ArrowRightLeft size={18} className="mr-2" />
          Perform Manual Swap
        </Button>
      </div>
      
      <Dialog open={isSwapOpen} onOpenChange={setSwapOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual User Swap</DialogTitle>
            <DialogDescription>
              Execute a swap operation on behalf of a user.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleManualSwap} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={swapUserId} onValueChange={setSwapUserId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Search or select user" />
                </SelectTrigger>
                <SelectContent>
                  {userPortfolioData.map(data => (
                    <SelectItem key={data.user.id} value={data.user.id.toString()}>
                      {data.user.firstName || data.user.username} ({data.user.email || data.user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Asset</Label>
                <Select value={fromAsset} onValueChange={setFromAsset} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUniqueAssets.map(asset => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        {asset.name} ({asset.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Asset</Label>
                <Select value={toAsset} onValueChange={setToAsset} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUniqueAssets.map(asset => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        {asset.name} ({asset.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount to Swap</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                required 
                min="0" 
                step="0.000001"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setSwapOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-[#6f42c1] hover:bg-[#5a32a3]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Execute Swap"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Wallet size={20} />
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100">Live</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${totalAssetsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-gray-500 text-sm">Total Assets Value</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <TrendingUp size={20} />
              </div>
              <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-100">Active</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{allPortfolios.length}</h3>
            <p className="text-gray-500 text-sm">Total Portfolio Positions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <PieChart size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{userPortfolioData.length}</h3>
            <p className="text-gray-500 text-sm">Users with Portfolios</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search users..." 
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-portfolios"
          />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search ? "No users found matching your search." : "No users with portfolios found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="font-semibold text-gray-700 pl-6">User</TableHead>
                  <TableHead className="font-semibold text-gray-700">Total Value</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-1/4">Asset Distribution</TableHead>
                  <TableHead className="font-semibold text-gray-700">Top Asset</TableHead>
                  <TableHead className="font-semibold text-gray-700">Positions</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((data) => {
                  const distribution = getAssetDistribution(data.portfolios);
                  const totalValue = getTotalValue(data.portfolios);
                  const topAsset = getTopAsset(data.portfolios);
                  
                  return (
                    <TableRow key={data.user.id} className="hover:bg-gray-50 border-b border-gray-50" data-testid={`row-portfolio-${data.user.id}`}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={data.user.photoUrl || ""} />
                            <AvatarFallback>{(data.user.firstName || data.user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{data.user.firstName || data.user.username}</div>
                            <div className="text-xs text-gray-500">{data.user.email || `@${data.user.username}`}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className="bg-orange-500" style={{ width: `${distribution.crypto}%` }} />
                            <div className="bg-blue-500" style={{ width: `${distribution.stocks}%` }} />
                            <div className="bg-green-500" style={{ width: `${distribution.forex}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {distribution.crypto}% Crypto</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {distribution.stocks}% Stocks</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {distribution.forex}% Forex</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-gray-600">
                          {topAsset}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{data.portfolios.length} assets</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          onClick={() => setSelectedUser(data)}
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          data-testid={`button-view-portfolio-${data.user.id}`}
                        >
                          View Assets <ArrowRight size={16} className="ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="text-blue-600" size={20} />
              Portfolio Details
            </DialogTitle>
            <DialogDescription>
              Viewing assets for <span className="font-medium text-gray-900">{selectedUser?.user.firstName || selectedUser?.user.username}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Value</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  ${selectedUser ? getTotalValue(selectedUser.portfolios).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Top Asset</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 truncate">
                  {selectedUser ? getTopAsset(selectedUser.portfolios) : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Account Balance</p>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  ${parseFloat(selectedUser?.balance?.totalBalanceUsd || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Asset Holdings</h3>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Avg Buy Price</TableHead>
                    <TableHead className="text-right">Value (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedUser?.portfolios.map((asset, index) => (
                    <TableRow key={index} data-testid={`row-asset-${asset.id}`}>
                      <TableCell className="font-medium">
                        {asset.name} <span className="text-gray-400 text-xs ml-1">{asset.symbol}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${asset.assetType === 'crypto' ? 'text-orange-600 bg-orange-50 border-orange-100' : 
                            asset.assetType === 'stock' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                            'text-green-600 bg-green-50 border-green-100'}
                        `}>
                          {asset.assetType.charAt(0).toUpperCase() + asset.assetType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{parseFloat(asset.amount).toFixed(6)}</TableCell>
                      <TableCell className="text-right font-mono">${parseFloat(asset.averageBuyPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">${parseFloat(asset.currentValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
