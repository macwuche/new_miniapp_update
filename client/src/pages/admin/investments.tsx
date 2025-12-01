import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Mock data based on the reference image
const PLANS = [
  {
    id: 1,
    name: "Beginner Plan",
    tag: null,
    displayPrice: 100,
    minDeposit: 100,
    maxDeposit: 25000,
    minReturn: 2,
    maxReturn: 2,
    giftBonus: 0,
    duration: "60 Days"
  },
  {
    id: 2,
    name: "Test",
    tag: "Popular",
    displayPrice: 500,
    minDeposit: 500,
    maxDeposit: 2999,
    minReturn: 10,
    maxReturn: 15,
    giftBonus: 0,
    duration: "5 Days"
  },
  {
    id: 3,
    name: "Basic Plan",
    tag: "regular",
    displayPrice: 500,
    minDeposit: 3000,
    maxDeposit: 29999,
    minReturn: 25,
    maxReturn: 35,
    giftBonus: 0,
    duration: "5 Days"
  },
  {
    id: 4,
    name: "Standard plan",
    tag: null,
    displayPrice: 1000,
    minDeposit: 1000,
    maxDeposit: 50000,
    minReturn: 5,
    maxReturn: 8,
    giftBonus: 50,
    duration: "30 Days"
  },
  {
    id: 5,
    name: "Business plan",
    tag: "regular",
    displayPrice: 5000,
    minDeposit: 5000,
    maxDeposit: 100000,
    minReturn: 15,
    maxReturn: 20,
    giftBonus: 200,
    duration: "15 Days"
  }
];

export default function InvestmentPlans() {
  const { toast } = useToast();

  const handleEdit = (id: number) => {
    toast({
      title: "Edit Plan",
      description: `Editing plan ID: ${id}`,
    });
  };

  const handleDelete = (id: number) => {
    toast({
      title: "Delete Plan",
      description: `Plan ID: ${id} deleted`,
      variant: "destructive",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-gray-700 mb-6">System Plans</h1>
        
        <Link href="/admin/investments/new">
          <Button className="bg-[#1a1f36] hover:bg-[#2c324c] text-white font-medium px-4 py-2 h-auto rounded-md text-sm">
            <Plus size={16} className="mr-2" />
            New plan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card key={plan.id} className="border border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-full flex justify-center items-center gap-2 mb-6">
                <h3 className="text-xl text-gray-800 font-normal">{plan.name}</h3>
                {plan.tag && (
                  <span className="text-green-500 text-sm font-normal">{plan.tag}</span>
                )}
              </div>

              <div className="flex items-start mb-8">
                <span className="text-blue-500 text-2xl font-light mt-2">$</span>
                <span className="text-blue-500 text-6xl font-normal">{plan.displayPrice}</span>
              </div>

              <div className="w-full space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Minimum Possible Deposit:</span>
                  <span className="text-gray-800 font-medium">${plan.minDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maximum Possible Deposit:</span>
                  <span className="text-gray-800 font-medium">${plan.maxDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Minimum Return:</span>
                  <span className="text-gray-800 font-medium">{plan.minReturn}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maximum Return:</span>
                  <span className="text-gray-800 font-medium">{plan.maxReturn}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gift Bonus:</span>
                  <span className="text-gray-800 font-medium">${plan.giftBonus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-800 font-medium">{plan.duration}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="bg-[#1a1f36] hover:bg-[#2c324c] w-10 h-10 p-0 rounded-md"
                  onClick={() => handleEdit(plan.id)}
                >
                  <Pencil size={14} className="text-white" />
                </Button>
                <Button 
                  className="bg-[#ff5b5b] hover:bg-[#e04a4a] w-10 h-10 p-0 rounded-md"
                  onClick={() => handleDelete(plan.id)}
                >
                  <X size={16} className="text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
