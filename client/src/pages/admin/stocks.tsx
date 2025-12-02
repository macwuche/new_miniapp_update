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
import { Plus, Search, Edit, Trash2, RefreshCw, Building2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for stocks
const MOCK_STOCKS = [
  {
    id: 1,
    name: "Apple Inc.",
    ticker: "AAPL",
    price: "$172.50",
    change: "+1.2%",
    exchange: "NASDAQ",
    source: "API",
    logo: "https://logo.clearbit.com/apple.com"
  },
  {
    id: 2,
    name: "Tesla, Inc.",
    ticker: "TSLA",
    price: "$178.20",
    change: "-2.5%",
    exchange: "NASDAQ",
    source: "API",
    logo: "https://logo.clearbit.com/tesla.com"
  },
  {
    id: 3,
    name: "Microsoft Corp.",
    ticker: "MSFT",
    price: "$420.50",
    change: "+0.8%",
    exchange: "NASDAQ",
    source: "API",
    logo: "https://logo.clearbit.com/microsoft.com"
  },
  {
    id: 4,
    name: "Netflix",
    ticker: "NFLX",
    price: "$615.00",
    change: "+3.1%",
    exchange: "NASDAQ",
    source: "API",
    logo: "https://logo.clearbit.com/netflix.com"
  },
  {
    id: 5,
    name: "Amazon",
    ticker: "AMZN",
    price: "$180.10",
    change: "+0.5%",
    exchange: "NASDAQ",
    source: "API",
    logo: "https://logo.clearbit.com/amazon.com"
  },
  {
    id: 6,
    name: "MyCustomStock",
    ticker: "MCS",
    price: "$50.00",
    change: "0%",
    exchange: "NYSE",
    source: "Manual",
    logo: ""
  }
];

export default function AdminStocks() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);

  const handleOpen = (stock: any = null) => {
    setEditingStock(stock);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: editingStock ? "Stock Updated" : "Stock Added",
      description: editingStock 
        ? "Stock asset has been successfully updated." 
        : "New stock asset has been successfully added.",
    });
    
    setIsSubmitting(false);
    setOpen(false);
    setEditingStock(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Assets</h1>
          <p className="text-gray-500 mt-1">Manage stock market assets and listings.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Sync Market Data
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Search stocks..." className="pl-10 bg-white" />
        </div>
        
        <Button 
          onClick={() => handleOpen(null)}
          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Custom Stock
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStock ? "Edit Stock Asset" : "Add Custom Stock Asset"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input 
                id="name" 
                defaultValue={editingStock?.name}
                placeholder="e.g. Apple Inc." 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol</Label>
              <Input 
                id="ticker" 
                defaultValue={editingStock?.ticker}
                placeholder="e.g. AAPL" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Current Price (USD)</Label>
              <Input 
                id="price" 
                defaultValue={editingStock?.price?.replace('$', '')}
                placeholder="0.00" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange</Label>
              <Input 
                id="exchange" 
                defaultValue={editingStock?.exchange}
                placeholder="e.g. NASDAQ" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input 
                id="logo" 
                defaultValue={editingStock?.logo}
                placeholder="https://..." 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#6f42c1] hover:bg-[#5a32a3]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Stock"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-gray-700">Company</TableHead>
                <TableHead className="font-semibold text-gray-700">Ticker</TableHead>
                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                <TableHead className="font-semibold text-gray-700">Exchange</TableHead>
                <TableHead className="font-semibold text-gray-700">Source</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_STOCKS.map((stock) => (
                <TableRow key={stock.id} className="hover:bg-gray-50 border-b border-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {stock.logo ? (
                          <img src={stock.logo} alt={stock.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="font-medium text-gray-900">{stock.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-600">{stock.ticker}</TableCell>
                  <TableCell className="font-medium">
                    {stock.price}
                    <span className={`text-xs ml-2 ${stock.change.startsWith('+') ? 'text-green-600' : stock.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                      {stock.change}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{stock.exchange}</TableCell>
                  <TableCell>
                    <Badge variant={stock.source === 'API' ? 'secondary' : 'outline'}>
                      {stock.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => handleOpen(stock)}
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </Button>
                      {stock.source === 'Manual' && (
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
