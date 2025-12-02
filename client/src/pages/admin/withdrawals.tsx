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
import { Badge } from "@/components/ui/badge";

// Mock data for withdrawals
const MOCK_WITHDRAWALS = [
  {
    id: 1,
    name: "Bank Transfer",
    initiatedAt: "2024-11-10 01:27 PM",
    limit: "$100 - $1000000",
    charge: "1%",
    currency: "$1 = 1 USD",
    status: "Active",
    
    // Additional fields for edit form
    minAmount: "100",
    maxAmount: "1000000",
    charges: "1",
    chargesType: "percentage",
    type: "bank",
    imageUrl: "",
    walletAddress: "",
    networkType: "",
    typeFor: "withdrawal",
    note: "Processing time: 1-3 business days"
  },
  {
    id: 2,
    name: "USDT (TRC20)",
    initiatedAt: "2024-11-10 02:46 PM",
    limit: "$50 - $1000000",
    charge: "1 USDT",
    currency: "$1 = 1 ₮",
    status: "Active",

    minAmount: "50",
    maxAmount: "1000000",
    charges: "1",
    chargesType: "fixed",
    type: "crypto",
    imageUrl: "",
    walletAddress: "",
    networkType: "TRC20",
    typeFor: "withdrawal",
    note: "Instant withdrawal"
  },
  {
    id: 3,
    name: "Bitcoin",
    initiatedAt: "2024-11-12 05:54 AM",
    limit: "$100 - $1000000",
    charge: "0.0005 BTC",
    currency: "$1 = 0.000015 ₿",
    status: "Active",

    minAmount: "100",
    maxAmount: "1000000",
    charges: "0.0005",
    chargesType: "fixed",
    type: "crypto",
    imageUrl: "",
    walletAddress: "",
    networkType: "BTC",
    typeFor: "withdrawal",
    note: "Network confirmation required"
  }
];

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);

  const handleOpen = (gateway: any = null) => {
    setEditingGateway(gateway);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: editingGateway ? "Method Updated" : "Method Added",
      description: editingGateway 
        ? "Withdrawal method has been successfully updated." 
        : "New withdrawal method has been successfully added.",
    });
    
    setIsSubmitting(false);
    setOpen(false);
    setEditingGateway(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Withdrawal Methods</h1>
      </div>

      <div className="mb-6">
        <Button 
          onClick={() => handleOpen(null)}
          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium px-6 py-2 h-auto rounded-md text-sm"
        >
          <Plus size={16} className="mr-2" />
          Add Manual Method
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-lg font-normal text-gray-700">
                {editingGateway ? "Edit Withdrawal Method" : "Add New Withdrawal Method"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="space-y-6" key={editingGateway?.id || 'new'}>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-600 font-normal">Name</Label>
                <Input 
                  id="name" 
                  defaultValue={editingGateway?.name}
                  placeholder="Withdrawal method name" 
                  className="bg-white border-gray-200" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Minimum Amount */}
                <div className="space-y-2">
                  <Label htmlFor="minAmount" className="text-gray-600 font-normal">Minimum Amount</Label>
                  <Input 
                    id="minAmount" 
                    defaultValue={editingGateway?.minAmount}
                    className="bg-white border-gray-200" 
                    required 
                  />
                  <p className="text-xs text-gray-500">Required for withdrawal limits</p>
                </div>

                {/* Maximum Amount */}
                <div className="space-y-2">
                  <Label htmlFor="maxAmount" className="text-gray-600 font-normal">Maximum Amount</Label>
                  <Input 
                    id="maxAmount" 
                    defaultValue={editingGateway?.maxAmount}
                    className="bg-white border-gray-200" 
                    required 
                  />
                  <p className="text-xs text-gray-500">Required for withdrawal limits</p>
                </div>

                {/* Charges */}
                <div className="space-y-2">
                  <Label htmlFor="charges" className="text-gray-600 font-normal">Charges</Label>
                  <Input 
                    id="charges" 
                    defaultValue={editingGateway?.charges}
                    className="bg-white border-gray-200" 
                    required 
                  />
                  <p className="text-xs text-gray-500">Processing fee per withdrawal</p>
                </div>

                {/* Charges Type */}
                <div className="space-y-2">
                  <Label htmlFor="chargesType" className="text-gray-600 font-normal">Charges Type</Label>
                  <Select defaultValue={editingGateway?.chargesType || "percentage"}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage(%)</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-600 font-normal">Type</Label>
                  <Select defaultValue={editingGateway?.type || "crypto"}>
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
                  <Input 
                    id="imageUrl" 
                    defaultValue={editingGateway?.imageUrl}
                    className="bg-white border-gray-200" 
                  />
                </div>

                {/* Wallet Address (Optional for Withdrawal) */}
                <div className="space-y-2">
                  <Label htmlFor="walletAddress" className="text-gray-600 font-normal">Sender Wallet Address (Optional)</Label>
                  <Input 
                    id="walletAddress" 
                    defaultValue={editingGateway?.walletAddress}
                    className="bg-white border-gray-200" 
                    placeholder="Address funds will be sent from"
                  />
                </div>

                {/* Barcode Image (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-gray-600 font-normal">Barcode Image (Optional)</Label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-md p-1 bg-white">
                    <Button type="button" variant="secondary" size="sm" className="h-8 text-xs font-normal">
                      Choose File
                    </Button>
                    <span className="text-xs text-gray-500">No file chosen</span>
                  </div>
                </div>

                {/* Wallet Address Network Type */}
                <div className="space-y-2">
                  <Label htmlFor="networkType" className="text-gray-600 font-normal">Network Type</Label>
                  <Input 
                    id="networkType" 
                    defaultValue={editingGateway?.networkType}
                    placeholder="e.g. ERC20, TRC20, SEPA" 
                    className="bg-white border-gray-200" 
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-600 font-normal">Status</Label>
                  <Select defaultValue={editingGateway?.status === "Active" ? "enable" : editingGateway?.status === "Inactive" ? "disable" : "enable"}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enable">Enable</SelectItem>
                      <SelectItem value="disable">Disable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type for - Fixed to Withdrawal */}
                <div className="space-y-2">
                  <Label htmlFor="typeFor" className="text-gray-600 font-normal">Type for</Label>
                  <Select defaultValue="withdrawal" disabled>
                    <SelectTrigger className="bg-gray-100 border-gray-200">
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
                  <Input 
                    id="note" 
                    defaultValue={editingGateway?.note}
                    placeholder="Processing time, restrictions, etc." 
                    className="bg-white border-gray-200" 
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="bg-[#1a1f36] hover:bg-[#2c324c] text-white font-medium px-6 py-2 h-10 rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : (editingGateway ? "Update Method" : "Save Method")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <div className="rounded-sm border border-gray-100 overflow-x-auto min-h-[400px] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="font-bold text-gray-700 py-4 w-[200px]">Name</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Initiated At</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Limit</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Charge</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Currency</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Status</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_WITHDRAWALS.map((gateway) => (
                  <TableRow key={gateway.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-700 py-4">{gateway.name}</TableCell>
                    <TableCell className="text-gray-600 py-4">{gateway.initiatedAt}</TableCell>
                    <TableCell className="text-gray-600 py-4 font-medium">{gateway.limit}</TableCell>
                    <TableCell className="text-gray-600 py-4">{gateway.charge}</TableCell>
                    <TableCell className="text-gray-600 py-4 font-mono text-xs">{gateway.currency}</TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        className={`rounded-md px-2 py-1 text-xs font-normal ${
                          gateway.status === "Active" 
                            ? "bg-[#10b981] hover:bg-[#059669] text-white" 
                            : "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                        }`}
                      >
                        {gateway.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button 
                        onClick={() => handleOpen(gateway)}
                        variant="ghost" 
                        className="text-[#3b82f6] hover:text-[#2563eb] hover:bg-blue-50 h-8 px-3 text-sm font-medium"
                      >
                        Edit
                      </Button>
                    </TableCell>
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
