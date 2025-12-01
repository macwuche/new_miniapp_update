import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MessageSquare, ArrowLeftRight } from "lucide-react";

// Mock data based on the reference image
const TICKETS = [
  {
    id: "#8mTwxxuYGf",
    username: "rubenvasquez",
    subject: "Routing number & account number",
    name: "Ruben Vasquez",
    email: "maru592@aol.com",
    message: "I am in need of my routing and account numbers....",
    status: "PENDING",
    lastReply: null
  }
];

const StatCard = ({ title, count, percentage, color, buttonColor, ringColor }: any) => (
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
          >
            View All
          </Button>
        </div>
        
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={175.93}
              strokeDashoffset={175.93 - (175.93 * parseInt(percentage)) / 100}
              className={ringColor}
            />
          </svg>
          <span className={`absolute text-sm font-bold ${ringColor.replace('text-', 'text-')}`}>
            {percentage}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Support() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-[#5a5278] -mx-6 -mt-6 px-6 py-4 mb-8 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <ArrowLeftRight size={20} />
          <div>
            <h1 className="text-lg font-medium">All Ticket</h1>
            <p className="text-xs opacity-80">Welcome To Industrial Bank Us Admin Panel</p>
          </div>
        </div>
        <div className="text-sm opacity-80">
          Dashboard &gt; Support Ticket
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Pending Tickets" 
          count="1" 
          percentage="100%" 
          color="text-red-500"
          buttonColor="bg-[#ff9f43]"
          ringColor="text-[#ff5b5b]"
        />
        <StatCard 
          title="Active Tickets" 
          count="0" 
          percentage="0%" 
          color="text-green-500"
          buttonColor="bg-[#28c76f]"
          ringColor="text-[#28c76f]"
        />
        <StatCard 
          title="Solved Tickets" 
          count="0" 
          percentage="0%" 
          color="text-yellow-500"
          buttonColor="bg-[#28c76f]"
          ringColor="text-[#ff9f43]" // Using orange/yellow for solved
        />
        <StatCard 
          title="All Tickets" 
          count="1" 
          percentage="100%" 
          color="text-purple-500"
          buttonColor="bg-[#5a5278]"
          ringColor="text-[#ff9f43]" // Pinkish/Purple in image looks like #ff9f43 or similar
        />
      </div>

      {/* Tickets Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium text-gray-700">All Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-gray-100 hover:bg-white">
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Ticket ID</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">User (Username)</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Subject</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Name</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Email</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Message</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Last Reply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TICKETS.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50 border-b border-gray-50">
                    <TableCell className="text-gray-500 font-medium text-sm">{ticket.id}</TableCell>
                    <TableCell className="text-gray-600 font-medium text-sm">{ticket.username}</TableCell>
                    <TableCell className="text-[#ff9f43] font-medium text-sm">{ticket.subject}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{ticket.name}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{ticket.email}</TableCell>
                    <TableCell className="text-gray-600 text-sm max-w-xs truncate" title={ticket.message}>
                      {ticket.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[#ff9f43] border-[#ff9f43] bg-transparent hover:bg-[#ff9f43]/10 font-normal text-xs px-3 py-0.5 rounded-full">
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="bg-[#5a5278] hover:bg-[#4a4364] text-white h-8 w-8 rounded-md">
                        <MessageSquare size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
