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
  price: string;
  durationDays: number;
  durationUnit: 'minutes' | 'days' | 'weeks' | 'months';
  expectedRoi: string;
  minInvestment: string;
  maxInvestment: string;
  minProfitPercent: string;
  maxProfitPercent: string;
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
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
  isStopped: boolean;
  lastProfitDate: string | null;
}

interface BotFormData {
  name: string;
  description: string;
  price: string;
  durationDays: string;
  durationUnit: 'minutes' | 'days' | 'weeks' | 'months';
  minInvestment: string;
  maxInvestment: string;
  minProfitPercent: string;
  maxProfitPercent: string;
  expectedRoi: string;
  logo: string;
  isActive: boolean;
}

const defaultFormData: BotFormData = {
  name: "",
  description: "",
  price: "",
  durationDays: "",
  durationUnit: "days",
  minInvestment: "",
  maxInvestment: "",
  minProfitPercent: "",
  maxProfitPercent: "",
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
  const [editingBot, setEditingBot] = useState<AiBot | null>(null);
  const [deletingBot, setDeletingBot] = useState<AiBot | null>(null);
  const [viewingBot, setViewingBot] = useState<AiBot | null>(null);
  const [formData, setFormData] = useState<BotFormData>(defaultFormData);

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
      price: bot.price,
      durationDays: bot.durationDays.toString(),
      durationUnit: bot.durationUnit || 'days',
      minInvestment: bot.minInvestment,
      maxInvestment: bot.maxInvestment,
      minProfitPercent: bot.minProfitPercent,
      maxProfitPercent: bot.maxProfitPercent,
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
    
    const data = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      durationDays: parseInt(formData.durationDays),
      durationUnit: formData.durationUnit,
      minInvestment: formData.minInvestment,
      maxInvestment: formData.maxInvestment,
      minProfitPercent: formData.minProfitPercent,
      maxProfitPercent: formData.maxProfitPercent,
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
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
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Stopped
                        </Badge>
                      ) : subscriber.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Active
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
    </AdminLayout>
  );
}
