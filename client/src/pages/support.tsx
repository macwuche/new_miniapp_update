import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTelegram } from "@/lib/telegram-mock";

interface SupportTicketCategory {
  id: number;
  name: string;
  isActive: boolean;
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

const STATUS_STYLES: { [key: string]: { bg: string; text: string; icon: any } } = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-400", icon: Clock },
  open: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-400", icon: MessageSquare },
  resolved: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-400", icon: CheckCircle2 },
  closed: { bg: "bg-gray-100 dark:bg-gray-900/40", text: "text-gray-700 dark:text-gray-400", icon: AlertCircle },
};

export default function Support() {
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: tgUser } = useTelegram();

  const { data: dbUser } = useQuery({
    queryKey: ['/api/users/register', tgUser?.id],
    queryFn: async () => {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: tgUser?.id?.toString() || "123456789",
          username: tgUser?.username || 'alextrader',
          firstName: tgUser?.first_name || 'Alex',
          lastName: tgUser?.last_name || 'Trader',
          profilePicture: tgUser?.photo_url || null
        })
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: true,
  });

  const userId = dbUser?.id;

  const { data: categories = [] } = useQuery<SupportTicketCategory[]>({
    queryKey: ['/api/ticket-categories?active=true'],
    queryFn: async () => {
      const res = await fetch('/api/ticket-categories?active=true');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: [`/api/users/${userId}/tickets`],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/users/${userId}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    },
    enabled: !!userId,
  });

  const handleCreateTicket = async () => {
    if (!subject || !message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject,
          categoryId: category ? parseInt(category) : null,
          message,
          status: 'pending',
          priority: 'low',
          messages: []
        })
      });

      if (!res.ok) throw new Error('Failed to create ticket');

      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/tickets`] });
      
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted."
      });
      
      setIsNewTicketOpen(false);
      setSubject("");
      setCategory("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create support ticket.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            sender: 'user', 
            text: replyMessage, 
            timestamp: new Date().toISOString() 
          } 
        })
      });

      if (!res.ok) throw new Error('Failed to send reply');

      const updated = await res.json();
      setSelectedTicket(updated);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/tickets`] });
      setReplyMessage("");
      
      toast({
        title: "Reply Sent",
        description: "Your message has been sent."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'General';
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'General';
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
        <div className="px-6 pt-8 pb-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                  <ArrowLeft size={20} />
                </div>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support</h1>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white h-9"
              onClick={() => setIsNewTicketOpen(true)}
              data-testid="button-new-ticket"
            >
              <Plus size={16} className="mr-1" /> New Ticket
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6">
            <Card className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl p-8 shadow-sm">
              <div className="text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No support tickets yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Create a new ticket if you need help with anything.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {tickets.map((ticket) => {
              const status = STATUS_STYLES[ticket.status] || STATUS_STYLES.pending;
              const StatusIcon = status.icon;
              return (
                <Card 
                  key={ticket.id} 
                  className="border-none shadow-sm bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTicket(ticket)}
                  data-testid={`card-ticket-${ticket.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{ticket.subject}</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{ticket.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`${status.bg} ${status.text} border-none text-xs`}>
                            <StatusIcon size={12} className="mr-1" />
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-400">{getCategoryName(ticket.categoryId)}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</p>
                        {ticket.messages.length > 0 && (
                          <p className="text-xs text-blue-500 mt-1">{ticket.messages.length} messages</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogContent className="sm:max-w-md rounded-xl w-[95%] p-0 overflow-hidden bg-white dark:bg-slate-800">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">New Support Ticket</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Describe your issue and we'll get back to you shortly.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input 
                  placeholder="Brief description of your issue" 
                  className="h-11 rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="input-subject"
                />
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea 
                  placeholder="Describe your issue in detail..." 
                  className="min-h-[120px] rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  data-testid="input-message"
                />
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-gray-50 dark:border-slate-700 flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 h-11 dark:border-slate-600 dark:text-gray-300"
                onClick={() => setIsNewTicketOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 flex-1"
                onClick={handleCreateTicket}
                disabled={isSubmitting}
                data-testid="button-submit-ticket"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-lg rounded-xl w-[95%] max-h-[85vh] p-0 overflow-hidden bg-white dark:bg-slate-800">
            {selectedTicket && (
              <>
                <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white pr-4">{selectedTicket.subject}</DialogTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${STATUS_STYLES[selectedTicket.status]?.bg} ${STATUS_STYLES[selectedTicket.status]?.text} border-none text-xs`}>
                          {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-gray-400">{getCategoryName(selectedTicket.categoryId)}</span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <ScrollArea className="h-[300px] p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">You • {formatDate(selectedTicket.createdAt)}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{selectedTicket.message}</p>
                    </div>

                    {selectedTicket.messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-lg p-4 ${msg.sender === 'admin' ? 'bg-gray-100 dark:bg-slate-700' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                      >
                        <p className={`text-xs font-medium mb-1 ${msg.sender === 'admin' ? 'text-gray-600 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {msg.sender === 'admin' ? 'Support' : 'You'} • {formatDate(msg.timestamp)}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedTicket.status !== 'completed' && selectedTicket.status !== 'rejected' && (
                  <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        className="flex-1 h-10 rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                        data-testid="input-reply"
                      />
                      <Button 
                        size="icon"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10"
                        onClick={handleSendReply}
                        disabled={isSubmitting || !replyMessage}
                        data-testid="button-send-reply"
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
