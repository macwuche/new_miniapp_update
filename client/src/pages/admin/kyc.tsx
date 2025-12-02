import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
import { Search, FileCheck, CheckCircle, XCircle, Eye, Calendar, CreditCard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data for KYC requests
const MOCK_KYC_REQUESTS = [
  {
    id: 1,
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: ""
    },
    documentType: "National ID",
    idNumber: "A123456789",
    submittedAt: "2024-05-20 10:30 AM",
    status: "Pending",
    frontImage: "https://placehold.co/600x400?text=ID+Front",
    backImage: "https://placehold.co/600x400?text=ID+Back"
  },
  {
    id: 2,
    user: {
      name: "Alice Smith",
      email: "alice.s@example.com",
      avatar: "https://github.com/shadcn.png"
    },
    documentType: "Passport",
    idNumber: "P987654321",
    submittedAt: "2024-05-19 02:15 PM",
    status: "Verified",
    frontImage: "https://placehold.co/600x400?text=Passport+Page",
    backImage: null
  },
  {
    id: 3,
    user: {
      name: "Robert Johnson",
      email: "robert.j@example.com",
      avatar: ""
    },
    documentType: "Driver's License",
    idNumber: "DL555666777",
    submittedAt: "2024-05-18 11:45 AM",
    status: "Rejected",
    rejectionReason: "Document blurry and unreadable",
    frontImage: "https://placehold.co/600x400?text=License+Front",
    backImage: "https://placehold.co/600x400?text=License+Back"
  },
  {
    id: 4,
    user: {
      name: "Maria Garcia",
      email: "maria.g@example.com",
      avatar: ""
    },
    documentType: "National ID",
    idNumber: "B987654321",
    submittedAt: "2024-05-20 09:00 AM",
    status: "Pending",
    frontImage: "https://placehold.co/600x400?text=ID+Front",
    backImage: "https://placehold.co/600x400?text=ID+Back"
  }
];

export default function KYCRequests() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredRequests = MOCK_KYC_REQUESTS.filter(req => 
    req.user.name.toLowerCase().includes(search.toLowerCase()) || 
    req.user.email.toLowerCase().includes(search.toLowerCase()) ||
    req.idNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (status: 'Verified' | 'Rejected') => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: status === 'Verified' ? "KYC Approved" : "KYC Rejected",
      description: `User ${selectedRequest.user.name}'s verification has been ${status.toLowerCase()}.`,
      variant: status === 'Verified' ? "default" : "destructive"
    });
    
    setIsProcessing(false);
    setSelectedRequest(null);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">KYC Requests</h1>
        <p className="text-gray-500 mt-2">Review and manage user identity verification requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileCheck size={20} />
              </div>
              <Badge className="bg-blue-200 text-blue-700 hover:bg-blue-300 border-none">Total</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{MOCK_KYC_REQUESTS.length}</h3>
            <p className="text-blue-600 text-sm">Total Requests</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Calendar size={20} />
              </div>
              <Badge className="bg-orange-200 text-orange-700 hover:bg-orange-300 border-none">Action Needed</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {MOCK_KYC_REQUESTS.filter(r => r.status === 'Pending').length}
            </h3>
            <p className="text-orange-600 text-sm">Pending Review</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <CheckCircle size={20} />
              </div>
              <Badge className="bg-green-200 text-green-700 hover:bg-green-300 border-none">Completed</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {MOCK_KYC_REQUESTS.filter(r => r.status === 'Verified').length}
            </h3>
            <p className="text-green-600 text-sm">Verified Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search by name, email or ID number..." 
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Requests Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b border-gray-100">
                <TableHead className="font-semibold text-gray-700 pl-6">User</TableHead>
                <TableHead className="font-semibold text-gray-700">Document Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Submitted</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-gray-50 border-b border-gray-50">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={request.user.avatar} />
                        <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{request.user.name}</div>
                        <div className="text-xs text-gray-500">{request.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      <span className="text-gray-700">{request.documentType}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">{request.idNumber}</div>
                  </TableCell>
                  <TableCell className="text-gray-600">{request.submittedAt}</TableCell>
                  <TableCell>
                    <Badge className={`
                      ${request.status === 'Verified' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 
                        request.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' : 
                        'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200'}
                    `}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      onClick={() => setSelectedRequest(request)}
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      View Details <Eye size={16} className="ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileCheck className="text-[#6f42c1]" size={24} />
              Review KYC Request
            </DialogTitle>
            <DialogDescription>
              Reviewing submission for <span className="font-semibold text-gray-900">{selectedRequest?.user.name}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="mt-4 space-y-6">
              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-medium">Full Name</p>
                  <p className="text-gray-900 font-medium mt-1">{selectedRequest.user.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-medium">Document Type</p>
                  <p className="text-gray-900 font-medium mt-1">{selectedRequest.documentType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-medium">ID Number</p>
                  <p className="text-gray-900 font-medium mt-1">{selectedRequest.idNumber}</p>
                </div>
              </div>

              {/* Document Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Submitted Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Front Side</p>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 bg-gray-50">
                      <img 
                        src={selectedRequest.frontImage} 
                        alt="ID Front" 
                        className="w-full h-auto rounded-md object-contain max-h-[300px]"
                      />
                    </div>
                  </div>
                  {selectedRequest.backImage && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Back Side</p>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img 
                          src={selectedRequest.backImage} 
                          alt="ID Back" 
                          className="w-full h-auto rounded-md object-contain max-h-[300px]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'Pending' ? (
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleStatusChange('Rejected')}
                    disabled={isProcessing}
                  >
                    <XCircle size={18} className="mr-2" />
                    Reject Request
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange('Verified')}
                    disabled={isProcessing}
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Approve Verification
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">
                    This request was <span className={`font-bold ${selectedRequest.status === 'Verified' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRequest.status.toLowerCase()}
                    </span> on {selectedRequest.submittedAt.split(' ')[0]}.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
