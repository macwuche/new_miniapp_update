import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function NewInvestmentPlan() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Plan Created",
      description: "The investment plan has been successfully added.",
    });
    
    setIsSubmitting(false);
    setLocation("/admin/investments");
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-700">Add Investment Plan</h1>
        <Link href="/admin/investments">
          <Button className="bg-[#1a1f36] hover:bg-[#2c324c] text-white font-medium px-4 py-2 h-auto rounded-md text-sm">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Plan Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-600 font-normal">Plan Name</Label>
              <Input id="name" placeholder="Enter Plan name" className="bg-gray-50 border-gray-200" required />
            </div>

            {/* Plan Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-600 font-normal">Plan price($)</Label>
              <Input id="price" placeholder="Enter Plan price" type="number" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">This is the maximum amount a user can pay to invest in this plan, enter the value without a comma(,)</p>
            </div>

            {/* Plan Minimum Price */}
            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-gray-600 font-normal">Plan Minimum Price ($)</Label>
              <Input id="minPrice" placeholder="Enter Plan minimum price" type="number" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">This is the minimum amount a user can pay to invest in this plan, enter the value without a comma(,)</p>
            </div>

            {/* Plan Maximum Price */}
            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-gray-600 font-normal">Plan Maximum Price ($)</Label>
              <Input id="maxPrice" placeholder="Enter Plan maximum price" type="number" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">Same as plan price, enter the value without a comma(,)</p>
            </div>

            {/* Minimum Return */}
            <div className="space-y-2">
              <Label htmlFor="minReturn" className="text-gray-600 font-normal">Minimum return (%)</Label>
              <Input id="minReturn" placeholder="Enter minimum return" type="number" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">This is the minimum return (ROI) for this plan, enter the value without a comma(,)</p>
            </div>

            {/* Maximum Return */}
            <div className="space-y-2">
              <Label htmlFor="maxReturn" className="text-gray-600 font-normal">Maximum return (%)</Label>
              <Input id="maxReturn" placeholder="Enter maximum return" type="number" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">This is the Maximum return (ROI) for this plan, enter the value without a comma(,)</p>
            </div>

            {/* Gift Bonus */}
            <div className="space-y-2">
              <Label htmlFor="bonus" className="text-gray-600 font-normal">Gift Bonus ($)</Label>
              <Input id="bonus" placeholder="0" defaultValue="0" type="number" className="bg-gray-50 border-gray-200" />
              <p className="text-xs text-gray-500">Optional Bonus if a user buys this plan.enter the value without a comma(,)</p>
            </div>

            {/* Plan Tag */}
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-gray-600 font-normal">Plan Tag</Label>
              <Input id="tag" placeholder="Enter Plan Tag" className="bg-gray-50 border-gray-200" />
              <p className="text-xs text-gray-500">Optional Plan tag. This is tags for each plan eg 'Popular', 'VIP' etc</p>
            </div>

            {/* Top up Interval */}
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-gray-600 font-normal">Top up Interval</Label>
              <Select defaultValue="monthly">
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">This specifies how often the system should add profit(ROI) to user account.</p>
            </div>

            {/* Top up Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-600 font-normal">Top up Type</Label>
              <Select defaultValue="percentage">
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">This specifies if the system should add profit in percentage(%) or a fixed amount.</p>
            </div>

            {/* Top up Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-600 font-normal">Top up Amount (in % or $ as specified above)</Label>
              <Input id="amount" placeholder="top up amount" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">This is the amount the system will add to users account as profit, based on what you selected in topup type and topup interval above.</p>
            </div>

            {/* Investment Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-600 font-normal">Investment Duration</Label>
              <Input id="duration" placeholder="eg 1 Days, 2 Weeks, 1 Months" className="bg-gray-50 border-gray-200" required />
              <p className="text-xs text-gray-500">This specifies how long the investment plan will run. Please strictly follow the guide on <strong>how to setup investment duration</strong> else it may not work.</p>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <Button type="submit" className="bg-[#1a1f36] hover:bg-[#2c324c] text-white px-6 py-2 h-auto rounded-md" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
