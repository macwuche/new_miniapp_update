import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

export default function AdminCryptos() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cryptocurrencies</h1>
        <p className="text-gray-500 mt-2">Manage supported cryptocurrencies.</p>
      </div>
      <Card className="border-dashed border-2 border-gray-200 shadow-none bg-gray-50">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
            <Coins size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Crypto Management</h3>
          <p className="text-gray-500 text-center mt-2 max-w-md">
            Page under construction.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
