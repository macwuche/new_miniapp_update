import { 
  users, 
  admins,
  cryptoAssets,
  forexAssets,
  stockAssets,
  transactions,
  deposits,
  withdrawals,
  swaps,
  investmentPlans,
  userInvestments,
  aiBots,
  userBots,
  linkedWalletTypes,
  connectedWallets,
  cryptoAddresses,
  portfolios,
  userBalances,
  supportTicketCategories,
  supportTickets,
  systemSettings,
  userEmails,
  kycVerifications,
  paymentGateways,
  withdrawalGateways,
  type User,
  type InsertUser,
  type Admin,
  type InsertAdmin,
  type CryptoAsset,
  type InsertCryptoAsset,
  type ForexAsset,
  type InsertForexAsset,
  type StockAsset,
  type InsertStockAsset,
  type Transaction,
  type InsertTransaction,
  type Deposit,
  type InsertDeposit,
  type Withdrawal,
  type InsertWithdrawal,
  type Swap,
  type InsertSwap,
  type InvestmentPlan,
  type InsertInvestmentPlan,
  type UserInvestment,
  type InsertUserInvestment,
  type AiBot,
  type InsertAiBot,
  type UserBot,
  type InsertUserBot,
  type LinkedWalletType,
  type InsertLinkedWalletType,
  type ConnectedWallet,
  type InsertConnectedWallet,
  type CryptoAddress,
  type InsertCryptoAddress,
  type Portfolio,
  type InsertPortfolio,
  type UserBalance,
  type InsertUserBalance,
  type SupportTicketCategory,
  type InsertSupportTicketCategory,
  type SupportTicket,
  type InsertSupportTicket,
  type SystemSettings,
  type InsertSystemSettings,
  type UserEmail,
  type InsertUserEmail,
  type KycVerification,
  type InsertKycVerification,
  type PaymentGateway,
  type InsertPaymentGateway,
  type WithdrawalGateway,
  type InsertWithdrawalGateway,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql as drizzleSql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(limit?: number, offset?: number): Promise<User[]>;
  
  // Admins
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Crypto Assets
  getCryptoAsset(id: number): Promise<CryptoAsset | undefined>;
  listCryptoAssets(): Promise<CryptoAsset[]>;
  createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;
  updateCryptoAsset(id: number, asset: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined>;
  
  // Forex Assets
  getForexAsset(id: number): Promise<ForexAsset | undefined>;
  listForexAssets(): Promise<ForexAsset[]>;
  createForexAsset(asset: InsertForexAsset): Promise<ForexAsset>;
  updateForexAsset(id: number, asset: Partial<InsertForexAsset>): Promise<ForexAsset | undefined>;
  
  // Stock Assets
  getStockAsset(id: number): Promise<StockAsset | undefined>;
  listStockAssets(): Promise<StockAsset[]>;
  createStockAsset(asset: InsertStockAsset): Promise<StockAsset>;
  updateStockAsset(id: number, asset: Partial<InsertStockAsset>): Promise<StockAsset | undefined>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  listTransactions(status?: string): Promise<Transaction[]>;
  listUserTransactions(userId: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  
  // Deposits
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  getDeposit(id: number): Promise<Deposit | undefined>;
  listDeposits(status?: string): Promise<Deposit[]>;
  listUserDeposits(userId: number): Promise<Deposit[]>;
  approveDeposit(id: number, adminId: number): Promise<Deposit | undefined>;
  updateDepositStatus(id: number, status: string): Promise<Deposit | undefined>;
  
  // Withdrawals
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  listWithdrawals(status?: string): Promise<Withdrawal[]>;
  listUserWithdrawals(userId: number): Promise<Withdrawal[]>;
  approveWithdrawal(id: number, adminId: number): Promise<Withdrawal | undefined>;
  updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal | undefined>;
  
  // Swaps
  createSwap(swap: InsertSwap): Promise<Swap>;
  listUserSwaps(userId: number): Promise<Swap[]>;
  
  // Investment Plans
  createInvestmentPlan(plan: InsertInvestmentPlan): Promise<InvestmentPlan>;
  getInvestmentPlan(id: number): Promise<InvestmentPlan | undefined>;
  listInvestmentPlans(): Promise<InvestmentPlan[]>;
  updateInvestmentPlan(id: number, plan: Partial<InsertInvestmentPlan>): Promise<InvestmentPlan | undefined>;
  
  // User Investments
  createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment>;
  getUserInvestment(id: number): Promise<UserInvestment | undefined>;
  listUserInvestments(userId: number): Promise<UserInvestment[]>;
  updateUserInvestment(id: number, investment: Partial<InsertUserInvestment>): Promise<UserInvestment | undefined>;
  
  // AI Bots
  createAiBot(bot: InsertAiBot): Promise<AiBot>;
  getAiBot(id: number): Promise<AiBot | undefined>;
  listAiBots(): Promise<AiBot[]>;
  updateAiBot(id: number, bot: Partial<InsertAiBot>): Promise<AiBot | undefined>;
  
  // User Bots
  createUserBot(userBot: InsertUserBot): Promise<UserBot>;
  getUserBot(id: number): Promise<UserBot | undefined>;
  listUserBots(userId: number): Promise<UserBot[]>;
  updateUserBot(id: number, userBot: Partial<InsertUserBot>): Promise<UserBot | undefined>;
  
  // Connected Wallets
  createConnectedWallet(wallet: InsertConnectedWallet): Promise<ConnectedWallet>;
  listUserWallets(userId: number, includeDeleted?: boolean): Promise<ConnectedWallet[]>;
  deleteConnectedWallet(id: number): Promise<boolean>;
  
  // Crypto Addresses
  createCryptoAddress(address: InsertCryptoAddress): Promise<CryptoAddress>;
  getCryptoAddress(id: number): Promise<CryptoAddress | undefined>;
  listUserCryptoAddresses(userId: number): Promise<CryptoAddress[]>;
  listUserCryptoAddressesByGateway(userId: number, gatewayId: number): Promise<CryptoAddress[]>;
  deleteCryptoAddress(id: number): Promise<boolean>;
  
  // Portfolio
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getUserPortfolio(userId: number): Promise<Portfolio[]>;
  getPortfolioBySymbol(userId: number, symbol: string): Promise<Portfolio | undefined>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number): Promise<boolean>;
  upsertPortfolio(userId: number, symbol: string, data: Partial<InsertPortfolio>): Promise<Portfolio>;
  
  // User Balance
  getUserBalance(userId: number): Promise<UserBalance | undefined>;
  createUserBalance(balance: InsertUserBalance): Promise<UserBalance>;
  updateUserBalance(userId: number, balance: Partial<InsertUserBalance>): Promise<UserBalance | undefined>;
  getAllUserBalances(): Promise<UserBalance[]>;
  
  // Support Ticket Categories
  createSupportTicketCategory(category: InsertSupportTicketCategory): Promise<SupportTicketCategory>;
  listSupportTicketCategories(activeOnly?: boolean): Promise<SupportTicketCategory[]>;
  updateSupportTicketCategory(id: number, category: Partial<InsertSupportTicketCategory>): Promise<SupportTicketCategory | undefined>;
  deleteSupportTicketCategory(id: number): Promise<boolean>;
  
  // Support Tickets
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  listUserTickets(userId: number): Promise<SupportTicket[]>;
  listAllTickets(): Promise<SupportTicket[]>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  
  // System Settings
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings | undefined>;
  
  // User Emails
  createUserEmail(email: InsertUserEmail): Promise<UserEmail>;
  listUserEmails(userId: number): Promise<UserEmail[]>;
  
  // KYC Verifications
  createKycVerification(kyc: InsertKycVerification): Promise<KycVerification>;
  getKycVerification(userId: number): Promise<KycVerification | undefined>;
  updateKycVerification(id: number, kyc: Partial<InsertKycVerification>): Promise<KycVerification | undefined>;
  listPendingKyc(): Promise<KycVerification[]>;
  
  // Payment Gateways
  createPaymentGateway(gateway: InsertPaymentGateway): Promise<PaymentGateway>;
  getPaymentGateway(id: number): Promise<PaymentGateway | undefined>;
  listPaymentGateways(status?: string): Promise<PaymentGateway[]>;
  listEnabledPaymentGateways(): Promise<PaymentGateway[]>;
  updatePaymentGateway(id: number, gateway: Partial<InsertPaymentGateway>): Promise<PaymentGateway | undefined>;
  deletePaymentGateway(id: number): Promise<boolean>;
  
  // Withdrawal Gateways
  createWithdrawalGateway(gateway: InsertWithdrawalGateway): Promise<WithdrawalGateway>;
  getWithdrawalGateway(id: number): Promise<WithdrawalGateway | undefined>;
  listWithdrawalGateways(status?: string): Promise<WithdrawalGateway[]>;
  listEnabledWithdrawalGateways(): Promise<WithdrawalGateway[]>;
  updateWithdrawalGateway(id: number, gateway: Partial<InsertWithdrawalGateway>): Promise<WithdrawalGateway | undefined>;
  deleteWithdrawalGateway(id: number): Promise<boolean>;
  
  // Linked Wallet Types
  createLinkedWalletType(walletType: InsertLinkedWalletType): Promise<LinkedWalletType>;
  getLinkedWalletType(id: number): Promise<LinkedWalletType | undefined>;
  listLinkedWalletTypes(): Promise<LinkedWalletType[]>;
  listEnabledLinkedWalletTypes(): Promise<LinkedWalletType[]>;
  updateLinkedWalletType(id: number, walletType: Partial<InsertLinkedWalletType>): Promise<LinkedWalletType | undefined>;
  deleteLinkedWalletType(id: number): Promise<boolean>;
  
  // All Connected Wallets (admin)
  listAllConnectedWallets(): Promise<ConnectedWallet[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async listUsers(limit: number = 100, offset: number = 0): Promise<User[]> {
    return await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.joinedAt));
  }

  // Admins
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const adminData = {
      ...insertAdmin,
      permissions: insertAdmin.permissions || []
    };
    const [admin] = await db.insert(admins).values(adminData as any).returning();
    return admin;
  }

  // Crypto Assets
  async getCryptoAsset(id: number): Promise<CryptoAsset | undefined> {
    const [asset] = await db.select().from(cryptoAssets).where(eq(cryptoAssets.id, id));
    return asset || undefined;
  }

  async listCryptoAssets(): Promise<CryptoAsset[]> {
    return await db.select().from(cryptoAssets).orderBy(desc(cryptoAssets.marketCap));
  }

  async createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    const [created] = await db.insert(cryptoAssets).values(asset).returning();
    return created;
  }

  async updateCryptoAsset(id: number, asset: Partial<InsertCryptoAsset>): Promise<CryptoAsset | undefined> {
    const [updated] = await db.update(cryptoAssets).set(asset).where(eq(cryptoAssets.id, id)).returning();
    return updated || undefined;
  }

  // Forex Assets
  async getForexAsset(id: number): Promise<ForexAsset | undefined> {
    const [asset] = await db.select().from(forexAssets).where(eq(forexAssets.id, id));
    return asset || undefined;
  }

  async listForexAssets(): Promise<ForexAsset[]> {
    return await db.select().from(forexAssets);
  }

  async createForexAsset(asset: InsertForexAsset): Promise<ForexAsset> {
    const [created] = await db.insert(forexAssets).values(asset).returning();
    return created;
  }

  async updateForexAsset(id: number, asset: Partial<InsertForexAsset>): Promise<ForexAsset | undefined> {
    const [updated] = await db.update(forexAssets).set(asset).where(eq(forexAssets.id, id)).returning();
    return updated || undefined;
  }

  // Stock Assets
  async getStockAsset(id: number): Promise<StockAsset | undefined> {
    const [asset] = await db.select().from(stockAssets).where(eq(stockAssets.id, id));
    return asset || undefined;
  }

  async listStockAssets(): Promise<StockAsset[]> {
    return await db.select().from(stockAssets);
  }

  async createStockAsset(asset: InsertStockAsset): Promise<StockAsset> {
    const [created] = await db.insert(stockAssets).values(asset).returning();
    return created;
  }

  async updateStockAsset(id: number, asset: Partial<InsertStockAsset>): Promise<StockAsset | undefined> {
    const [updated] = await db.update(stockAssets).set(asset).where(eq(stockAssets.id, id)).returning();
    return updated || undefined;
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async listUserTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async listTransactions(status?: string): Promise<Transaction[]> {
    if (status) {
      return await db.select().from(transactions).where(eq(transactions.status, status as any)).orderBy(desc(transactions.createdAt));
    }
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const [updated] = await db.update(transactions)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updated || undefined;
  }

  // Deposits
  async createDeposit(deposit: InsertDeposit): Promise<Deposit> {
    const [created] = await db.insert(deposits).values(deposit).returning();
    return created;
  }

  async getDeposit(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit || undefined;
  }

  async listDeposits(status?: string): Promise<Deposit[]> {
    if (status) {
      return await db.select().from(deposits).where(eq(deposits.status, status as any)).orderBy(desc(deposits.createdAt));
    }
    return await db.select().from(deposits).orderBy(desc(deposits.createdAt));
  }

  async listUserDeposits(userId: number): Promise<Deposit[]> {
    return await db.select().from(deposits).where(eq(deposits.userId, userId)).orderBy(desc(deposits.createdAt));
  }

  async approveDeposit(id: number, adminId: number): Promise<Deposit | undefined> {
    const [deposit] = await db
      .update(deposits)
      .set({ 
        status: 'approved', 
        approvedBy: adminId,
        approvedAt: new Date()
      })
      .where(eq(deposits.id, id))
      .returning();
    return deposit || undefined;
  }

  async updateDepositStatus(id: number, status: string): Promise<Deposit | undefined> {
    const [deposit] = await db.update(deposits).set({ status: status as any }).where(eq(deposits.id, id)).returning();
    return deposit || undefined;
  }

  // Withdrawals
  async createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [created] = await db.insert(withdrawals).values(withdrawal).returning();
    return created;
  }

  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    return withdrawal || undefined;
  }

  async listWithdrawals(status?: string): Promise<Withdrawal[]> {
    if (status) {
      return await db.select().from(withdrawals).where(eq(withdrawals.status, status as any)).orderBy(desc(withdrawals.createdAt));
    }
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
  }

  async listUserWithdrawals(userId: number): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt));
  }

  async approveWithdrawal(id: number, adminId: number): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db
      .update(withdrawals)
      .set({ 
        status: 'approved', 
        approvedBy: adminId,
        approvedAt: new Date()
      })
      .where(eq(withdrawals.id, id))
      .returning();
    return withdrawal || undefined;
  }

  async updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db.update(withdrawals).set({ status: status as any }).where(eq(withdrawals.id, id)).returning();
    return withdrawal || undefined;
  }

  // Swaps
  async createSwap(swap: InsertSwap): Promise<Swap> {
    const [created] = await db.insert(swaps).values(swap).returning();
    return created;
  }

  async listUserSwaps(userId: number): Promise<Swap[]> {
    return await db.select().from(swaps).where(eq(swaps.userId, userId)).orderBy(desc(swaps.createdAt));
  }

  // Investment Plans
  async createInvestmentPlan(plan: InsertInvestmentPlan): Promise<InvestmentPlan> {
    const [created] = await db.insert(investmentPlans).values(plan).returning();
    return created;
  }

  async getInvestmentPlan(id: number): Promise<InvestmentPlan | undefined> {
    const [plan] = await db.select().from(investmentPlans).where(eq(investmentPlans.id, id));
    return plan || undefined;
  }

  async listInvestmentPlans(): Promise<InvestmentPlan[]> {
    return await db.select().from(investmentPlans).where(eq(investmentPlans.isActive, true));
  }

  async updateInvestmentPlan(id: number, plan: Partial<InsertInvestmentPlan>): Promise<InvestmentPlan | undefined> {
    const [updated] = await db.update(investmentPlans).set(plan).where(eq(investmentPlans.id, id)).returning();
    return updated || undefined;
  }

  // User Investments
  async createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment> {
    const [created] = await db.insert(userInvestments).values(investment).returning();
    return created;
  }

  async getUserInvestment(id: number): Promise<UserInvestment | undefined> {
    const [investment] = await db.select().from(userInvestments).where(eq(userInvestments.id, id));
    return investment || undefined;
  }

  async listUserInvestments(userId: number): Promise<UserInvestment[]> {
    return await db.select().from(userInvestments).where(eq(userInvestments.userId, userId)).orderBy(desc(userInvestments.createdAt));
  }

  async updateUserInvestment(id: number, investment: Partial<InsertUserInvestment>): Promise<UserInvestment | undefined> {
    const [updated] = await db.update(userInvestments).set(investment).where(eq(userInvestments.id, id)).returning();
    return updated || undefined;
  }

  // AI Bots
  async createAiBot(bot: InsertAiBot): Promise<AiBot> {
    const [created] = await db.insert(aiBots).values(bot).returning();
    return created;
  }

  async getAiBot(id: number): Promise<AiBot | undefined> {
    const [bot] = await db.select().from(aiBots).where(eq(aiBots.id, id));
    return bot || undefined;
  }

  async listAiBots(): Promise<AiBot[]> {
    return await db.select().from(aiBots).where(eq(aiBots.isActive, true));
  }

  async updateAiBot(id: number, bot: Partial<InsertAiBot>): Promise<AiBot | undefined> {
    const [updated] = await db.update(aiBots).set(bot).where(eq(aiBots.id, id)).returning();
    return updated || undefined;
  }

  // User Bots
  async createUserBot(userBot: InsertUserBot): Promise<UserBot> {
    const [created] = await db.insert(userBots).values(userBot).returning();
    return created;
  }

  async getUserBot(id: number): Promise<UserBot | undefined> {
    const [bot] = await db.select().from(userBots).where(eq(userBots.id, id));
    return bot || undefined;
  }

  async listUserBots(userId: number): Promise<UserBot[]> {
    return await db.select().from(userBots).where(eq(userBots.userId, userId)).orderBy(desc(userBots.createdAt));
  }

  async updateUserBot(id: number, userBot: Partial<InsertUserBot>): Promise<UserBot | undefined> {
    const [updated] = await db.update(userBots).set(userBot).where(eq(userBots.id, id)).returning();
    return updated || undefined;
  }

  // Connected Wallets
  async createConnectedWallet(wallet: InsertConnectedWallet): Promise<ConnectedWallet> {
    const [created] = await db.insert(connectedWallets).values(wallet).returning();
    return created;
  }

  async listUserWallets(userId: number, includeDeleted: boolean = false): Promise<ConnectedWallet[]> {
    if (includeDeleted) {
      return await db.select().from(connectedWallets).where(eq(connectedWallets.userId, userId));
    }
    return await db.select().from(connectedWallets).where(
      and(
        eq(connectedWallets.userId, userId),
        eq(connectedWallets.isDeleted, false)
      )
    );
  }

  async deleteConnectedWallet(id: number): Promise<boolean> {
    const [updated] = await db.update(connectedWallets).set({ isDeleted: true }).where(eq(connectedWallets.id, id)).returning();
    return !!updated;
  }

  // Crypto Addresses
  async createCryptoAddress(address: InsertCryptoAddress): Promise<CryptoAddress> {
    const [created] = await db.insert(cryptoAddresses).values(address).returning();
    return created;
  }

  async getCryptoAddress(id: number): Promise<CryptoAddress | undefined> {
    const [address] = await db.select().from(cryptoAddresses).where(eq(cryptoAddresses.id, id));
    return address || undefined;
  }

  async listUserCryptoAddresses(userId: number): Promise<CryptoAddress[]> {
    return await db.select().from(cryptoAddresses).where(
      and(
        eq(cryptoAddresses.userId, userId),
        eq(cryptoAddresses.isDeleted, false)
      )
    );
  }

  async listUserCryptoAddressesByGateway(userId: number, gatewayId: number): Promise<CryptoAddress[]> {
    return await db.select().from(cryptoAddresses).where(
      and(
        eq(cryptoAddresses.userId, userId),
        eq(cryptoAddresses.gatewayId, gatewayId),
        eq(cryptoAddresses.isDeleted, false)
      )
    );
  }

  async deleteCryptoAddress(id: number): Promise<boolean> {
    const [updated] = await db.update(cryptoAddresses).set({ isDeleted: true }).where(eq(cryptoAddresses.id, id)).returning();
    return !!updated;
  }

  // Portfolio
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [created] = await db.insert(portfolios).values(portfolio).returning();
    return created;
  }

  async getUserPortfolio(userId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updated] = await db.update(portfolios).set({ ...portfolio, updatedAt: new Date() }).where(eq(portfolios.id, id)).returning();
    return updated || undefined;
  }

  async getPortfolioBySymbol(userId: number, symbol: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(
      and(eq(portfolios.userId, userId), eq(portfolios.symbol, symbol))
    );
    return portfolio || undefined;
  }

  async deletePortfolio(id: number): Promise<boolean> {
    const [deleted] = await db.delete(portfolios).where(eq(portfolios.id, id)).returning();
    return !!deleted;
  }

  async upsertPortfolio(userId: number, symbol: string, data: Partial<InsertPortfolio>): Promise<Portfolio> {
    const existing = await this.getPortfolioBySymbol(userId, symbol);
    if (existing) {
      const updated = await this.updatePortfolio(existing.id, data);
      return updated!;
    } else {
      return await this.createPortfolio({
        userId,
        symbol,
        assetId: data.assetId || symbol.toLowerCase(),
        assetType: data.assetType || 'crypto',
        name: data.name || symbol,
        amount: data.amount || '0',
        averageBuyPrice: data.averageBuyPrice || '0',
        currentValue: data.currentValue || '0',
      });
    }
  }

  // User Balance
  async getUserBalance(userId: number): Promise<UserBalance | undefined> {
    const [balance] = await db.select().from(userBalances).where(eq(userBalances.userId, userId));
    return balance || undefined;
  }

  async createUserBalance(balance: InsertUserBalance): Promise<UserBalance> {
    const [created] = await db.insert(userBalances).values(balance).returning();
    return created;
  }

  async updateUserBalance(userId: number, balance: Partial<InsertUserBalance>): Promise<UserBalance | undefined> {
    const [updated] = await db.update(userBalances).set(balance).where(eq(userBalances.userId, userId)).returning();
    return updated || undefined;
  }

  async getAllUserBalances(): Promise<UserBalance[]> {
    return await db.select().from(userBalances);
  }

  // Support Tickets
  // Support Ticket Categories
  async createSupportTicketCategory(category: InsertSupportTicketCategory): Promise<SupportTicketCategory> {
    const [created] = await db.insert(supportTicketCategories).values(category).returning();
    return created;
  }

  async listSupportTicketCategories(activeOnly?: boolean): Promise<SupportTicketCategory[]> {
    if (activeOnly) {
      return await db.select().from(supportTicketCategories).where(eq(supportTicketCategories.isActive, true));
    }
    return await db.select().from(supportTicketCategories);
  }

  async updateSupportTicketCategory(id: number, category: Partial<InsertSupportTicketCategory>): Promise<SupportTicketCategory | undefined> {
    const [updated] = await db.update(supportTicketCategories).set(category).where(eq(supportTicketCategories.id, id)).returning();
    return updated || undefined;
  }

  async deleteSupportTicketCategory(id: number): Promise<boolean> {
    const result = await db.delete(supportTicketCategories).where(eq(supportTicketCategories.id, id));
    return true;
  }

  // Support Tickets
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const ticketData = {
      ...ticket,
      messages: ticket.messages || []
    };
    const [created] = await db.insert(supportTickets).values(ticketData as any).returning();
    return created;
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async listUserTickets(userId: number): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.updatedAt));
  }

  async listAllTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.updatedAt));
  }

  async updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(supportTickets).set(ticket as any).where(eq(supportTickets.id, id)).returning();
    return updated || undefined;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    return settings || undefined;
  }

  async updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings | undefined> {
    const existing = await this.getSystemSettings();
    if (existing) {
      const [updated] = await db.update(systemSettings).set(settings).where(eq(systemSettings.id, existing.id)).returning();
      return updated || undefined;
    } else {
      const [created] = await db.insert(systemSettings).values(settings as InsertSystemSettings).returning();
      return created;
    }
  }

  // User Emails
  async createUserEmail(email: InsertUserEmail): Promise<UserEmail> {
    const [created] = await db.insert(userEmails).values(email).returning();
    return created;
  }

  async listUserEmails(userId: number): Promise<UserEmail[]> {
    return await db.select().from(userEmails).where(eq(userEmails.userId, userId));
  }

  // KYC Verifications
  async createKycVerification(kyc: InsertKycVerification): Promise<KycVerification> {
    const [created] = await db.insert(kycVerifications).values(kyc).returning();
    return created;
  }

  async getKycVerification(userId: number): Promise<KycVerification | undefined> {
    const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.userId, userId));
    return kyc || undefined;
  }

  async updateKycVerification(id: number, kyc: Partial<InsertKycVerification>): Promise<KycVerification | undefined> {
    const [updated] = await db.update(kycVerifications).set(kyc).where(eq(kycVerifications.id, id)).returning();
    return updated || undefined;
  }

  async listPendingKyc(): Promise<KycVerification[]> {
    return await db.select().from(kycVerifications).where(eq(kycVerifications.status, 'pending'));
  }

  // Payment Gateways
  async createPaymentGateway(gateway: InsertPaymentGateway): Promise<PaymentGateway> {
    const [created] = await db.insert(paymentGateways).values(gateway).returning();
    return created;
  }

  async getPaymentGateway(id: number): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return gateway || undefined;
  }

  async listPaymentGateways(status?: string): Promise<PaymentGateway[]> {
    if (status) {
      return await db.select().from(paymentGateways).where(eq(paymentGateways.status, status as any)).orderBy(desc(paymentGateways.createdAt));
    }
    return await db.select().from(paymentGateways).orderBy(desc(paymentGateways.createdAt));
  }

  async listEnabledPaymentGateways(): Promise<PaymentGateway[]> {
    return await db.select().from(paymentGateways).where(eq(paymentGateways.status, 'enabled')).orderBy(desc(paymentGateways.createdAt));
  }

  async updatePaymentGateway(id: number, gateway: Partial<InsertPaymentGateway>): Promise<PaymentGateway | undefined> {
    const [updated] = await db.update(paymentGateways).set({ ...gateway, updatedAt: new Date() }).where(eq(paymentGateways.id, id)).returning();
    return updated || undefined;
  }

  async deletePaymentGateway(id: number): Promise<boolean> {
    const [deleted] = await db.delete(paymentGateways).where(eq(paymentGateways.id, id)).returning();
    return !!deleted;
  }

  // Withdrawal Gateways
  async createWithdrawalGateway(gateway: InsertWithdrawalGateway): Promise<WithdrawalGateway> {
    const [created] = await db.insert(withdrawalGateways).values(gateway).returning();
    return created;
  }

  async getWithdrawalGateway(id: number): Promise<WithdrawalGateway | undefined> {
    const [gateway] = await db.select().from(withdrawalGateways).where(eq(withdrawalGateways.id, id));
    return gateway || undefined;
  }

  async listWithdrawalGateways(status?: string): Promise<WithdrawalGateway[]> {
    if (status) {
      return await db.select().from(withdrawalGateways).where(eq(withdrawalGateways.status, status as any)).orderBy(desc(withdrawalGateways.createdAt));
    }
    return await db.select().from(withdrawalGateways).orderBy(desc(withdrawalGateways.createdAt));
  }

  async listEnabledWithdrawalGateways(): Promise<WithdrawalGateway[]> {
    return await db.select().from(withdrawalGateways).where(eq(withdrawalGateways.status, 'enabled')).orderBy(desc(withdrawalGateways.createdAt));
  }

  async updateWithdrawalGateway(id: number, gateway: Partial<InsertWithdrawalGateway>): Promise<WithdrawalGateway | undefined> {
    const [updated] = await db.update(withdrawalGateways).set({ ...gateway, updatedAt: new Date() }).where(eq(withdrawalGateways.id, id)).returning();
    return updated || undefined;
  }

  async deleteWithdrawalGateway(id: number): Promise<boolean> {
    const [deleted] = await db.delete(withdrawalGateways).where(eq(withdrawalGateways.id, id)).returning();
    return !!deleted;
  }

  // Linked Wallet Types
  async createLinkedWalletType(walletType: InsertLinkedWalletType): Promise<LinkedWalletType> {
    const [created] = await db.insert(linkedWalletTypes).values(walletType).returning();
    return created;
  }

  async getLinkedWalletType(id: number): Promise<LinkedWalletType | undefined> {
    const [walletType] = await db.select().from(linkedWalletTypes).where(eq(linkedWalletTypes.id, id));
    return walletType || undefined;
  }

  async listLinkedWalletTypes(): Promise<LinkedWalletType[]> {
    return await db.select().from(linkedWalletTypes).orderBy(desc(linkedWalletTypes.createdAt));
  }

  async listEnabledLinkedWalletTypes(): Promise<LinkedWalletType[]> {
    return await db.select().from(linkedWalletTypes).where(eq(linkedWalletTypes.status, 'enabled')).orderBy(desc(linkedWalletTypes.createdAt));
  }

  async updateLinkedWalletType(id: number, walletType: Partial<InsertLinkedWalletType>): Promise<LinkedWalletType | undefined> {
    const [updated] = await db.update(linkedWalletTypes).set({ ...walletType, updatedAt: new Date() }).where(eq(linkedWalletTypes.id, id)).returning();
    return updated || undefined;
  }

  async deleteLinkedWalletType(id: number): Promise<boolean> {
    const [deleted] = await db.delete(linkedWalletTypes).where(eq(linkedWalletTypes.id, id)).returning();
    return !!deleted;
  }

  // All Connected Wallets (admin)
  async listAllConnectedWallets(): Promise<ConnectedWallet[]> {
    return await db.select().from(connectedWallets).where(eq(connectedWallets.isDeleted, false)).orderBy(desc(connectedWallets.connectedAt));
  }
}

export const storage = new DatabaseStorage();
