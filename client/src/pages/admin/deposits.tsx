import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function AdminDeposits() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Traditional Gateways</h1>
      </div>

      <div className="mb-6">
        <Button className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium px-6 py-2 h-auto rounded-md text-sm">
          <Plus size={16} className="mr-2" />
          Add Manual Gateway
        </Button>
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
