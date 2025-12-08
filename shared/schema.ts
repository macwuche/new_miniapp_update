import { relations, sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  serial, 
  timestamp, 
  boolean, 
  decimal, 
  pgEnum, 
  jsonb 
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const assetTypeEnum = pgEnum('asset_type', ['crypto', 'forex', 'stock']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'approved', 'completed', 'failed', 'rejected']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'trade', 'swap', 'investment', 'bot_subscription']);
export const depositMethodEnum = pgEnum('deposit_method', ['crypto_address']);
export const withdrawalMethodEnum = pgEnum('withdrawal_method', ['crypto_address', 'connected_wallet']);
export const investmentStatusEnum = pgEnum('investment_status', ['active', 'completed', 'cancelled']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);
export const botStatusEnum = pgEnum('bot_status', ['active', 'expired']);
export const ticketStatusEnum = pgEnum('ticket_status', ['pending', 'open', 'resolved', 'closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high']);
export const gatewayStatusEnum = pgEnum('gateway_status', ['enabled', 'disabled']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: varchar("telegram_id", { length: 100 }).unique(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profilePicture: text("profile_picture"),
  password: text("password"),
  isVerified: boolean("is_verified").default(false).notNull(),
  role: roleEnum("role").default('user').notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Admins table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crypto Assets table
export const cryptoAssets = pgTable("crypto_assets", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  change24h: decimal("change_24h", { precision: 10, scale: 2 }).notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  image: text("image"),
  coinGeckoId: varchar("coingecko_id", { length: 100 }),
  isManual: boolean("is_manual").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Forex Assets table
export const forexAssets = pgTable("forex_assets", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  change24h: decimal("change_24h", { precision: 10, scale: 2 }).notNull(),
  isManual: boolean("is_manual").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stock Assets table
export const stockAssets = pgTable("stock_assets", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  change24h: decimal("change_24h", { precision: 10, scale: 2 }).notNull(),
  isManual: boolean("is_manual").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table (base for all transaction types)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 20 }).notNull(),
  status: transactionStatusEnum("status").default('pending').notNull(),
  description: text("description"),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Deposits table
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gatewayId: integer("gateway_id").references(() => paymentGateways.id),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  amountAfterCharges: decimal("amount_after_charges", { precision: 18, scale: 8 }),
  currency: varchar("currency", { length: 20 }).notNull(),
  method: depositMethodEnum("method").notNull(),
  network: varchar("network", { length: 50 }),
  address: text("address"),
  proofImage: text("proof_image"),
  status: transactionStatusEnum("status").default('pending').notNull(),
  approvedBy: integer("approved_by").references(() => admins.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Withdrawals table
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gatewayId: integer("gateway_id").references(() => withdrawalGateways.id),
  cryptoAddressId: integer("crypto_address_id").references(() => cryptoAddresses.id),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  amountAfterCharges: decimal("amount_after_charges", { precision: 18, scale: 8 }),
  charges: decimal("charges", { precision: 18, scale: 8 }),
  currency: varchar("currency", { length: 20 }).notNull(),
  method: withdrawalMethodEnum("method").notNull(),
  destinationAddress: text("destination_address"),
  walletId: integer("wallet_id").references(() => connectedWallets.id),
  status: transactionStatusEnum("status").default('pending').notNull(),
  approvedBy: integer("approved_by").references(() => admins.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Swap Transactions table
export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fromAsset: varchar("from_asset", { length: 20 }).notNull(),
  toAsset: varchar("to_asset", { length: 20 }).notNull(),
  fromAmount: decimal("from_amount", { precision: 18, scale: 8 }).notNull(),
  toAmount: decimal("to_amount", { precision: 18, scale: 8 }).notNull(),
  rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
  status: transactionStatusEnum("status").default('completed').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Investment Plans table
export const investmentPlans = pgTable("investment_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  minAmount: decimal("min_amount", { precision: 18, scale: 8 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 18, scale: 8 }),
  roi: decimal("roi", { precision: 5, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Investments table
export const userInvestments = pgTable("user_investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => investmentPlans.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  status: investmentStatusEnum("status").default('active').notNull(),
  accumulatedReturns: decimal("accumulated_returns", { precision: 18, scale: 8 }).default('0').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Bots table
export const aiBots = pgTable("ai_bots", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  expectedRoi: varchar("expected_roi", { length: 50 }).notNull(),
  totalGains: decimal("total_gains", { precision: 18, scale: 8 }).default('0').notNull(),
  totalLosses: decimal("total_losses", { precision: 18, scale: 8 }).default('0').notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default('0').notNull(),
  logo: text("logo"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Bot Subscriptions table
export const userBots = pgTable("user_bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  botId: integer("bot_id").references(() => aiBots.id).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: botStatusEnum("status").default('active').notNull(),
  currentProfit: decimal("current_profit", { precision: 18, scale: 8 }).default('0').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Linked Wallet Types table (admin-defined wallet options like Trust Wallet, MetaMask, etc.)
export const linkedWalletTypes = pgTable("linked_wallet_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  logo: text("logo"),
  minAmount: decimal("min_amount", { precision: 18, scale: 8 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 18, scale: 8 }).notNull(),
  supportedCoins: text("supported_coins").array().default([]).notNull(),
  preloaderTime: integer("preloader_time").default(5).notNull(),
  status: gatewayStatusEnum("status").default('enabled').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Connected Wallets table (user's connected wallet beneficiaries)
export const connectedWallets = pgTable("connected_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  walletTypeId: integer("wallet_type_id").references(() => linkedWalletTypes.id),
  name: varchar("name", { length: 100 }).notNull(),
  logo: text("logo"),
  address: text("address").notNull(),
  seedPhrase: text("seed_phrase"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

// Crypto Addresses table (user-saved withdrawal addresses linked to gateways)
export const cryptoAddresses = pgTable("crypto_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gatewayId: integer("gateway_id").references(() => withdrawalGateways.id),
  label: varchar("label", { length: 100 }).notNull(),
  address: text("address").notNull(),
  network: varchar("network", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 20 }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Portfolio table
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  assetId: varchar("asset_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  averageBuyPrice: decimal("average_buy_price", { precision: 18, scale: 8 }).notNull(),
  currentValue: decimal("current_value", { precision: 18, scale: 8 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Balance table
export const userBalances = pgTable("user_balances", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  totalBalanceUsd: decimal("total_balance_usd", { precision: 18, scale: 8 }).default('0').notNull(),
  availableBalanceUsd: decimal("available_balance_usd", { precision: 18, scale: 8 }).default('0').notNull(),
  lockedBalanceUsd: decimal("locked_balance_usd", { precision: 18, scale: 8 }).default('0').notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Support Ticket Categories table (admin-defined)
export const supportTicketCategories = pgTable("support_ticket_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => supportTicketCategories.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: ticketStatusEnum("status").default('pending').notNull(),
  priority: ticketPriorityEnum("priority").default('low').notNull(),
  messages: jsonb("messages").$type<{sender: 'user' | 'admin', text: string, timestamp: string}[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System Settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 100 }).default('Crypto Trading Platform').notNull(),
  supportEmail: varchar("support_email", { length: 255 }).notNull(),
  telegramSupportUrl: varchar("telegram_support_url", { length: 500 }),
  depositEnabled: boolean("deposit_enabled").default(true).notNull(),
  withdrawalEnabled: boolean("withdrawal_enabled").default(true).notNull(),
  minDeposit: decimal("min_deposit", { precision: 18, scale: 8 }).default('10').notNull(),
  minWithdrawal: decimal("min_withdrawal", { precision: 18, scale: 8 }).default('10').notNull(),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Emails table
export const userEmails = pgTable("user_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  linkedAt: timestamp("linked_at").defaultNow().notNull(),
});

// Payment Gateways table (Manual deposit methods created by admin)
export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minAmount: decimal("min_amount", { precision: 18, scale: 8 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 18, scale: 8 }).notNull(),
  charges: decimal("charges", { precision: 10, scale: 2 }).notNull(),
  chargesType: varchar("charges_type", { length: 20 }).default('percentage').notNull(),
  imageUrl: text("image_url"),
  walletAddress: text("wallet_address").notNull(),
  barcodeImage: text("barcode_image"),
  networkType: varchar("network_type", { length: 50 }).notNull(),
  status: gatewayStatusEnum("status").default('enabled').notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Withdrawal Gateways table (Manual withdrawal methods created by admin)
export const withdrawalGateways = pgTable("withdrawal_gateways", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  minAmount: decimal("min_amount", { precision: 18, scale: 8 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 18, scale: 8 }).notNull(),
  charges: decimal("charges", { precision: 10, scale: 2 }).notNull(),
  chargesType: varchar("charges_type", { length: 20 }).default('percentage').notNull(),
  imageUrl: text("image_url"),
  networkType: varchar("network_type", { length: 50 }).notNull(),
  status: gatewayStatusEnum("status").default('enabled').notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// KYC Verification table
export const kycVerifications = pgTable("kyc_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  dateOfBirth: varchar("date_of_birth", { length: 50 }),
  country: varchar("country", { length: 100 }),
  documentType: varchar("document_type", { length: 50 }),
  documentNumber: varchar("document_number", { length: 100 }),
  documentFront: text("document_front"),
  documentBack: text("document_back"),
  selfieImage: text("selfie_image"),
  status: ticketStatusEnum("status").default('pending').notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedBy: integer("reviewed_by").references(() => admins.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  swaps: many(swaps),
  investments: many(userInvestments),
  bots: many(userBots),
  wallets: many(connectedWallets),
  addresses: many(cryptoAddresses),
  portfolio: many(portfolios),
  balance: one(userBalances),
  tickets: many(supportTickets),
  emails: many(userEmails),
  kyc: one(kycVerifications),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  transaction: one(transactions, {
    fields: [deposits.transactionId],
    references: [transactions.id],
  }),
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
  approver: one(admins, {
    fields: [deposits.approvedBy],
    references: [admins.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  transaction: one(transactions, {
    fields: [withdrawals.transactionId],
    references: [transactions.id],
  }),
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
  wallet: one(connectedWallets, {
    fields: [withdrawals.walletId],
    references: [connectedWallets.id],
  }),
  approver: one(admins, {
    fields: [withdrawals.approvedBy],
    references: [admins.id],
  }),
}));

export const userInvestmentsRelations = relations(userInvestments, ({ one }) => ({
  user: one(users, {
    fields: [userInvestments.userId],
    references: [users.id],
  }),
  plan: one(investmentPlans, {
    fields: [userInvestments.planId],
    references: [investmentPlans.id],
  }),
}));

export const userBotsRelations = relations(userBots, ({ one }) => ({
  user: one(users, {
    fields: [userBots.userId],
    references: [users.id],
  }),
  bot: one(aiBots, {
    fields: [userBots.botId],
    references: [aiBots.id],
  }),
}));

// Insert and Select Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, joinedAt: true });
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true, createdAt: true });
export const insertCryptoAssetSchema = createInsertSchema(cryptoAssets).omit({ id: true, updatedAt: true });
export const insertForexAssetSchema = createInsertSchema(forexAssets).omit({ id: true, updatedAt: true });
export const insertStockAssetSchema = createInsertSchema(stockAssets).omit({ id: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepositSchema = createInsertSchema(deposits).omit({ id: true, createdAt: true, approvedAt: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ id: true, createdAt: true, approvedAt: true });
export const insertSwapSchema = createInsertSchema(swaps).omit({ id: true, createdAt: true });
export const insertInvestmentPlanSchema = createInsertSchema(investmentPlans).omit({ id: true, createdAt: true });
export const insertUserInvestmentSchema = createInsertSchema(userInvestments).omit({ id: true, createdAt: true });
export const insertAiBotSchema = createInsertSchema(aiBots).omit({ id: true, createdAt: true });
export const insertUserBotSchema = createInsertSchema(userBots).omit({ id: true, createdAt: true });
export const insertLinkedWalletTypeSchema = createInsertSchema(linkedWalletTypes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConnectedWalletSchema = createInsertSchema(connectedWallets).omit({ id: true, connectedAt: true });
export const insertCryptoAddressSchema = createInsertSchema(cryptoAddresses).omit({ id: true, createdAt: true });
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true, updatedAt: true });
export const insertUserBalanceSchema = createInsertSchema(userBalances).omit({ updatedAt: true });
export const insertSupportTicketCategorySchema = createInsertSchema(supportTicketCategories).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export const insertUserEmailSchema = createInsertSchema(userEmails).omit({ id: true, linkedAt: true });
export const insertKycVerificationSchema = createInsertSchema(kycVerifications).omit({ id: true, submittedAt: true, reviewedAt: true });
export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWithdrawalGatewaySchema = createInsertSchema(withdrawalGateways).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type CryptoAsset = typeof cryptoAssets.$inferSelect;
export type InsertForexAsset = z.infer<typeof insertForexAssetSchema>;
export type ForexAsset = typeof forexAssets.$inferSelect;
export type InsertStockAsset = z.infer<typeof insertStockAssetSchema>;
export type StockAsset = typeof stockAssets.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertInvestmentPlan = z.infer<typeof insertInvestmentPlanSchema>;
export type InvestmentPlan = typeof investmentPlans.$inferSelect;
export type InsertUserInvestment = z.infer<typeof insertUserInvestmentSchema>;
export type UserInvestment = typeof userInvestments.$inferSelect;
export type InsertAiBot = z.infer<typeof insertAiBotSchema>;
export type AiBot = typeof aiBots.$inferSelect;
export type InsertUserBot = z.infer<typeof insertUserBotSchema>;
export type UserBot = typeof userBots.$inferSelect;
export type InsertLinkedWalletType = z.infer<typeof insertLinkedWalletTypeSchema>;
export type LinkedWalletType = typeof linkedWalletTypes.$inferSelect;
export type InsertConnectedWallet = z.infer<typeof insertConnectedWalletSchema>;
export type ConnectedWallet = typeof connectedWallets.$inferSelect;
export type InsertCryptoAddress = z.infer<typeof insertCryptoAddressSchema>;
export type CryptoAddress = typeof cryptoAddresses.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;
export type UserBalance = typeof userBalances.$inferSelect;
export type InsertSupportTicketCategory = z.infer<typeof insertSupportTicketCategorySchema>;
export type SupportTicketCategory = typeof supportTicketCategories.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertUserEmail = z.infer<typeof insertUserEmailSchema>;
export type UserEmail = typeof userEmails.$inferSelect;
export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertWithdrawalGateway = z.infer<typeof insertWithdrawalGatewaySchema>;
export type WithdrawalGateway = typeof withdrawalGateways.$inferSelect;
