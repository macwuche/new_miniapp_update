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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for swap pairs
const MOCK_SWAPS = [
  {
    id: 1,
    assetFrom: "USD",
    assetTo: "BTC",
    rate: "1 USD = 0.000015 BTC",
    status: "Active",
    type: "Fiat to Crypto"
  },
  {
    id: 2,
    assetFrom: "BTC",
    assetTo: "USD",
    rate: "1 BTC = 65,432 USD",
    status: "Active",
    type: "Crypto to Fiat"
  },
  {
    id: 3,
    assetFrom: "TSLA",
    assetTo: "USDT",
    rate: "1 TSLA = 178.20 USDT",
    status: "Active",
    type: "Stock to Crypto"
  },
  {
    id: 4,
    assetFrom: "CAD",
    assetTo: "JPY",
    rate: "1 CAD = 110.50 JPY",
    status: "Inactive",
    type: "Fiat to Fiat"
  }
];

export default function AdminSwap() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSwap, setEditingSwap] = useState<any>(null);

  const handleOpen = (swap: any = null) => {
    setEditingSwap(swap);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: editingSwap ? "Swap Pair Updated" : "Swap Pair Added",
      description: editingSwap 
        ? "Exchange rate has been successfully updated." 
        : "New swap pair has been successfully added.",
    });
    
    setIsSubmitting(false);
    setOpen(false);
    setEditingSwap(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currency Swap</h1>
          <p className="text-gray-500 mt-1">Manage exchange rates between Cryptos, Fiat, and Stocks.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Search pairs..." className="pl-10 bg-white" />
        </div>
        
        <Button 
          onClick={() => handleOpen(null)}
          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Swap Pair
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSwap ? "Edit Swap Pair" : "Add New Swap Pair"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">From Asset</h3>
                
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select defaultValue="crypto">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="fiat">Fiat Currency</SelectItem>
                      <SelectItem value="stock">Stock Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Asset</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-center md:pt-8">
                <div className="bg-gray-100 p-2 rounded-full">
                  <ArrowRightLeft className="text-gray-500" size={20} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">To Asset</h3>
                
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select defaultValue="fiat">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="fiat">Fiat Currency</SelectItem>
                      <SelectItem value="stock">Stock Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Asset</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
              <div className="space-y-2">
                <Label>Exchange Rate</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">1 [From] = </span>
                  <Input placeholder="0.00" className="flex-1" />
                  <span className="text-sm font-medium text-gray-500">[To]</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#6f42c1] hover:bg-[#5a32a3]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Swap Pair"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-gray-700">From</TableHead>
                <TableHead className="font-semibold text-gray-700">To</TableHead>
                <TableHead className="font-semibold text-gray-700">Exchange Rate</TableHead>
                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SWAPS.map((swap) => (
                <TableRow key={swap.id} className="hover:bg-gray-50 border-b border-gray-50">
                  <TableCell className="font-medium">{swap.assetFrom}</TableCell>
                  <TableCell className="font-medium">{swap.assetTo}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">{swap.rate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {swap.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={swap.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}>
                      {swap.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => handleOpen(swap)}
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
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
