import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ArrowLeftRight, Plus, Send, Trash2, Loader2, Clock, CheckCircle2, AlertCircle, Tag } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SupportTicketCategory {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface SupportTicket {
  id: number;
  userId: number;
  categoryId: number | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  messages: { sender: 'user' | 'admin'; text: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

const STATUS_STYLES: { [key: string]: { bg: string; text: string; border: string } } = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  open: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  resolved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
  closed: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-300" },
};

const StatCard = ({ title, count, percentage, buttonColor, ringColor, onClick }: any) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-gray-600 font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{count}</h3>
          </div>
          <Button 
            size="sm" 
            className={`${buttonColor} hover:opacity-90 text-white h-7 text-xs px-3 rounded-md w-fit`}
            onClick={onClick}
          >
            View All
          </Button>
        </div>
        
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
              strokeDasharray={175.93}
              strokeDashoffset={175.93 - (175.93 * parseInt(percentage)) / 100}
              className={ringColor}
            />
          </svg>
          <span className={`absolute text-sm font-bold ${ringColor}`}>{percentage}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Support() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading: loadingTickets } = useQuery<SupportTicket[]>({
    queryKey: ['/api/admin/tickets'],
    queryFn: async () => {
      const res = await fetch('/api/admin/tickets');
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    }
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery<SupportTicketCategory[]>({
    queryKey: ['/api/ticket-categories'],
    queryFn: async () => {
      const res = await fetch('/api/ticket-categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const activeCount = tickets.filter(t => t.status === 'open').length;
  const solvedCount = tickets.filter(t => t.status === 'resolved').length;
  const totalCount = tickets.length;

  const filteredTickets = statusFilter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  const getPercentage = (count: number) => {
    if (totalCount === 0) return "0%";
    return Math.round((count / totalCount) * 100) + "%";
  };

  const handleSendReply = async () => {
    if (!replyMessage || !selectedTicket) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newMessage: { 
            sender: 'admin', 
            text: replyMessage, 
            timestamp: new Date().toISOString() 
          },
          status: 'open' 
        })
      });

      if (!res.ok) throw new Error('Failed to send reply');

      const updated = await res.json();
      setSelectedTicket(updated);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      setReplyMessage("");
      
      toast({ title: "Reply Sent", description: "Your response has been sent to the user." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reply.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to update status');

      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      if (selectedTicket?.id === ticketId) {
        const updated = await res.json();
        setSelectedTicket(updated);
      }
      
      toast({ title: "Status Updated", description: `Ticket marked as ${status}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/admin/ticket-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, isActive: true })
      });

      if (!res.ok) throw new Error('Failed to create category');

      queryClient.invalidateQueries({ queryKey: ['/api/ticket-categories'] });
      setNewCategoryName("");
      toast({ title: "Category Created", description: "New ticket category has been added." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create category.", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/ticket-categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');

      queryClient.invalidateQueries({ queryKey: ['/api/ticket-categories'] });
      toast({ title: "Category Deleted", description: "Category has been removed." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  };

  const getUser = (userId: number) => users.find(u => u.id === userId);
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'General';
    return categories.find(c => c.id === categoryId)?.name || 'General';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="bg-[#5a5278] -mx-6 -mt-6 px-6 py-4 mb-8 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={20} />
          <div>
            <h1 className="text-lg font-medium">Support Tickets</h1>
            <p className="text-xs opacity-80">Manage user support requests</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-white/30 text-white hover:bg-white/10"
          onClick={() => setIsCategoryDialogOpen(true)}
        >
          <Tag size={16} className="mr-2" /> Categories
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Pending" count={pendingCount} percentage={getPercentage(pendingCount)} 
          buttonColor="bg-[#ff9f43]" ringColor="text-[#ff5b5b]" onClick={() => setStatusFilter('pending')} />
        <StatCard title="Active" count={activeCount} percentage={getPercentage(activeCount)} 
          buttonColor="bg-[#28c76f]" ringColor="text-[#28c76f]" onClick={() => setStatusFilter('approved')} />
        <StatCard title="Solved" count={solvedCount} percentage={getPercentage(solvedCount)} 
          buttonColor="bg-[#28c76f]" ringColor="text-[#ff9f43]" onClick={() => setStatusFilter('completed')} />
        <StatCard title="All Tickets" count={totalCount} percentage="100%" 
          buttonColor="bg-[#5a5278]" ringColor="text-[#5a5278]" onClick={() => setStatusFilter('all')} />
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-700">
            {statusFilter === 'all' ? 'All Tickets' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Tickets`}
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Active</SelectItem>
              <SelectItem value="completed">Solved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tickets found</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white border-b border-gray-100 hover:bg-white">
                    <TableHead className="font-bold text-gray-500 text-xs uppercase">ID</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase">User</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase">Subject</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase">Category</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase">Date</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    const user = getUser(ticket.userId);
                    const style = STATUS_STYLES[ticket.status] || STATUS_STYLES.pending;
                    return (
                      <TableRow key={ticket.id} className="hover:bg-gray-50 border-b border-gray-50">
                        <TableCell className="text-gray-500 font-medium text-sm">#{ticket.id}</TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {user ? `${user.firstName} ${user.lastName}` : `User #${ticket.userId}`}
                        </TableCell>
                        <TableCell className="text-[#ff9f43] font-medium text-sm max-w-[200px] truncate">{ticket.subject}</TableCell>
                        <TableCell className="text-gray-500 text-sm">{getCategoryName(ticket.categoryId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${style.text} ${style.border} ${style.bg} font-normal text-xs px-3 py-0.5`}>
                            {ticket.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="bg-[#5a5278] hover:bg-[#4a4364] text-white h-8 w-8 rounded-md"
                            onClick={() => setSelectedTicket(ticket)}>
                            <MessageSquare size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          {selectedTicket && (
            <>
              <DialogHeader className="p-6 pb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-lg font-bold">#{selectedTicket.id} - {selectedTicket.subject}</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      From: {getUser(selectedTicket.userId)?.firstName || 'User'} • {getCategoryName(selectedTicket.categoryId)}
                    </p>
                  </div>
                  <Select value={selectedTicket.status} onValueChange={(s) => handleUpdateStatus(selectedTicket.id, s)}>
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Active</SelectItem>
                      <SelectItem value="completed">Solved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DialogHeader>

              <ScrollArea className="h-[350px] p-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">User • {formatDate(selectedTicket.createdAt)}</p>
                    <p className="text-sm text-gray-800">{selectedTicket.message}</p>
                  </div>

                  {selectedTicket.messages.map((msg, idx) => (
                    <div key={idx} className={`rounded-lg p-4 ${msg.sender === 'admin' ? 'bg-gray-100' : 'bg-blue-50'}`}>
                      <p className={`text-xs font-medium mb-1 ${msg.sender === 'admin' ? 'text-gray-600' : 'text-blue-600'}`}>
                        {msg.sender === 'admin' ? 'Admin' : 'User'} • {formatDate(msg.timestamp)}
                      </p>
                      <p className="text-sm text-gray-800">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    className="flex-1 min-h-[80px] resize-none"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <Button className="bg-[#5a5278] hover:bg-[#4a4364] text-white self-end" onClick={handleSendReply} disabled={isSubmitting || !replyMessage}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Ticket Categories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1" />
              <Button onClick={handleCreateCategory} className="bg-[#5a5278] hover:bg-[#4a4364]">
                <Plus size={18} />
              </Button>
            </div>

            {loadingCategories ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No categories yet</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
