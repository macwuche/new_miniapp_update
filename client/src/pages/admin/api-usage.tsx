import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Globe, 
  Coins, 
  LineChart,
  Copy,
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ApiConfiguration() {
  const { toast } = useToast();
  const [botToken, setBotToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [showToken, setShowToken] = useState(false);

  const handleConnectBot = async () => {
    if (!botToken) {
      toast({
        title: "Token Required",
        description: "Please enter a valid Telegram Bot Token",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsConnecting(false);
    
    // Mock successful connection
    setBotInfo({
      username: "TradeMaster_Bot",
      name: "TradeMaster AI Assistant",
      id: "123456789",
      canJoinGroups: true,
      canReadGroupMessages: false,
      supportsInlineQueries: true,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TradeMaster"
    });

    toast({
      title: "Bot Connected",
      description: "Successfully authenticated with Telegram API",
    });
  };

  const handleDisconnect = () => {
    setBotInfo(null);
    setBotToken("");
    toast({
      title: "Bot Disconnected",
      description: "Telegram integration has been removed",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API Configuration</h1>
        <p className="text-gray-500 mt-2">Manage external integrations and API keys for the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Telegram Integration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Bot size={24} />
                </div>
                <div>
                  <CardTitle>Telegram Bot Integration</CardTitle>
                  <CardDescription>Connect your Telegram bot to power the Mini App</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!botInfo ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Bot Token</Label>
                    <div className="relative">
                      <Input 
                        id="token" 
                        type={showToken ? "text" : "password"}
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" 
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        className="pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Obtain this token from <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">@BotFather</a> on Telegram.
                    </p>
                  </div>

                  <Button 
                    onClick={handleConnectBot} 
                    disabled={isConnecting}
                    className="w-full bg-[#24A1DE] hover:bg-[#1a8bbd] text-white"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Verifying Token...
                      </>
                    ) : (
                      <>
                        Connect Bot
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Connected Bot Info */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Avatar className="w-20 h-20 border-4 border-white shadow-sm">
                      <AvatarImage src={botInfo.avatar} />
                      <AvatarFallback>BOT</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{botInfo.name}</h3>
                        <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                      </div>
                      <p className="text-blue-600 font-medium">@{botInfo.username}</p>
                      <p className="text-sm text-gray-500">ID: {botInfo.id}</p>
                    </div>

                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900">Webhook Configuration</h4>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 uppercase">Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={`https://api.yourdomain.com/webhook/telegram/${botInfo.id}`} className="bg-gray-50 font-mono text-sm text-gray-500" />
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(`https://api.yourdomain.com/webhook/telegram/${botInfo.id}`)}>
                          <Copy size={16} />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-500" />
                        Webhook is currently active and receiving updates
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Data APIs - Placeholder for Future */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <LineChart size={24} />
                </div>
                <div>
                  <CardTitle>Market Data APIs</CardTitle>
                  <CardDescription>Configure data sources for real-time pricing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Crypto */}
              <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="p-2 bg-orange-100 rounded-md text-orange-600 mt-1">
                  <Coins size={20} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Cryptocurrency Data</Label>
                    <Badge variant="outline" className="text-gray-500">Coming Soon</Badge>
                  </div>
                  <Input placeholder="Enter API Key" disabled className="bg-gray-100" />
                </div>
              </div>

              {/* Forex */}
              <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="p-2 bg-green-100 rounded-md text-green-600 mt-1">
                  <Globe size={20} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Forex Exchange Rates</Label>
                    <Badge variant="outline" className="text-gray-500">Coming Soon</Badge>
                  </div>
                  <Input placeholder="Enter API Key" disabled className="bg-gray-100" />
                </div>
              </div>

              {/* Stocks */}
              <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="p-2 bg-blue-100 rounded-md text-blue-600 mt-1">
                  <LineChart size={20} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Stock Market Data</Label>
                    <Badge variant="outline" className="text-gray-500">Coming Soon</Badge>
                  </div>
                  <Input placeholder="Enter API Key" disabled className="bg-gray-100" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 p-4">
               <p className="text-xs text-gray-500 mx-auto">
                 Additional market data integrations will be available in the next update.
               </p>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Documentation/Help */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Quick Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-200">1. Create a Bot</h4>
                <p className="text-sm text-slate-300">
                  Open Telegram and search for <span className="font-mono bg-slate-700 px-1 rounded">@BotFather</span>. Send the command <span className="font-mono bg-slate-700 px-1 rounded">/newbot</span>.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-200">2. Get Token</h4>
                <p className="text-sm text-slate-300">
                  Copy the HTTP API Token provided by BotFather and paste it in the configuration field.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-200">3. Configure Menu</h4>
                <p className="text-sm text-slate-300">
                  Use <span className="font-mono bg-slate-700 px-1 rounded">/setmenubutton</span> in BotFather to set up your Mini App URL.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Telegram API</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Webhook Service</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
