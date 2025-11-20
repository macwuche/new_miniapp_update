import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, Wallet, Settings, Percent } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const INVESTMENT_PLANS = [
  {
    id: "mercury",
    name: "Mercury (Fixed Invest)",
    duration: "7 days",
    profit: "0.25%",
    frequency: "hourly",
    minAmount: 100
  },
  {
    id: "venus",
    name: "Venus (Standard)",
    duration: "14 days",
    profit: "0.50%",
    frequency: "hourly",
    minAmount: 500
  },
  {
    id: "earth",
    name: "Earth (Premium)",
    duration: "30 days",
    profit: "1.2%",
    frequency: "daily",
    minAmount: 1000
  }
];

export default function Trade() {
  const [selectedPlan, setSelectedPlan] = useState(INVESTMENT_PLANS[0]);
  const [amount, setAmount] = useState("100");

  return (
    <MobileLayout>
      <div className="bg-gray-50 min-h-screen pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Invest & Earn</h1>
          </div>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invest & Earn</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We have various investment plans for you.
              <br />
              You can invest daily, weekly or monthly and start earning now.
            </p>
          </div>

          <div className="space-y-6">
            {/* Invested Plan Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Invested Plan</Label>
              <Select 
                value={selectedPlan.id} 
                onValueChange={(val) => setSelectedPlan(INVESTMENT_PLANS.find(p => p.id === val) || INVESTMENT_PLANS[0])}
              >
                <SelectTrigger className="w-full h-auto p-4 bg-white border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors [&>span]:w-full">
                  <div className="flex items-center gap-4 w-full text-left">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <Settings size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{selectedPlan.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        Invest for {selectedPlan.duration} & earn {selectedPlan.frequency} {selectedPlan.profit} as profit.
                      </p>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="py-3">
                      <span className="font-medium">{plan.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Investment Amount */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Fixed Investment Amount</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 bg-white border-gray-200 rounded-xl text-lg px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500/20"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold border-l border-gray-200 pl-3 h-6 flex items-center">
                  USD
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                Note: The investment amount is a fixed amount for the selected plan.
              </p>
            </div>

            {/* Payment Account */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">Payment Account</Label>
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Main Balance</p>
                  <p className="text-xs text-gray-500">
                    Current Balance: 50,000.00 USD <span className="text-gray-400">( 50,000.00 USD )</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-lg shadow-blue-600/20 mt-4">
              Continue to Invest
            </Button>

            <p className="text-center text-xs text-gray-400 italic mt-4">
              By continue this, you agree to our investment terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
