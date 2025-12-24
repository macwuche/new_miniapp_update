import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Power, Bot, Loader2, Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

interface AiBot {
  id: number;
  name: string;
  description: string;
  category: 'crypto' | 'forex' | 'stock';
  subscriptionFee: string;
  price: string;
  durationDays: number;
  durationUnit: 'minutes' | 'days' | 'weeks' | 'months';
  expectedRoi: string;
  minInvestment: string;
  maxInvestment: string;
  minProfitPercent: string;
  maxProfitPercent: string;
  minWinPercent: string;
  maxWinPercent: string;
  minLossPercent: string;
  maxLossPercent: string;
  reactivationFee: string;
  tradingAssets: string[];
  assetDistribution: Record<string, number>;
  totalGains: string;
  totalLosses: string;
  winRate: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Subscriber {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  investmentAmount: string;
  currentProfit: string;
  allocatedAmount: string;
  remainingAllocation: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'paused' | 'expired' | 'completed';
  isPaused: boolean;
  isStopped: boolean;
  lastProfitDate: string | null;
}

interface SubscriberFormData {
  currentProfit: string;
  allocatedAmount: string;
  remainingAllocation: string;
  isPaused: boolean;
  isStopped: boolean;
  status: 'active' | 'paused' | 'expired' | 'completed';
}

interface BotFormData {
  name: string;
  description: string;
  category: 'crypto' | 'forex' | 'stock';
  subscriptionFee: string;
  price: string;
  durationDays: string;
  durationUnit: 'minutes' | 'days' | 'weeks' | 'months';
  minInvestment: string;
  maxInvestment: string;
  minProfitPercent: string;
  maxProfitPercent: string;
  minWinPercent: string;
  maxWinPercent: string;
  minLossPercent: string;
  maxLossPercent: string;
  reactivationFee: string;
  tradingAssets: string[];
  assetDistribution: Record<string, number>;
  expectedRoi: string;
  logo: string;
  isActive: boolean;
}

const defaultFormData: BotFormData = {
  name: "",
  description: "",
  category: "crypto",
  subscriptionFee: "",
  price: "",
  durationDays: "",
  durationUnit: "days",
  minInvestment: "",
  maxInvestment: "",
  minProfitPercent: "",
  maxProfitPercent: "",
  minWinPercent: "50",
  maxWinPercent: "70",
  minLossPercent: "10",
  maxLossPercent: "20",
  reactivationFee: "",
  tradingAssets: [],
  assetDistribution: {},
  expectedRoi: "",
  logo: "",
  isActive: true,
};

export default function BotManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubscribersDialogOpen, setIsSubscribersDialogOpen] = useState(false);
  const [editSubscriberDialogOpen, setEditSubscriberDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<AiBot | null>(null);
  const [deletingBot, setDeletingBot] = useState<AiBot | null>(null);
  const [viewingBot, setViewingBot] = useState<AiBot | null>(null);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [formData, setFormData] = useState<BotFormData>(defaultFormData);
  const [subscriberFormData, setSubscriberFormData] = useState<SubscriberFormData>({
    currentProfit: "",
    allocatedAmount: "",
    remainingAllocation: "",
    isPaused: false,
    isStopped: false,
    status: "active",
  });

  const { data: bots = [], isLoading } = useQuery<AiBot[]>({
    queryKey: ['/api/admin/bots'],
    queryFn: async () => {
      const res = await fetch('/api/admin/bots', { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch bots");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<AiBot>) => {
      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to create bot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bots'] });
      toast({ title: "Bot Created", description: "The AI bot has been created successfully." });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create bot.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AiBot> }) => {
      const res = await fetch(`/api/admin/bots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to update bot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bots'] });
      toast({ title: "Bot Updated", description: "The AI bot has been updated successfully." });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update bot.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/bots/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error("Failed to delete bot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bots'] });
      toast({ title: "Bot Deleted", description: "The AI bot has been deleted successfully." });
      setIsDeleteDialogOpen(false);
      setDeletingBot(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete bot.", variant: "destructive" });
    },
  });

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery<Subscriber[]>({
    queryKey: ['/api/admin/bots', viewingBot?.id, 'subscribers'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bots/${viewingBot?.id}/subscribers`, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      return res.json();
    },
    enabled: !!viewingBot?.id && isSubscribersDialogOpen,
  });

  const updateSubscriberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SubscriberFormData> }) => {
      const res = await fetch(`/api/admin/user-bots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to update subscriber");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bots', viewingBot?.id, 'subscribers'] });
      toast({ title: "Subscriber Updated", description: "The subscription has been updated successfully." });
      closeEditSubscriberDialog();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update subscriber.", variant: "destructive" });
    },
  });

  const filteredBots = bots.filter(bot =>
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingBot(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (bot: AiBot) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description,
      category: bot.category || 'crypto',
      subscriptionFee: bot.subscriptionFee || "",
      price: bot.price,
      durationDays: bot.durationDays.toString(),
      durationUnit: bot.durationUnit || 'days',
      minInvestment: bot.minInvestment,
      maxInvestment: bot.maxInvestment,
      minProfitPercent: bot.minProfitPercent,
      maxProfitPercent: bot.maxProfitPercent,
      minWinPercent: bot.minWinPercent || "50",
      maxWinPercent: bot.maxWinPercent || "70",
      minLossPercent: bot.minLossPercent || "10",
      maxLossPercent: bot.maxLossPercent || "20",
      reactivationFee: bot.reactivationFee || "",
      tradingAssets: bot.tradingAssets || [],
      assetDistribution: bot.assetDistribution || {},
      expectedRoi: bot.expectedRoi,
      logo: bot.logo || "",
      isActive: bot.isActive,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBot(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.tradingAssets.length > 0) {
      const totalDistribution = Object.values(formData.assetDistribution).reduce((a, b) => a + b, 0);
      if (totalDistribution !== 100) {
        toast({ 
          title: "Invalid Asset Distribution", 
          description: `Asset distribution must equal 100%. Current total: ${totalDistribution}%`, 
          variant: "destructive" 
        });
        return;
      }
      
      const hasZeroDistribution = formData.tradingAssets.some(asset => 
        !formData.assetDistribution[asset] || formData.assetDistribution[asset] === 0
      );
      if (hasZeroDistribution) {
        toast({ 
          title: "Invalid Asset Distribution", 
          description: "Each trading asset must have a distribution percentage greater than 0%.", 
          variant: "destructive" 
        });
        return;
      }
    }
    
    const data = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      subscriptionFee: formData.subscriptionFee || "0",
      price: formData.price,
      durationDays: parseInt(formData.durationDays),
      durationUnit: formData.durationUnit,
      minInvestment: formData.minInvestment,
      maxInvestment: formData.maxInvestment,
      minProfitPercent: formData.minProfitPercent,
      maxProfitPercent: formData.maxProfitPercent,
      minWinPercent: formData.minWinPercent,
      maxWinPercent: formData.maxWinPercent,
      minLossPercent: formData.minLossPercent,
      maxLossPercent: formData.maxLossPercent,
      reactivationFee: formData.reactivationFee || "0",
      tradingAssets: formData.tradingAssets,
      assetDistribution: formData.assetDistribution,
      expectedRoi: formData.expectedRoi,
      logo: formData.logo || null,
      isActive: formData.isActive,
    };

    if (editingBot) {
      updateMutation.mutate({ id: editingBot.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleStatus = (bot: AiBot) => {
    updateMutation.mutate({ id: bot.id, data: { isActive: !bot.isActive } });
  };

  const handleDeleteClick = (bot: AiBot) => {
    setDeletingBot(bot);
    setIsDeleteDialogOpen(true);
  };

  const handleViewUsers = (bot: AiBot) => {
    setViewingBot(bot);
    setIsSubscribersDialogOpen(true);
  };

  const closeSubscribersDialog = () => {
    setIsSubscribersDialogOpen(false);
    setViewingBot(null);
  };

  const openEditSubscriberDialog = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setSubscriberFormData({
      currentProfit: subscriber.currentProfit,
      allocatedAmount: subscriber.allocatedAmount || "0",
      remainingAllocation: subscriber.remainingAllocation || "0",
      isPaused: subscriber.isPaused || false,
      isStopped: subscriber.isStopped,
      status: subscriber.status,
    });
    setEditSubscriberDialogOpen(true);
  };

  const closeEditSubscriberDialog = () => {
    setEditSubscriberDialogOpen(false);
    setEditingSubscriber(null);
    setSubscriberFormData({
      currentProfit: "",
      allocatedAmount: "",
      remainingAllocation: "",
      isPaused: false,
      isStopped: false,
      status: "active",
    });
  };

  const handleSubscriberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profit = parseFloat(subscriberFormData.currentProfit);
    const allocated = parseFloat(subscriberFormData.allocatedAmount);
    const remaining = parseFloat(subscriberFormData.remainingAllocation);
    
    if (isNaN(profit) || isNaN(allocated) || isNaN(remaining)) {
      toast({ 
        title: "Invalid Input", 
        description: "Please enter valid numeric values for profit and allocation fields.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (editingSubscriber) {
      updateSubscriberMutation.mutate({
        id: editingSubscriber.id,
        data: {
          currentProfit: subscriberFormData.currentProfit,
          allocatedAmount: subscriberFormData.allocatedAmount,
          remainingAllocation: subscriberFormData.remainingAllocation,
          isPaused: subscriberFormData.isPaused,
          isStopped: subscriberFormData.isStopped,
          status: subscriberFormData.status,
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalInvested = subscribers.reduce((sum, s) => sum + parseFloat(s.investmentAmount), 0);
  const totalProfit = subscribers.reduce((sum, s) => sum + parseFloat(s.currentProfit), 0);

  const confirmDelete = () => {
    if (deletingBot) {
      deleteMutation.mutate(deletingBot.id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const activeBots = bots.filter(b => b.isActive).length;
  const inactiveBots = bots.filter(b => !b.isActive).length;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bot Management</h1>
          <p className="text-gray-500 mt-2">Create and manage AI trading bots for users.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2 bg-blue-600 hover:bg-blue-700" data-testid="button-create-bot">
          <Plus size={16} />
          Create Bot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium mb-1">Total Bots</p>
                <h3 className="text-3xl font-bold text-gray-900" data-testid="text-total-bots">{bots.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Bot size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium mb-1">Active Bots</p>
                <h3 className="text-3xl font-bold text-green-600" data-testid="text-active-bots">{activeBots}</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Power size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium mb-1">Inactive Bots</p>
                <h3 className="text-3xl font-bold text-gray-500" data-testid="text-inactive-bots">{inactiveBots}</h3>
              </div>
              <div className="p-3 bg-gray-100 text-gray-500 rounded-xl">
                <Power size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Bots</CardTitle>
              <CardDescription>Manage AI trading bot configurations</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search bots..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-bots"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredBots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {bots.length === 0 ? "No bots created yet. Click 'Create Bot' to add one." : "No bots found matching your search."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Investment Range</TableHead>
                  <TableHead>Profit Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBots.map((bot) => (
                  <TableRow key={bot.id} data-testid={`row-bot-${bot.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {bot.logo ? (
                          <img src={bot.logo} alt={bot.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Bot size={16} className="text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{bot.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{bot.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          bot.category === 'crypto' ? "bg-orange-50 text-orange-700 border-orange-200" :
                          bot.category === 'forex' ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-purple-50 text-purple-700 border-purple-200"
                        }
                        data-testid={`badge-category-${bot.id}`}
                      >
                        {bot.category?.toUpperCase() || 'CRYPTO'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-medium">${parseFloat(bot.price).toLocaleString()}</TableCell>
                    <TableCell>{bot.durationDays} {bot.durationUnit || 'days'}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        ${parseFloat(bot.minInvestment).toLocaleString()} - ${parseFloat(bot.maxInvestment).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-green-600">
                        {bot.minProfitPercent}% - {bot.maxProfitPercent}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={bot.isActive 
                          ? "bg-green-50 text-green-700 hover:bg-green-100" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }
                      >
                        {bot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${bot.id}`}>
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(bot)} data-testid={`button-edit-${bot.id}`}>
                            <Edit size={14} className="mr-2" />
                            Edit Bot
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewUsers(bot)} data-testid={`button-view-users-${bot.id}`}>
                            <Users size={14} className="mr-2" />
                            View Users
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(bot)}>
                            <Power size={14} className="mr-2" />
                            {bot.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(bot)} 
                            className="text-red-600 focus:text-red-600"
                            data-testid={`button-delete-${bot.id}`}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Bot
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBot ? "Edit Bot" : "Create New Bot"}</DialogTitle>
            <DialogDescription>
              {editingBot ? "Update the AI trading bot configuration." : "Configure a new AI trading bot for users to subscribe to."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Bot Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., HFT Scalper Pro" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-bot-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL (optional)</Label>
                  <Input 
                    id="logo" 
                    placeholder="https://..." 
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    data-testid="input-bot-logo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what this bot does..." 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  data-testid="input-bot-description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: 'crypto' | 'forex' | 'stock') => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-bot-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionFee">Subscription Fee ($)</Label>
                  <Input 
                    id="subscriptionFee" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 50" 
                    value={formData.subscriptionFee}
                    onChange={(e) => setFormData({ ...formData, subscriptionFee: e.target.value })}
                    data-testid="input-bot-subscription-fee"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reactivationFee">Reactivation Fee ($)</Label>
                  <Input 
                    id="reactivationFee" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 25" 
                    value={formData.reactivationFee}
                    onChange={(e) => setFormData({ ...formData, reactivationFee: e.target.value })}
                    data-testid="input-bot-reactivation-fee"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Subscription Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 99.99" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    data-testid="input-bot-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="durationDays" 
                      type="number" 
                      placeholder="e.g., 30" 
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      required
                      className="flex-1"
                      data-testid="input-bot-duration"
                    />
                    <Select 
                      value={formData.durationUnit} 
                      onValueChange={(value: 'minutes' | 'days' | 'weeks' | 'months') => setFormData({ ...formData, durationUnit: value })}
                    >
                      <SelectTrigger className="w-[120px]" data-testid="select-duration-unit">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minInvestment">Min Investment ($)</Label>
                  <Input 
                    id="minInvestment" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 100" 
                    value={formData.minInvestment}
                    onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
                    required
                    data-testid="input-bot-min-investment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxInvestment">Max Investment ($)</Label>
                  <Input 
                    id="maxInvestment" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 10000" 
                    value={formData.maxInvestment}
                    onChange={(e) => setFormData({ ...formData, maxInvestment: e.target.value })}
                    required
                    data-testid="input-bot-max-investment"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minProfitPercent">Min Daily Profit (%)</Label>
                  <Input 
                    id="minProfitPercent" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 2" 
                    value={formData.minProfitPercent}
                    onChange={(e) => setFormData({ ...formData, minProfitPercent: e.target.value })}
                    required
                    data-testid="input-bot-min-profit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxProfitPercent">Max Daily Profit (%)</Label>
                  <Input 
                    id="maxProfitPercent" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 4" 
                    value={formData.maxProfitPercent}
                    onChange={(e) => setFormData({ ...formData, maxProfitPercent: e.target.value })}
                    required
                    data-testid="input-bot-max-profit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minWinPercent">Min Win Rate (%)</Label>
                  <Input 
                    id="minWinPercent" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 50" 
                    value={formData.minWinPercent}
                    onChange={(e) => setFormData({ ...formData, minWinPercent: e.target.value })}
                    data-testid="input-bot-min-win"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWinPercent">Max Win Rate (%)</Label>
                  <Input 
                    id="maxWinPercent" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 70" 
                    value={formData.maxWinPercent}
                    onChange={(e) => setFormData({ ...formData, maxWinPercent: e.target.value })}
                    data-testid="input-bot-max-win"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLossPercent">Min Loss Rate (%)</Label>
                  <Input 
                    id="minLossPercent" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 10" 
                    value={formData.minLossPercent}
                    onChange={(e) => setFormData({ ...formData, minLossPercent: e.target.value })}
                    data-testid="input-bot-min-loss"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLossPercent">Max Loss Rate (%)</Label>
                  <Input 
                    id="maxLossPercent" 
                    type="number" 
                    step="0.01"
                    placeholder="e.g., 20" 
                    value={formData.maxLossPercent}
                    onChange={(e) => setFormData({ ...formData, maxLossPercent: e.target.value })}
                    data-testid="input-bot-max-loss"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradingAssets">Trading Assets (comma-separated)</Label>
                <Input 
                  id="tradingAssets" 
                  placeholder="e.g., BTC,ETH,SOL" 
                  value={formData.tradingAssets.join(',')}
                  onChange={(e) => {
                    const assets = e.target.value.split(',').map(a => a.trim().toUpperCase()).filter(a => a);
                    const newDistribution = { ...formData.assetDistribution };
                    assets.forEach(asset => {
                      if (!(asset in newDistribution)) {
                        newDistribution[asset] = 0;
                      }
                    });
                    Object.keys(newDistribution).forEach(key => {
                      if (!assets.includes(key)) {
                        delete newDistribution[key];
                      }
                    });
                    setFormData({ ...formData, tradingAssets: assets, assetDistribution: newDistribution });
                  }}
                  data-testid="input-bot-trading-assets"
                />
                <p className="text-xs text-gray-500">Enter asset symbols separated by commas</p>
              </div>

              {formData.tradingAssets.length > 0 && (
                <div className="space-y-3">
                  <Label>Asset Distribution (%)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.tradingAssets.map((asset) => (
                      <div key={asset} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-sm min-w-[50px]">{asset}</span>
                        <Input 
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          className="h-8 text-sm"
                          value={formData.assetDistribution[asset] || 0}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setFormData({
                              ...formData,
                              assetDistribution: { ...formData.assetDistribution, [asset]: value }
                            });
                          }}
                          data-testid={`input-distribution-${asset.toLowerCase()}`}
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    ))}
                  </div>
                  <p className={`text-xs ${
                    Object.values(formData.assetDistribution).reduce((a, b) => a + b, 0) === 100 
                      ? "text-green-600" 
                      : "text-orange-500"
                  }`}>
                    Total: {Object.values(formData.assetDistribution).reduce((a, b) => a + b, 0)}% 
                    {Object.values(formData.assetDistribution).reduce((a, b) => a + b, 0) !== 100 && " (should equal 100%)"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expectedRoi">Expected ROI Display Text</Label>
                <Input 
                  id="expectedRoi" 
                  placeholder="e.g., 2-4% daily" 
                  value={formData.expectedRoi}
                  onChange={(e) => setFormData({ ...formData, expectedRoi: e.target.value })}
                  required
                  data-testid="input-bot-expected-roi"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isActive" 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                  data-testid="checkbox-bot-active"
                />
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Bot is active and available for subscription
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700" data-testid="button-submit-bot">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingBot ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingBot ? "Update Bot" : "Create Bot"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBot?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBot(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSubscribersDialogOpen} onOpenChange={(open) => !open && closeSubscribersDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} />
              {viewingBot?.name} - Subscribers
            </DialogTitle>
            <DialogDescription>
              View all users subscribed to this bot and their profit details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="border bg-blue-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="text-blue-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Total Subscribers</p>
                  <p className="text-xl font-bold text-blue-600">{subscribers.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-green-50">
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="text-green-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Total Invested</p>
                  <p className="text-xl font-bold text-green-600">${totalInvested.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-purple-50">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="text-purple-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Total Profits Distributed</p>
                  <p className="text-xl font-bold text-purple-600">${totalProfit.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {subscribersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-2 opacity-50" />
              <p>No subscribers yet for this bot.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Last Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id} data-testid={`row-subscriber-${subscriber.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subscriber.username}</p>
                        <p className="text-xs text-gray-500">
                          {subscriber.firstName} {subscriber.lastName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${parseFloat(subscriber.investmentAmount).toFixed(2)}
                    </TableCell>
                    <TableCell className={parseFloat(subscriber.currentProfit) > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                      ${parseFloat(subscriber.currentProfit).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {subscriber.isStopped ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Stopped
                        </Badge>
                      ) : subscriber.isPaused ? (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Paused
                        </Badge>
                      ) : subscriber.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : subscriber.status === 'completed' ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600">
                          Expired
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(subscriber.purchaseDate)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(subscriber.expiryDate)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {subscriber.lastProfitDate ? formatDate(subscriber.lastProfitDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditSubscriberDialog(subscriber)}
                        data-testid={`button-edit-subscriber-${subscriber.id}`}
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeSubscribersDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editSubscriberDialogOpen} onOpenChange={setEditSubscriberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Adjust the subscription settings for this user.
            </DialogDescription>
          </DialogHeader>
          
          {editingSubscriber && (
            <form onSubmit={handleSubscriberSubmit}>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{editingSubscriber.firstName} {editingSubscriber.lastName}</p>
                  <p className="text-sm text-gray-500">@{editingSubscriber.username}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentProfit">Current Profit ($)</Label>
                  <Input 
                    id="currentProfit"
                    type="number"
                    step="0.01"
                    value={subscriberFormData.currentProfit}
                    onChange={(e) => setSubscriberFormData({ ...subscriberFormData, currentProfit: e.target.value })}
                    data-testid="input-subscriber-profit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allocatedAmount">Allocated Amount ($)</Label>
                  <Input 
                    id="allocatedAmount"
                    type="number"
                    step="0.01"
                    value={subscriberFormData.allocatedAmount}
                    onChange={(e) => setSubscriberFormData({ ...subscriberFormData, allocatedAmount: e.target.value })}
                    data-testid="input-subscriber-allocated"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remainingAllocation">Remaining Allocation ($)</Label>
                  <Input 
                    id="remainingAllocation"
                    type="number"
                    step="0.01"
                    value={subscriberFormData.remainingAllocation}
                    onChange={(e) => setSubscriberFormData({ ...subscriberFormData, remainingAllocation: e.target.value })}
                    data-testid="input-subscriber-remaining"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isPaused"
                    checked={subscriberFormData.isPaused}
                    onCheckedChange={(checked) => setSubscriberFormData({ ...subscriberFormData, isPaused: !!checked })}
                    data-testid="checkbox-subscriber-paused"
                  />
                  <Label htmlFor="isPaused" className="cursor-pointer">Is Paused</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isStopped"
                    checked={subscriberFormData.isStopped}
                    onCheckedChange={(checked) => setSubscriberFormData({ ...subscriberFormData, isStopped: !!checked })}
                    data-testid="checkbox-subscriber-stopped"
                  />
                  <Label htmlFor="isStopped" className="cursor-pointer">Is Stopped</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={subscriberFormData.status} 
                    onValueChange={(value: 'active' | 'paused' | 'expired' | 'completed') => setSubscriberFormData({ ...subscriberFormData, status: value })}
                  >
                    <SelectTrigger data-testid="select-subscriber-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditSubscriberDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateSubscriberMutation.isPending}
                  data-testid="button-save-subscriber"
                >
                  {updateSubscriberMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
