import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PaymentAccounts() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/withdraw">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Payment Accounts</h1>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-6">
            You have full control to manage your crypto account setting.
          </p>

          {/* Tabs / Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <div className="inline-block border-b-2 border-blue-500 pb-2 px-1">
              <span className="text-blue-600 font-bold text-sm">Accounts</span>
            </div>
          </div>

          {/* Warning/Info Box */}
          <Card className="bg-amber-50 border border-amber-100 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              <p className="text-amber-800 font-bold text-sm">
                You have not added any crypto withdraw account yet in your account.
              </p>
              
              <p className="text-amber-700 text-sm leading-relaxed">
                Please add a crypto address(s) to your accounts that you'd like to withdraw funds.
              </p>

              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold border-none shadow-md shadow-yellow-500/20 h-10 px-6 rounded-lg">
                Add Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
