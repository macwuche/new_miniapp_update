import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentAccounts() {
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

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

              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold border-none shadow-md shadow-yellow-500/20 h-10 px-6 rounded-lg"
                onClick={() => setIsAddAccountOpen(true)}
              >
                Add Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Add Account Dialog */}
        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogContent className="sm:max-w-md rounded-xl w-[95%] p-0 overflow-hidden bg-white">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-gray-900">Add a Crypto Account</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Add a Crypto withdrawal account to withdraw your funds.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Email & Currency Row */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Your account email address <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      placeholder="Enter email address" 
                      className="h-11 rounded-lg border-gray-200 bg-white focus:border-blue-500"
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Currency
                    </Label>
                    <Select defaultValue="BTC">
                      <SelectTrigger className="h-11 rounded-lg border-gray-200 bg-white">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="TRX">TRX</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic -mt-4">
                  You can easily identify your account using the provided Email.
                </p>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Crypto Wallet Address (BTC/USDT)
                  </Label>
                  <Input 
                    placeholder="btcxxxxxxxxxxxxxxxxxxxxxxxxxxxx5c" 
                    className="h-11 rounded-lg border-gray-200 bg-white focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 italic pt-1">
                    . The system wont process Your payout if you leave blank.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-gray-50">
              <Button className="bg-blue-400 hover:bg-blue-500 text-white font-bold h-11 px-6 rounded-lg shadow-sm w-auto min-w-[140px]">
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
