import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreHorizontal, Play, Pause, Trash2, Activity, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for bots
const MOCK_BOTS = [
  { id: "BOT-1001", user: "Alex Thompson", type: "HFT Scalper", pair: "BTC/USDT", status: "Running", profit: "+12.5%", uptime: "14d 2h" },
  { id: "BOT-1002", user: "Sarah Jenkins", type: "DCA Strategy", pair: "ETH/USDT", status: "Stopped", profit: "+4.2%", uptime: "0d 0h" },
  { id: "BOT-1003", user: "Michael Chen", type: "Grid Trader", pair: "SOL/USDT", status: "Running", profit: "-1.8%", uptime: "2d 5h" },
  { id: "BOT-1004", user: "David Miller", type: "HFT Scalper", pair: "BTC/USDT", status: "Running", profit: "+8.9%", uptime: "5d 12h" },
  { id: "BOT-1005", user: "Jessica Wu", type: "Smart Rebalance", pair: "BNB/USDT", status: "Paused", profit: "+0.5%", uptime: "1d 1h" },
  { id: "BOT-1006", user: "Robert Wilson", type: "DCA Strategy", pair: "ADA/USDT", status: "Running", profit: "+3.1%", uptime: "9d 4h" },
];

export default function BotManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleAction = (action: string, botId: string) => {
    toast({
      title: `Bot ${action}`,
      description: `Successfully ${action.toLowerCase()} bot ${botId}`,
    });
  };

  const filteredBots = MOCK_BOTS.filter(bot => 
    bot.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bot Management</h1>
          <p className="text-gray-500 mt-2">Monitor and control active trading bots across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filter
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Activity size={16} />
            System Status
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 font-medium mb-1">Total Active Bots</p>
                <h3 className="text-3xl font-bold">8,203</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm">
              <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold">+124</span>
              <span>started today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium mb-1">Total Volume (24h)</p>
                <h3 className="text-3xl font-bold text-gray-900">$14.2M</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-600 font-bold">+5.2%</span>
              <span className="text-gray-500">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium mb-1">Avg. Profitability</p>
                <h3 className="text-3xl font-bold text-gray-900">+2.4%</h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-green-600 font-bold">+0.8%</span>
              <span className="text-gray-500">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Bots</CardTitle>
              <CardDescription>List of all user bots currently deployed</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search by user, ID or pair..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell className="font-medium">{bot.id}</TableCell>
                  <TableCell>{bot.user}</TableCell>
                  <TableCell>{bot.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {bot.pair}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={
                        bot.status === "Running" 
                          ? "bg-green-50 text-green-700 hover:bg-green-100" 
                          : bot.status === "Paused"
                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    >
                      {bot.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-bold ${bot.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {bot.profit}
                  </TableCell>
                  <TableCell className="text-right text-gray-500">{bot.uptime}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction('Started', bot.id)}>
                          <Play size={14} className="mr-2 text-green-600" />
                          Start Bot
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Paused', bot.id)}>
                          <Pause size={14} className="mr-2 text-yellow-600" />
                          Pause Bot
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('Terminated', bot.id)} className="text-red-600">
                          <Trash2 size={14} className="mr-2" />
                          Terminate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
