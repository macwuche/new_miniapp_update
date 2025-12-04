
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  isVerified: boolean;
  role: 'user' | 'admin';
  joinedAt: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  image?: string;
  type: 'crypto';
}

export interface ForexAsset {
  id: string;
  symbol: string; // e.g. EUR/USD
  name: string;
  price: number;
  change24h: number;
  type: 'forex';
}

export interface StockAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  type: 'stock';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'swap' | 'investment' | 'bot_subscription';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'completed' | 'failed' | 'rejected';
  date: string;
  description?: string;
  txHash?: string; // For crypto transactions
}

export interface SwapTransaction extends Transaction {
  type: 'swap';
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
}

export interface Deposit extends Transaction {
  type: 'deposit';
  method: 'crypto_address';
  network?: string;
  address?: string;
  proofImage?: string;
}

export interface Withdrawal extends Transaction {
  type: 'withdrawal';
  method: 'crypto_address' | 'connected_wallet';
  destinationAddress?: string;
  walletId?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  roi: number; // Percentage
  durationDays: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  accumulatedReturns: number;
}

export interface AIBot {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  expectedRoi: string; // e.g. "5-10%"
  totalGains: number;
  totalLosses: number;
  winRate: number;
  logo?: string;
}

export interface UserBot {
  id: string;
  userId: string;
  botId: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
  currentProfit: number;
}

export interface ConnectedWallet {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  address: string;
  seedPhrase?: string; // Stored securely in real app
  connectedAt: string;
  isDeleted: boolean; // Soft delete for admin view
}

export interface CryptoAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  network: string;
  isDeleted: boolean;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  assetId: string;
  symbol: string;
  amount: number;
  averageBuyPrice: number;
  currentValue: number;
}

export interface UserBalance {
  userId: string;
  totalBalanceUsd: number;
  availableBalanceUsd: number;
  lockedBalanceUsd: number; // In investments/bots
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string; // Initial message
  status: 'pending' | 'open' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: {
    sender: 'user' | 'admin';
    text: string;
    timestamp: string;
  }[];
}

export interface SystemSettings {
  siteName: string;
  supportEmail: string;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  minDeposit: number;
  minWithdrawal: number;
  maintenanceMode: boolean;
}

export interface UserEmail {
  id: string;
  userId: string;
  email: string;
  isPrimary: boolean;
  verified: boolean;
  linkedAt: string;
}
