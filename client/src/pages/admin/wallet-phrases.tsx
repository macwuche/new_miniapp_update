import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

export default function WalletPhrases() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wallet Phrases</h1>
        <p className="text-gray-500 mt-2">Securely manage user wallet recovery phrases and keys.</p>
      </div>
      <Card className="border-dashed border-2 border-gray-200 shadow-none bg-gray-50">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
            <Key size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Restricted Access</h3>
          <p className="text-gray-500 text-center mt-2 max-w-md">
            Access to wallet phrases is restricted to super admins. Please verify your identity to proceed.
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
