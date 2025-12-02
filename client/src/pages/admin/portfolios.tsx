import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import { Search, PieChart, ArrowRight, Eye, Wallet, TrendingUp, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for user portfolios
const MOCK_PORTFOLIOS = [
  {
    id: 1,
    user: {
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "https://github.com/shadcn.png"
    },
    totalBalance: "$124,532.00",
    lastSwap: "2024-05-15 14:30",
    distribution: {
      crypto: 60,
      stocks: 30,
      fiat: 10
    },
    topAsset: "Bitcoin (BTC)",
    assets: [
      { type: "Crypto", name: "Bitcoin", symbol: "BTC", amount: "1.5", value: "$98,000.00" },
      { type: "Stock", name: "Tesla", symbol: "TSLA", amount: "150", value: "$26,730.00" },
      { type: "Fiat", name: "US Dollar", symbol: "USD", amount: "1,200", value: "$1,200.00" }
    ]
  },
  {
    id: 2,
    user: {
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      avatar: ""
    },
    totalBalance: "$45,200.50",
    lastSwap: "2024-05-14 09:15",
    distribution: {
      crypto: 20,
      stocks: 10,
      fiat: 70
    },
    topAsset: "Euro (EUR)",
    assets: [
      { type: "Fiat", name: "Euro", symbol: "EUR", amount: "30,000", value: "$32,400.00" },
      { type: "Crypto", name: "Ethereum", symbol: "ETH", amount: "3.5", value: "$10,500.00" },
      { type: "Stock", name: "Apple", symbol: "AAPL", amount: "15", value: "$2,300.50" }
    ]
  },
  {
    id: 3,
    user: {
      name: "Michael Brown",
      email: "mike.brown@example.com",
      avatar: ""
    },
    totalBalance: "$8,950.00",
    lastSwap: "2024-05-12 18:45",
    distribution: {
      crypto: 90,
      stocks: 0,
      fiat: 10
    },
    topAsset: "Solana (SOL)",
    assets: [
      { type: "Crypto", name: "Solana", symbol: "SOL", amount: "450", value: "$8,100.00" },
      { type: "Fiat", name: "US Dollar", symbol: "USD", amount: "850", value: "$850.00" }
    ]
  },
  {
    id: 4,
    user: {
      name: "Emily Davis",
      email: "emily.d@example.com",
      avatar: ""
    },
    totalBalance: "$256,000.00",
    lastSwap: "2024-05-10 11:20",
    distribution: {
      crypto: 10,
      stocks: 85,
      fiat: 5
    },
    topAsset: "NVIDIA (NVDA)",
    assets: [
      { type: "Stock", name: "NVIDIA", symbol: "NVDA", amount: "200", value: "$180,000.00" },
      { type: "Stock", name: "Microsoft", symbol: "MSFT", amount: "150", value: "$60,000.00" },
      { type: "Crypto", name: "Bitcoin", symbol: "BTC", amount: "0.15", value: "$10,000.00" },
      { type: "Fiat", name: "British Pound", symbol: "GBP", amount: "5,000", value: "$6,000.00" }
    ]
  }
];

export default function AdminPortfolios() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [isSwapOpen, setSwapOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPortfolios = MOCK_PORTFOLIOS.filter(p => 
    p.user.name.toLowerCase().includes(search.toLowerCase()) || 
    p.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleManualSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Swap Executed Successfully",
      description: "Admin manual swap operation has been completed.",
      className: "bg-green-50 border-green-200 text-green-800",
    });
    
    setIsSubmitting(false);
    setSwapOpen(false);
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Portfolios</h1>
          <p className="text-gray-500 mt-2">
            View assets of users who have performed swap operations.
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
      
      {/* Manual Swap Dialog */}
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
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Search or select user" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PORTFOLIOS.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.user.name} ({p.user.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Asset</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    <SelectItem value="tsla">Tesla (TSLA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Asset</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    <SelectItem value="tsla">Tesla (TSLA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount to Swap</Label>
              <Input type="number" placeholder="0.00" required min="0" step="0.000001" />
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Wallet size={20} />
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50 border-green-100">+12%</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">$434,682</h3>
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
            <h3 className="text-2xl font-bold text-gray-900">1,240</h3>
            <p className="text-gray-500 text-sm">Total Swaps (30d)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <PieChart size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Crypto</h3>
            <p className="text-gray-500 text-sm">Most Held Asset Class</p>
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
          />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-gray-700 pl-6">User</TableHead>
                <TableHead className="font-semibold text-gray-700">Total Value</TableHead>
                <TableHead className="font-semibold text-gray-700 w-1/4">Asset Distribution</TableHead>
                <TableHead className="font-semibold text-gray-700">Top Asset</TableHead>
                <TableHead className="font-semibold text-gray-700">Last Swap</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPortfolios.map((portfolio) => (
                <TableRow key={portfolio.id} className="hover:bg-gray-50 border-b border-gray-50">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={portfolio.user.avatar} />
                        <AvatarFallback>{portfolio.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{portfolio.user.name}</div>
                        <div className="text-xs text-gray-500">{portfolio.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{portfolio.totalBalance}</TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="bg-orange-500" style={{ width: `${portfolio.distribution.crypto}%` }} />
                        <div className="bg-blue-500" style={{ width: `${portfolio.distribution.stocks}%` }} />
                        <div className="bg-green-500" style={{ width: `${portfolio.distribution.fiat}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {portfolio.distribution.crypto}% Crypto</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {portfolio.distribution.stocks}% Stocks</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {portfolio.distribution.fiat}% Fiat</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-gray-600">
                      {portfolio.topAsset}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{portfolio.lastSwap}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      onClick={() => setSelectedPortfolio(portfolio)}
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      View Assets <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Portfolio Details Dialog */}
      <Dialog open={!!selectedPortfolio} onOpenChange={(open) => !open && setSelectedPortfolio(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="text-blue-600" size={20} />
              Portfolio Details
            </DialogTitle>
            <DialogDescription>
              Viewing assets for <span className="font-medium text-gray-900">{selectedPortfolio?.user.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Value</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{selectedPortfolio?.totalBalance}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Top Asset</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 truncate">{selectedPortfolio?.topAsset}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium">Last Activity</p>
                <p className="text-sm font-medium text-gray-900 mt-2">{selectedPortfolio?.lastSwap}</p>
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
                    <TableHead className="text-right">Value (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPortfolio?.assets.map((asset: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {asset.name} <span className="text-gray-400 text-xs ml-1">{asset.symbol}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${asset.type === 'Crypto' ? 'text-orange-600 bg-orange-50 border-orange-100' : 
                            asset.type === 'Stock' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                            'text-green-600 bg-green-50 border-green-100'}
                        `}>
                          {asset.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{asset.amount}</TableCell>
                      <TableCell className="text-right font-medium">{asset.value}</TableCell>
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
