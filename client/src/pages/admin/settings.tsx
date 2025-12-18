import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Save, AlertTriangle, Shield, Bell, Settings as SettingsIcon, DollarSign, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SystemSettings {
  id?: number;
  siteName: string;
  mainLogo?: string | null;
  supportEmail: string;
  telegramSupportUrl?: string | null;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  minDeposit: string;
  minWithdrawal: string;
  maintenanceMode: boolean;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<SystemSettings>>({
    siteName: 'Crypto Trading Platform',
    mainLogo: null,
    supportEmail: 'support@example.com',
    telegramSupportUrl: '',
    depositEnabled: true,
    withdrawalEnabled: true,
    minDeposit: '10',
    minWithdrawal: '10',
    maintenanceMode: false
  });

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || 'Crypto Trading Platform',
        mainLogo: settings.mainLogo || null,
        supportEmail: settings.supportEmail || '',
        telegramSupportUrl: settings.telegramSupportUrl || '',
        depositEnabled: settings.depositEnabled ?? true,
        withdrawalEnabled: settings.withdrawalEnabled ?? true,
        minDeposit: settings.minDeposit || '10',
        minWithdrawal: settings.minWithdrawal || '10',
        maintenanceMode: settings.maintenanceMode ?? false
      });
      if (settings.mainLogo) {
        setLogoPreview(settings.mainLogo);
      }
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData(prev => ({ ...prev, mainLogo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, mainLogo: null }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save settings');

      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      toast({
        title: "Settings Saved",
        description: "System configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 mt-2">Manage platform configuration and operational parameters.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-settings">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          Save Changes
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
                          onClick={handleLogoRemove}
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
                  <Input 
                    value={formData.siteName} 
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    data-testid="input-site-name"
                  />
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
                  <Label>Minimum Deposit (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                    <Input 
                      value={formData.minDeposit} 
                      onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                      type="number" 
                      className="pl-7" 
                      data-testid="input-min-deposit"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Withdrawal (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                    <Input 
                      value={formData.minWithdrawal} 
                      onChange={(e) => setFormData({ ...formData, minWithdrawal: e.target.value })}
                      type="number" 
                      className="pl-7" 
                      data-testid="input-min-withdrawal"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Operations</h3>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Deposits</Label>
                    <p className="text-sm text-gray-500">Allow users to deposit funds</p>
                  </div>
                  <Switch 
                    checked={formData.depositEnabled} 
                    onCheckedChange={(v) => setFormData({ ...formData, depositEnabled: v })}
                    data-testid="switch-deposit-enabled"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Withdrawals</Label>
                    <p className="text-sm text-gray-500">Allow users to withdraw funds</p>
                  </div>
                  <Switch 
                    checked={formData.withdrawalEnabled} 
                    onCheckedChange={(v) => setFormData({ ...formData, withdrawalEnabled: v })}
                    data-testid="switch-withdrawal-enabled"
                  />
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
                  <Input 
                    value={formData.supportEmail} 
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    type="email" 
                    data-testid="input-support-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Support Link</Label>
                  <Input 
                    value={formData.telegramSupportUrl || ''} 
                    onChange={(e) => setFormData({ ...formData, telegramSupportUrl: e.target.value })}
                    placeholder="https://t.me/YourSupport"
                    data-testid="input-telegram-support-url"
                  />
                  <p className="text-xs text-gray-500">Users will be directed here for Telegram support from the profile page.</p>
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
                <Switch 
                  checked={formData.maintenanceMode} 
                  onCheckedChange={(v) => setFormData({ ...formData, maintenanceMode: v })}
                  data-testid="switch-maintenance-mode"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
