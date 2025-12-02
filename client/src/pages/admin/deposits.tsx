import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDeposits() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Gateway Added",
      description: "New payment method has been successfully added.",
    });
    
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Traditional Gateways</h1>
      </div>

      <div className="mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium px-6 py-2 h-auto rounded-md text-sm">
              <Plus size={16} className="mr-2" />
              Add Manual Gateway
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-lg font-normal text-gray-700">Add New payment Method</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-600 font-normal">Name</Label>
                <Input id="name" placeholder="Payment method name" className="bg-white border-gray-200" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Minimum Amount */}
                <div className="space-y-2">
                  <Label htmlFor="minAmount" className="text-gray-600 font-normal">Minimum Amount</Label>
                  <Input id="minAmount" className="bg-white border-gray-200" required />
                  <p className="text-xs text-gray-500">Required but only applies to withdrawal</p>
                </div>

                {/* Maximum Amount */}
                <div className="space-y-2">
                  <Label htmlFor="maxAmount" className="text-gray-600 font-normal">Maximum Amount</Label>
                  <Input id="maxAmount" className="bg-white border-gray-200" required />
                  <p className="text-xs text-gray-500">Required but only applies to withdrawal</p>
                </div>

                {/* Charges */}
                <div className="space-y-2">
                  <Label htmlFor="charges" className="text-gray-600 font-normal">Charges</Label>
                  <Input id="charges" className="bg-white border-gray-200" required />
                  <p className="text-xs text-gray-500">Required but only applies to withdrawal</p>
                </div>

                {/* Charges Type */}
                <div className="space-y-2">
                  <Label htmlFor="chargesType" className="text-gray-600 font-normal">Charges Type</Label>
                  <Select defaultValue="percentage">
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage(%)</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Required but only applies to withdrawal</p>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-600 font-normal">Type</Label>
                  <Select defaultValue="crypto">
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="fiat">Fiat</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-gray-600 font-normal">Image url (Logo)</Label>
                  <Input id="imageUrl" className="bg-white border-gray-200" />
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label htmlFor="walletAddress" className="text-gray-600 font-normal">Wallet Address</Label>
                  <Input id="walletAddress" className="bg-white border-gray-200" />
                </div>

                {/* Barcode Image */}
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-gray-600 font-normal">Barcode Image (Optional)</Label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-md p-1 bg-white">
                    <Button type="button" variant="secondary" size="sm" className="h-8 text-xs font-normal">
                      Choose File
                    </Button>
                    <span className="text-xs text-gray-500">No file chosen</span>
                  </div>
                  <p className="text-xs text-gray-500">Recommended Size: 575px both width and height</p>
                </div>

                {/* Wallet Address Network Type */}
                <div className="space-y-2">
                  <Label htmlFor="networkType" className="text-gray-600 font-normal">Wallet Address Network Type</Label>
                  <Input id="networkType" placeholder="eq ERC" className="bg-white border-gray-200" />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-600 font-normal">Status</Label>
                  <Select defaultValue="enable">
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enable">Enable</SelectItem>
                      <SelectItem value="disable">Disable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type for */}
                <div className="space-y-2">
                  <Label htmlFor="typeFor" className="text-gray-600 font-normal">Type for</Label>
                  <Select defaultValue="deposit">
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Note */}
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-gray-600 font-normal">Optional Note</Label>
                  <Input id="note" placeholder="Payment may take up to 24 hours" className="bg-white border-gray-200" />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="bg-[#1a1f36] hover:bg-[#2c324c] text-white font-medium px-6 py-2 h-10 rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Method"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <div className="rounded-sm border border-gray-100 overflow-hidden min-h-[400px] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="font-bold text-gray-700 py-4 w-[200px]">Name</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Initiated At</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Payment Limit</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Percent Charge</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Method Currency</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Empty rows to match the visual height in the reference image */}
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50 hover:bg-transparent h-16">
                    <TableCell colSpan={7} className="p-0"></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
