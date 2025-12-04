import { 
  User, Admin, CryptoAsset, ForexAsset, StockAsset, 
  Transaction, Deposit, Withdrawal, InvestmentPlan, 
  UserInvestment, AIBot, UserBot, ConnectedWallet, 
  CryptoAddress, SupportTicket, SystemSettings 
} from './types';

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'demo_user',
    email: 'user@demo.com',
    firstName: 'John',
    lastName: 'Doe',
    isVerified: true,
    role: 'user',
    joinedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'u2',
    username: 'alex_trader',
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Smith',
    isVerified: false,
    role: 'user',
    joinedAt: '2024-02-20T14:30:00Z'
  }
];

// Mock Admin
export const MOCK_ADMINS: Admin[] = [
  {
    id: 'a1',
    username: 'admin',
    email: 'admin@admin.com',
    firstName: 'Super',
    lastName: 'Admin',
    isVerified: true,
    role: 'admin',
    joinedAt: '2023-12-01T00:00:00Z',
    permissions: ['all']
  }
];

// Mock Assets (Crypto populated from API usually, but here's structure)
export const MOCK_CRYPTO: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 65000, change24h: 2.5, type: 'crypto' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3500, change24h: 1.8, type: 'crypto' }
];

export const MOCK_FOREX: ForexAsset[] = [
  { id: 'eur-usd', symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.085, change24h: 0.1, type: 'forex' },
  { id: 'gbp-usd', symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.265, change24h: -0.2, type: 'forex' }
];

export const MOCK_STOCKS: StockAsset[] = [
  { id: 'aapl', symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change24h: 1.2, type: 'stock' },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', price: 180.25, change24h: -1.5, type: 'stock' }
];

// Mock Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    userId: 'u1',
    type: 'deposit',
    amount: 1000,
    currency: 'USDT',
    status: 'completed',
    date: '2024-03-01T10:00:00Z',
    description: 'Initial deposit'
  },
  {
    id: 'tx2',
    userId: 'u1',
    type: 'trade',
    amount: 500,
    currency: 'BTC',
    status: 'completed',
    date: '2024-03-02T11:30:00Z',
    description: 'Bought Bitcoin'
  },
  {
    id: 'tx3',
    userId: 'u1',
    type: 'withdrawal',
    amount: 200,
    currency: 'USDT',
    status: 'pending',
    date: '2024-03-05T09:15:00Z',
    description: 'Withdrawal request'
  }
];

// Mock Investment Plans
export const MOCK_PLANS: InvestmentPlan[] = [
  {
    id: 'p1',
    name: 'Starter Plan',
    description: 'Good for beginners',
    minAmount: 100,
    maxAmount: 1000,
    roi: 5,
    durationDays: 7,
    riskLevel: 'low'
  },
  {
    id: 'p2',
    name: 'Pro Plan',
    description: 'Higher returns for serious investors',
    minAmount: 1000,
    maxAmount: 10000,
    roi: 15,
    durationDays: 30,
    riskLevel: 'medium'
  }
];

// Mock AI Bots
export const MOCK_BOTS: AIBot[] = [
  {
    id: 'b1',
    name: 'Alpha Trader',
    description: 'High frequency trading bot',
    price: 50,
    durationDays: 30,
    expectedRoi: '10-20%',
    totalGains: 15000,
    totalLosses: 2000,
    winRate: 88
  }
];

// Mock Support Tickets
export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 't1',
    userId: 'u1',
    subject: 'Deposit Issue',
    message: 'My deposit hasn\'t arrived yet.',
    status: 'open',
    priority: 'high',
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-03-05T10:30:00Z',
    messages: [
      { sender: 'user', text: 'My deposit hasn\'t arrived yet.', timestamp: '2024-03-05T10:00:00Z' },
      { sender: 'admin', text: 'Please provide the TX hash.', timestamp: '2024-03-05T10:30:00Z' }
    ]
  }
];

// Mock System Settings
export const MOCK_SETTINGS: SystemSettings = {
  siteName: 'CryptoTrade Pro',
  supportEmail: 'support@cryptotrade.com',
  depositEnabled: true,
  withdrawalEnabled: true,
  minDeposit: 50,
  minWithdrawal: 20,
  maintenanceMode: false
};
