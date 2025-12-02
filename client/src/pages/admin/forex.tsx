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
import { Plus, Search, Edit, Trash2, RefreshCw, Globe } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for forex
const MOCK_FOREX = [
  {
    id: 1,
    name: "US Dollar",
    symbol: "USD",
    rate: "1.00",
    source: "Base",
    flag: "🇺🇸"
  },
  {
    id: 2,
    name: "Euro",
    symbol: "EUR",
    rate: "0.92",
    source: "API",
    flag: "🇪🇺"
  },
  {
    id: 3,
    name: "British Pound",
    symbol: "GBP",
    rate: "0.78",
    source: "API",
    flag: "🇬🇧"
  },
  {
    id: 4,
    name: "Japanese Yen",
    symbol: "JPY",
    rate: "151.20",
    source: "API",
    flag: "🇯🇵"
  },
  {
    id: 5,
    name: "Canadian Dollar",
    symbol: "CAD",
    rate: "1.36",
    source: "API",
    flag: "🇨🇦"
  },
  {
    id: 6,
    name: "Custom Fiat",
    symbol: "CST",
    rate: "10.50",
    source: "Manual",
    flag: "🏳️"
  }
];

export default function AdminForex() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingForex, setEditingForex] = useState<any>(null);

  const handleOpen = (forex: any = null) => {
    setEditingForex(forex);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: editingForex ? "Currency Updated" : "Currency Added",
      description: editingForex 
        ? "Fiat currency has been successfully updated." 
        : "New fiat currency has been successfully added.",
    });
    
    setIsSubmitting(false);
    setOpen(false);
    setEditingForex(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forex Currencies</h1>
          <p className="text-gray-500 mt-1">Manage fiat currencies and exchange rates.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Sync Rates
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Search currencies..." className="pl-10 bg-white" />
        </div>
        
        <Button 
          onClick={() => handleOpen(null)}
          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Custom Currency
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingForex ? "Edit Currency" : "Add Custom Currency"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Currency Name</Label>
              <Input 
                id="name" 
                defaultValue={editingForex?.name}
                placeholder="e.g. Euro" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol / Code</Label>
              <Input 
                id="symbol" 
                defaultValue={editingForex?.symbol}
                placeholder="e.g. EUR" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (to 1 USD)</Label>
              <Input 
                id="rate" 
                defaultValue={editingForex?.rate}
                placeholder="0.00" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flag">Flag Emoji / Icon</Label>
              <Input 
                id="flag" 
                defaultValue={editingForex?.flag}
                placeholder="🇪🇺" 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#6f42c1] hover:bg-[#5a32a3]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Currency"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-gray-700">Currency</TableHead>
                <TableHead className="font-semibold text-gray-700">Code</TableHead>
                <TableHead className="font-semibold text-gray-700">Rate (to USD)</TableHead>
                <TableHead className="font-semibold text-gray-700">Source</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_FOREX.map((currency) => (
                <TableRow key={currency.id} className="hover:bg-gray-50 border-b border-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                        {currency.flag}
                      </div>
                      <div className="font-medium text-gray-900">{currency.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-600">{currency.symbol}</TableCell>
                  <TableCell className="font-medium">{currency.rate}</TableCell>
                  <TableCell>
                    <Badge variant={currency.source === 'API' ? 'secondary' : currency.source === 'Base' ? 'default' : 'outline'}>
                      {currency.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        onClick={() => handleOpen(currency)}
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </Button>
                      {currency.source === 'Manual' && (
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
