import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for cryptocurrencies
const MOCK_CRYPTOS = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: "$94,532.00",
    change: "+2.5%",
    marketCap: "$1.8T",
    volume: "$42B",
    source: "API",
    logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: "$3,452.00",
    change: "-1.2%",
    marketCap: "$415B",
    volume: "$18B",
    source: "API",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  },
  {
    id: 3,
    name: "Solana",
    symbol: "SOL",
    price: "$145.20",
    change: "+5.8%",
    marketCap: "$65B",
    volume: "$4.2B",
    source: "API",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png"
  },
  {
    id: 4,
    name: "MyCustomCoin",
    symbol: "MCC",
    price: "$0.50",
    change: "0%",
    marketCap: "$1M",
    volume: "$50K",
    source: "Manual",
    logo: ""
  }
];

export default function AdminCryptos() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCrypto, setEditingCrypto] = useState<any>(null);

  const handleOpen = (crypto: any = null) => {
    setEditingCrypto(crypto);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: editingCrypto ? "Crypto Updated" : "Crypto Added",
      description: editingCrypto 
        ? "Cryptocurrency has been successfully updated." 
        : "New cryptocurrency has been successfully added.",
    });
    
    setIsSubmitting(false);
    setOpen(false);
    setEditingCrypto(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cryptocurrencies</h1>
          <p className="text-gray-500 mt-1">Manage supported cryptocurrencies and view market data.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Sync API Data
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Search cryptocurrencies..." className="pl-10 bg-white" />
        </div>
        
        <Button 
          onClick={() => handleOpen(null)}
          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Custom Crypto
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCrypto ? "Edit Cryptocurrency" : "Add Custom Cryptocurrency"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                defaultValue={editingCrypto?.name}
                placeholder="e.g. Bitcoin" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input 
                id="symbol" 
                defaultValue={editingCrypto?.symbol}
                placeholder="e.g. BTC" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input 
                id="price" 
                defaultValue={editingCrypto?.price?.replace('$', '')}
                placeholder="0.00" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input 
                id="logo" 
                defaultValue={editingCrypto?.logo}
                placeholder="https://..." 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#6f42c1] hover:bg-[#5a32a3]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Asset"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-gray-700">Asset</TableHead>
                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                <TableHead className="font-semibold text-gray-700">24h Change</TableHead>
                <TableHead className="font-semibold text-gray-700">Market Cap</TableHead>
                <TableHead className="font-semibold text-gray-700">Source</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CRYPTOS.map((crypto) => (
                <TableRow key={crypto.id} className="hover:bg-gray-50 border-b border-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {crypto.logo ? (
                          <img src={crypto.logo} alt={crypto.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">{crypto.symbol[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{crypto.name}</div>
                        <div className="text-xs text-gray-500">{crypto.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{crypto.price}</TableCell>
                  <TableCell>
                    <span className={crypto.change.startsWith('+') ? 'text-green-600' : crypto.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}>
                      {crypto.change}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{crypto.marketCap}</TableCell>
                  <TableCell>
                    <Badge variant={crypto.source === 'API' ? 'secondary' : 'outline'}>
                      {crypto.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => handleOpen(crypto)}
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </Button>
                      {crypto.source === 'Manual' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
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
