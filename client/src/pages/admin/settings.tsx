import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Save, AlertTriangle, Shield, Bell, Settings as SettingsIcon, DollarSign, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "System configuration has been updated successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-2">Manage platform configuration and operational parameters.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          {isSaving ? "Saving..." : (
            <>
              <Save size={18} className="mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 h-12 w-full justify-start rounded-xl overflow-x-auto">
          <TabsTrigger value="branding" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 h-10 px-6 rounded-lg">
            <ImageIcon size={16} className="mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 h-10 px-6 rounded-lg">
            <DollarSign size={16} className="mr-2" />
            Trading & Fees
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 h-10 px-6 rounded-lg">
            <Shield size={16} className="mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 h-10 px-6 rounded-lg">
            <Bell size={16} className="mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 h-10 px-6 rounded-lg">
            <SettingsIcon size={16} className="mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Platform Branding</CardTitle>
              <CardDescription>Customize your platform's visual identity and logos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-base">Main Logo</Label>
                    <p className="text-sm text-gray-500">Displayed on the login screen and sidebar.</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    {logoPreview ? (
                      <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-lg shadow-sm p-2">
                        <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => setLogoPreview(null)}
                        >
                          <span className="sr-only">Remove</span>
                          <span className="text-xs">×</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                        <ImageIcon className="text-gray-300 w-12 h-12" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <Button variant="outline" className="relative" size="sm">
                        <Upload size={16} className="mr-2" />
                        Upload Image
                        <Input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Recommended: 512x512px, PNG or SVG</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-base">Platform Name</Label>
                    <p className="text-sm text-gray-500">Used in emails and browser titles.</p>
                  </div>
                  <Input defaultValue="TradeMaster Pro" />
                  
                  <Separator className="my-4" />

                  <div className="space-y-1">
                    <Label className="text-base">Dark Mode Logo</Label>
                    <p className="text-sm text-gray-500">Optional version for dark themes.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="w-full" disabled>
                      <Upload size={16} className="mr-2" />
                      Upload Dark Variant
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Trading Configuration</CardTitle>
              <CardDescription>Set global parameters for trading operations and limits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Trading Fee (%)</Label>
                  <div className="relative">
                    <Input defaultValue="0.1" type="number" step="0.01" />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-500">Applied to all spot trading pairs unless overridden.</p>
                </div>
                <div className="space-y-2">
                  <Label>Bot Performance Fee (%)</Label>
                  <div className="relative">
                    <Input defaultValue="2.5" type="number" step="0.1" />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-500">Deducted from profits generated by AI bots.</p>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Deposit (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                    <Input defaultValue="50" type="number" className="pl-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Withdrawal (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                    <Input defaultValue="100" type="number" className="pl-7" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Risk Management</h3>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Max Leverage Cap</Label>
                    <p className="text-sm text-gray-500">Limit the maximum leverage available to standard users</p>
                  </div>
                  <div className="w-[100px]">
                    <Input defaultValue="100" type="number" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require KYC for Withdrawals &gt; $10k</Label>
                    <p className="text-sm text-gray-500">Enforce identity verification for large transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security Policy</CardTitle>
              <CardDescription>Manage access controls and security protocols.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Admin Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin dashboard access</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">User Login Notifications</Label>
                  <p className="text-sm text-gray-500">Alert users via Telegram on new device logins</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Admin Session Timeout (Minutes)</Label>
                <Input defaultValue="30" type="number" className="max-w-[200px]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
              <CardDescription>Configure automated messages and support contacts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Support Email Address</Label>
                  <Input defaultValue="support@brokerage.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Announcement Channel</Label>
                  <Input defaultValue="@BrokerageAnnouncements" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Automated Alerts</h3>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Deposit Confirmations</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Withdrawal Status Updates</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Bot Profit Reports (Daily)</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="border-none shadow-sm border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle size={20} />
                <span className="font-bold uppercase text-sm tracking-wide">Danger Zone</span>
              </div>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Restrict user access during scheduled updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-red-900">Enable Maintenance Mode</Label>
                  <p className="text-sm text-red-700">
                    This will disconnect all active users and pause trading bots.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
