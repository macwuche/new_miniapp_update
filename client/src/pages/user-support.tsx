import { MobileLayout } from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Mock data
const MOCK_TICKETS = [
  {
    id: "TCK-9021",
    subject: "Deposit issue",
    status: "Open",
    date: "2024-05-21",
    lastUpdate: "2 hours ago",
    messages: 2
  },
  {
    id: "TCK-8832",
    subject: "Verification help",
    status: "Resolved",
    date: "2024-05-15",
    lastUpdate: "5 days ago",
    messages: 4
  }
];

export default function UserSupport() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Ticket Created",
      description: "Support team will respond shortly.",
    });
    setIsCreating(false);
    setSubject("");
    setCategory("");
    setMessage("");
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
      </div>
      
      <div className="px-4 space-y-6 pb-20">
        {!isCreating ? (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Need help?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Our support team is available 24/7 to assist you with any issues.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Tickets</h2>
              <Button size="sm" onClick={() => setIsCreating(true)} className="bg-blue-600 text-white">
                <Plus size={16} className="mr-1" /> New Ticket
              </Button>
            </div>

            <div className="space-y-3">
              {MOCK_TICKETS.map((ticket) => (
                <Card key={ticket.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 block mb-1">#{ticket.id}</span>
                        <h3 className="font-bold text-gray-900 dark:text-white">{ticket.subject}</h3>
                      </div>
                      <Badge 
                        className={
                          ticket.status === "Open" 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        Updated {ticket.lastUpdate}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {ticket.messages} messages
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>New Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    placeholder="Brief description of issue" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit & Withdrawal</SelectItem>
                      <SelectItem value="trading">Trading Issue</SelectItem>
                      <SelectItem value="account">Account & Security</SelectItem>
                      <SelectItem value="technical">Technical Bug</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    placeholder="Describe your issue in detail..." 
                    className="min-h-[120px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Submit Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
