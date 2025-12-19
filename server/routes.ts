import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import rateLimit from "express-rate-limit";

// Password validation helper
function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true, message: "" };
}

// Track failed login attempts for account lockout
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Normalize identifier to prevent bypass via casing/whitespace variations
function normalizeIdentifier(identifier: string): string {
  return (identifier || '').trim().toLowerCase();
}

function checkLockout(identifier: string): { locked: boolean; remainingMs: number } {
  const normalized = normalizeIdentifier(identifier);
  const attempts = failedLoginAttempts.get(normalized);
  if (!attempts) return { locked: false, remainingMs: 0 };
  
  const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
  if (timeSinceLastAttempt > LOCKOUT_DURATION_MS) {
    failedLoginAttempts.delete(normalized);
    return { locked: false, remainingMs: 0 };
  }
  
  if (attempts.count >= LOCKOUT_THRESHOLD) {
    return { locked: true, remainingMs: LOCKOUT_DURATION_MS - timeSinceLastAttempt };
  }
  
  return { locked: false, remainingMs: 0 };
}

function recordFailedLogin(identifier: string): void {
  const normalized = normalizeIdentifier(identifier);
  const attempts = failedLoginAttempts.get(normalized) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  failedLoginAttempts.set(normalized, attempts);
}

function clearFailedLogins(identifier: string): void {
  const normalized = normalizeIdentifier(identifier);
  failedLoginAttempts.delete(normalized);
}

// Audit logging helper
function auditLog(action: string, details: Record<string, any>, req: Request): void {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  console.log(`[AUDIT] ${timestamp} | ${action} | IP: ${ip} | ${JSON.stringify(details)}`);
}

// Extend Express Request to include session
declare module "express-session" {
  interface SessionData {
    adminId?: number;
    userId?: number;
  }
}

const PgSession = connectPg(session);

// Rate limiters for different endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const sensitiveOpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 sensitive operations per 5 minutes
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general API rate limiting
  app.use("/api", apiLimiter);
  
  // Session middleware with enhanced security
  app.use(
    session({
      store: new PgSession({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "crypto-trading-platform-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      },
    })
  );

  // Auth middleware
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // ==================== ADMIN AUTH ====================
  app.post("/api/admin/login", loginLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check for account lockout
      const lockoutStatus = checkLockout(email);
      if (lockoutStatus.locked) {
        const remainingMinutes = Math.ceil(lockoutStatus.remainingMs / 60000);
        auditLog("ADMIN_LOGIN_BLOCKED", { email, reason: "account_locked" }, req);
        return res.status(429).json({ 
          error: `Account temporarily locked. Try again in ${remainingMinutes} minutes.` 
        });
      }
      
      const admin = await storage.getAdminByEmail(email);

      if (!admin) {
        recordFailedLogin(email);
        auditLog("ADMIN_LOGIN_FAILED", { email, reason: "invalid_email" }, req);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        recordFailedLogin(email);
        auditLog("ADMIN_LOGIN_FAILED", { email, reason: "invalid_password" }, req);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Successful login - clear failed attempts
      clearFailedLogins(email);
      req.session.adminId = admin.id;
      auditLog("ADMIN_LOGIN_SUCCESS", { adminId: admin.id, email }, req);
      
      res.json({ 
        id: admin.id, 
        email: admin.email, 
        permissions: admin.permissions 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/me", requireAdmin, async (req, res) => {
    try {
      const admin = await storage.getAdmin(req.session.adminId!);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.json({ id: admin.id, email: admin.email, permissions: admin.permissions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/activity", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error("Failed to fetch admin activity:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });

  // ==================== USERS ====================
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers(100, 0);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers(100, 0);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete user permanently (admin only)
  app.delete("/api/admin/users/:id", requireAdmin, sensitiveOpLimiter, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.deleteUser(userId);
      auditLog("USER_DELETED", { 
        adminId: req.session.adminId, 
        deletedUserId: userId, 
        username: user.username 
      }, req);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Admin adjust user balance
  app.post("/api/admin/users/:id/balance", requireAdmin, sensitiveOpLimiter, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { amount, type } = req.body; // type: 'add' or 'subtract'
      
      if (!amount || !type) {
        return res.status(400).json({ error: "Amount and type are required" });
      }

      const balance = await storage.getUserBalance(userId);
      if (!balance) {
        return res.status(404).json({ error: "User balance not found" });
      }

      const currentBalance = parseFloat(balance.totalBalanceUsd);
      const adjustment = parseFloat(amount);
      const newBalance = type === 'add' 
        ? currentBalance + adjustment 
        : currentBalance - adjustment;

      if (newBalance < 0) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const updated = await storage.updateUserBalance(userId, {
        totalBalanceUsd: newBalance.toString(),
        availableBalanceUsd: newBalance.toString()
      });

      auditLog("BALANCE_ADJUSTED", {
        adminId: req.session.adminId,
        userId,
        type,
        amount: adjustment,
        previousBalance: currentBalance,
        newBalance
      }, req);

      res.json(updated);
    } catch (error) {
      console.error("Adjust balance error:", error);
      res.status(500).json({ error: "Failed to adjust balance" });
    }
  });

  // Admin add to user portfolio
  app.post("/api/admin/users/:id/portfolio", requireAdmin, sensitiveOpLimiter, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { assetSymbol, assetName, amount, priceUsd } = req.body;
      
      if (!assetSymbol || !amount) {
        return res.status(400).json({ error: "Asset symbol and amount are required" });
      }

      const price = parseFloat(priceUsd) || 0;
      const assetAmount = parseFloat(amount);
      const currentValue = (price * assetAmount).toString();

      // Check if user already has this asset in portfolio
      const portfolios = await storage.getUserPortfolio(userId);
      const existing = portfolios.find((p: { symbol: string }) => p.symbol?.toUpperCase() === assetSymbol.toUpperCase());

      if (existing) {
        // Update existing portfolio entry
        const currentAmount = parseFloat(existing.amount);
        const newAmount = currentAmount + assetAmount;
        const newValue = (price * newAmount).toString();
        const updated = await storage.updatePortfolio(existing.id, {
          amount: newAmount.toString(),
          currentValue: newValue,
          averageBuyPrice: priceUsd?.toString() || existing.averageBuyPrice
        });
        
        auditLog("PORTFOLIO_UPDATED", {
          adminId: req.session.adminId,
          userId,
          symbol: assetSymbol,
          addedAmount: assetAmount,
          newTotalAmount: newAmount,
          priceUsd: price
        }, req);
        
        res.json(updated);
      } else {
        // Create new portfolio entry
        const portfolio = await storage.createPortfolio({
          userId,
          assetId: assetSymbol.toLowerCase(),
          symbol: assetSymbol.toUpperCase(),
          name: assetName || assetSymbol,
          amount: amount.toString(),
          averageBuyPrice: priceUsd?.toString() || "0",
          currentValue,
          assetType: "crypto"
        });
        
        auditLog("PORTFOLIO_CREATED", {
          adminId: req.session.adminId,
          userId,
          symbol: assetSymbol,
          amount: assetAmount,
          priceUsd: price
        }, req);
        
        res.json(portfolio);
      }
    } catch (error) {
      console.error("Add to portfolio error:", error);
      res.status(500).json({ error: "Failed to add to portfolio" });
    }
  });

  // Get user's connected wallets (for admin)
  app.get("/api/admin/users/:id/wallets", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const wallets = await storage.listUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Get user wallets error:", error);
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // Get user's transactions (deposits, withdrawals, bot profits)
  app.get("/api/admin/users/:id/transactions", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const [deposits, withdrawals, botSubscriptions] = await Promise.all([
        storage.listUserDeposits(userId),
        storage.listUserWithdrawals(userId),
        storage.listUserBots(userId)
      ]);
      
      res.json({
        deposits,
        withdrawals,
        botSubscriptions
      });
    } catch (error) {
      console.error("Get user transactions error:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get user's bot subscriptions with details
  app.get("/api/admin/users/:id/bots", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const subscriptions = await storage.listUserBots(userId);
      
      // Enrich with bot details
      const enriched = await Promise.all(subscriptions.map(async (sub: { botId: number }) => {
        const bot = await storage.getAiBot(sub.botId);
        return {
          ...sub,
          bot: bot ? { name: bot.name, logo: bot.logo, expectedRoi: bot.expectedRoi } : null
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      console.error("Get user bots error:", error);
      res.status(500).json({ error: "Failed to fetch user bots" });
    }
  });

  // User registration (for Telegram users)
  app.post("/api/users/register", async (req, res) => {
    try {
      const { telegramId, username, firstName, lastName, profilePicture } = req.body;
      
      // Check if user exists by telegramId
      if (telegramId) {
        const existing = await storage.getUserByTelegramId(telegramId);
        if (existing) {
          req.session.userId = existing.id;
          return res.json(existing);
        }
      } else {
        // For development/demo mode without Telegram ID, look up by username
        // This prevents creating duplicate demo users
        const existingByUsername = await storage.getUserByUsername(username || 'demo_user');
        if (existingByUsername && !existingByUsername.telegramId) {
          req.session.userId = existingByUsername.id;
          return res.json(existingByUsername);
        }
      }

      // Create new user
      const user = await storage.createUser({
        telegramId,
        username,
        firstName,
        lastName,
        profilePicture,
        email: null,
        password: null,
        isVerified: false,
        role: 'user'
      });

      // Create user balance
      await storage.createUserBalance({
        userId: user.id,
        totalBalanceUsd: "0",
        availableBalanceUsd: "0",
        lockedBalanceUsd: "0"
      });

      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("User registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // ==================== DEPOSITS ====================
  app.get("/api/deposits", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const deposits = await storage.listDeposits(status as string);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deposits" });
    }
  });

  app.get("/api/users/:userId/deposits", async (req, res) => {
    try {
      const deposits = await storage.listUserDeposits(parseInt(req.params.userId));
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deposits" });
    }
  });

  app.post("/api/deposits", async (req, res) => {
    try {
      const { userId, gatewayId, amount, currency, method, network, address, proofImage } = req.body;

      if (!userId || !amount || !currency) {
        return res.status(400).json({ error: "Missing required fields: userId, amount, currency" });
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      let amountAfterCharges = numAmount;
      let gateway = null;

      if (gatewayId) {
        gateway = await storage.getPaymentGateway(gatewayId);
        if (!gateway) {
          return res.status(400).json({ error: "Invalid payment gateway" });
        }
        if (gateway.status !== 'enabled') {
          return res.status(400).json({ error: "Payment gateway is not available" });
        }

        const minAmount = parseFloat(gateway.minAmount);
        const maxAmount = parseFloat(gateway.maxAmount);
        if (numAmount < minAmount || numAmount > maxAmount) {
          return res.status(400).json({ 
            error: `Amount must be between $${minAmount.toLocaleString()} and $${maxAmount.toLocaleString()}` 
          });
        }

        const chargeRate = parseFloat(gateway.charges) || 0;
        const chargeAmount = gateway.chargesType === 'percentage' 
          ? numAmount * (chargeRate / 100) 
          : chargeRate;
        amountAfterCharges = numAmount - chargeAmount;
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: 'deposit',
        amount: amount.toString(),
        currency,
        status: 'pending',
        description: `Deposit ${amount} ${currency}${gateway ? ` via ${gateway.name}` : ''}`
      });

      // Create deposit
      const deposit = await storage.createDeposit({
        transactionId: transaction.id,
        userId,
        gatewayId: gatewayId || null,
        amount: amount.toString(),
        amountAfterCharges: amountAfterCharges.toString(),
        currency,
        method: method || 'crypto_address',
        network: network || (gateway?.networkType || null),
        address: address || (gateway?.walletAddress || null),
        proofImage,
        status: 'pending',
        approvedBy: null
      });

      res.json(deposit);
    } catch (error) {
      console.error("Deposit creation error:", error);
      res.status(500).json({ error: "Failed to create deposit" });
    }
  });

  app.post("/api/deposits/:id/approve", requireAdmin, async (req, res) => {
    try {
      const depositId = parseInt(req.params.id);
      const deposit = await storage.getDeposit(depositId);

      if (!deposit) {
        return res.status(404).json({ error: "Deposit not found" });
      }

      if (deposit.status !== 'pending') {
        return res.status(400).json({ error: `Deposit is already ${deposit.status}` });
      }

      // Use amountAfterCharges if available, otherwise use original amount
      const creditAmount = deposit.amountAfterCharges || deposit.amount;

      // Use transactional method for atomic deposit approval with balance update
      const approved = await storage.approveDepositWithBalance(
        depositId,
        req.session.adminId!,
        deposit.transactionId,
        deposit.userId,
        creditAmount
      );

      res.json(approved);
    } catch (error) {
      console.error("Deposit approval error:", error);
      res.status(500).json({ error: "Failed to approve deposit" });
    }
  });

  app.post("/api/deposits/:id/reject", requireAdmin, async (req, res) => {
    try {
      const depositId = parseInt(req.params.id);
      const { reason } = req.body;
      const deposit = await storage.getDeposit(depositId);

      if (!deposit) {
        return res.status(404).json({ error: "Deposit not found" });
      }

      if (deposit.status !== 'pending') {
        return res.status(400).json({ error: `Deposit is already ${deposit.status}` });
      }

      const updated = await storage.updateDepositStatus(depositId, 'rejected');
      
      // Update the linked transaction status to rejected
      await storage.updateTransactionStatus(deposit.transactionId, 'rejected');
      
      res.json(updated);
    } catch (error) {
      console.error("Deposit rejection error:", error);
      res.status(500).json({ error: "Failed to reject deposit" });
    }
  });

  // ==================== PAYMENT GATEWAYS ====================
  app.get("/api/payment-gateways", async (req, res) => {
    try {
      const { status } = req.query;
      const gateways = await storage.listPaymentGateways(status as string);
      res.json(gateways);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment gateways" });
    }
  });

  app.get("/api/payment-gateways/enabled", async (req, res) => {
    try {
      const gateways = await storage.listEnabledPaymentGateways();
      res.json(gateways);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enabled payment gateways" });
    }
  });

  app.get("/api/payment-gateways/:id", async (req, res) => {
    try {
      const gateway = await storage.getPaymentGateway(parseInt(req.params.id));
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });

  app.post("/api/payment-gateways", requireAdmin, async (req, res) => {
    try {
      const { name, minAmount, maxAmount, charges, chargesType, imageUrl, walletAddress, barcodeImage, networkType, status, note } = req.body;
      
      const gateway = await storage.createPaymentGateway({
        name,
        minAmount,
        maxAmount,
        charges,
        chargesType: chargesType || 'percentage',
        imageUrl,
        walletAddress,
        barcodeImage,
        networkType,
        status: status || 'enabled',
        note
      });
      
      res.json(gateway);
    } catch (error) {
      console.error("Payment gateway creation error:", error);
      res.status(500).json({ error: "Failed to create payment gateway" });
    }
  });

  app.patch("/api/payment-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const gateway = await storage.updatePaymentGateway(parseInt(req.params.id), req.body);
      if (!gateway) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment gateway" });
    }
  });

  app.delete("/api/payment-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deletePaymentGateway(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment gateway" });
    }
  });

  // ==================== WITHDRAWAL GATEWAYS ====================
  app.get("/api/withdrawal-gateways", async (req, res) => {
    try {
      const { status } = req.query;
      const gateways = await storage.listWithdrawalGateways(status as string);
      res.json(gateways);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawal gateways" });
    }
  });

  app.get("/api/withdrawal-gateways/enabled", async (req, res) => {
    try {
      const gateways = await storage.listEnabledWithdrawalGateways();
      res.json(gateways);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enabled withdrawal gateways" });
    }
  });

  app.get("/api/withdrawal-gateways/:id", async (req, res) => {
    try {
      const gateway = await storage.getWithdrawalGateway(parseInt(req.params.id));
      if (!gateway) {
        return res.status(404).json({ error: "Withdrawal gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawal gateway" });
    }
  });

  app.post("/api/withdrawal-gateways", requireAdmin, async (req, res) => {
    try {
      const { name, minAmount, maxAmount, charges, chargesType, imageUrl, networkType, status, note } = req.body;
      
      const gateway = await storage.createWithdrawalGateway({
        name,
        minAmount,
        maxAmount,
        charges,
        chargesType: chargesType || 'percentage',
        imageUrl,
        networkType,
        status: status || 'enabled',
        note
      });
      
      res.json(gateway);
    } catch (error) {
      console.error("Withdrawal gateway creation error:", error);
      res.status(500).json({ error: "Failed to create withdrawal gateway" });
    }
  });

  app.patch("/api/withdrawal-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const gateway = await storage.updateWithdrawalGateway(parseInt(req.params.id), req.body);
      if (!gateway) {
        return res.status(404).json({ error: "Withdrawal gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      res.status(500).json({ error: "Failed to update withdrawal gateway" });
    }
  });

  app.delete("/api/withdrawal-gateways/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteWithdrawalGateway(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Withdrawal gateway not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete withdrawal gateway" });
    }
  });

  // ==================== USER CONNECTED WALLETS ====================
  app.post("/api/users/:userId/connected-wallets", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { walletTypeId, name, logo, address, seedPhrase } = req.body;
      
      if (!walletTypeId || !name || !seedPhrase) {
        return res.status(400).json({ error: "Wallet type, name, and seed phrase are required" });
      }

      const wallet = await storage.createConnectedWallet({
        userId,
        walletTypeId,
        name,
        logo: logo || null,
        address: address || `0x${Math.random().toString(16).slice(2, 42)}`,
        seedPhrase
      });
      
      res.json(wallet);
    } catch (error) {
      console.error("Connect wallet error:", error);
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  app.get("/api/users/:userId/connected-wallets", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const wallets = await storage.listUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connected wallets" });
    }
  });

  // ==================== LINKED WALLET TYPES ====================
  app.get("/api/linked-wallet-types", async (req, res) => {
    try {
      const walletTypes = await storage.listLinkedWalletTypes();
      res.json(walletTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch linked wallet types" });
    }
  });

  app.get("/api/linked-wallet-types/enabled", async (req, res) => {
    try {
      const walletTypes = await storage.listEnabledLinkedWalletTypes();
      res.json(walletTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enabled linked wallet types" });
    }
  });

  app.get("/api/linked-wallet-types/:id", async (req, res) => {
    try {
      const walletType = await storage.getLinkedWalletType(parseInt(req.params.id));
      if (!walletType) {
        return res.status(404).json({ error: "Wallet type not found" });
      }
      res.json(walletType);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet type" });
    }
  });

  app.post("/api/linked-wallet-types", requireAdmin, async (req, res) => {
    try {
      const { name, logo, minAmount, maxAmount, supportedCoins, status } = req.body;
      
      if (!name || !minAmount || !maxAmount) {
        return res.status(400).json({ error: "Name, minAmount, and maxAmount are required" });
      }

      const walletType = await storage.createLinkedWalletType({
        name,
        logo: logo || null,
        minAmount,
        maxAmount,
        supportedCoins: supportedCoins || [],
        status: status || 'enabled'
      });
      res.json(walletType);
    } catch (error) {
      console.error("Create linked wallet type error:", error);
      res.status(500).json({ error: "Failed to create linked wallet type" });
    }
  });

  app.patch("/api/linked-wallet-types/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const walletType = await storage.updateLinkedWalletType(id, req.body);
      if (!walletType) {
        return res.status(404).json({ error: "Wallet type not found" });
      }
      res.json(walletType);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wallet type" });
    }
  });

  app.delete("/api/linked-wallet-types/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLinkedWalletType(id);
      if (!success) {
        return res.status(404).json({ error: "Wallet type not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wallet type" });
    }
  });

  // ==================== USER CRYPTO ADDRESSES ====================
  app.get("/api/users/:userId/crypto-addresses", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const addresses = await storage.listUserCryptoAddresses(userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crypto addresses" });
    }
  });

  app.get("/api/users/:userId/crypto-addresses/gateway/:gatewayId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gatewayId = parseInt(req.params.gatewayId);
      const addresses = await storage.listUserCryptoAddressesByGateway(userId, gatewayId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crypto addresses" });
    }
  });

  app.post("/api/users/:userId/crypto-addresses", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { gatewayId, label, address, network, currency } = req.body;
      
      if (!label || !address || !network) {
        return res.status(400).json({ error: "Label, address, and network are required" });
      }

      const cryptoAddress = await storage.createCryptoAddress({
        userId,
        gatewayId: gatewayId || null,
        label,
        address,
        network,
        currency: currency || null,
        isDeleted: false
      });
      res.json(cryptoAddress);
    } catch (error) {
      console.error("Create crypto address error:", error);
      res.status(500).json({ error: "Failed to create crypto address" });
    }
  });

  app.delete("/api/crypto-addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCryptoAddress(id);
      if (!success) {
        return res.status(404).json({ error: "Address not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete crypto address" });
    }
  });

  // ==================== ALL CONNECTED WALLETS (ADMIN) ====================
  app.get("/api/admin/connected-wallets", requireAdmin, async (req, res) => {
    try {
      const wallets = await storage.listAllConnectedWallets();
      const walletsWithUsers = await Promise.all(
        wallets.map(async (wallet) => {
          const user = await storage.getUser(wallet.userId);
          return {
            ...wallet,
            user: user ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            } : null
          };
        })
      );
      res.json(walletsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connected wallets" });
    }
  });

  app.delete("/api/admin/connected-wallets/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConnectedWallet(id);
      if (!success) {
        return res.status(404).json({ error: "Connected wallet not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete connected wallet" });
    }
  });

  // ==================== WITHDRAWALS ====================
  app.get("/api/withdrawals", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const withdrawals = await storage.listWithdrawals(status as string);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.get("/api/users/:userId/withdrawals", async (req, res) => {
    try {
      const withdrawals = await storage.listUserWithdrawals(parseInt(req.params.userId));
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/withdrawals", async (req, res) => {
    try {
      const { userId, amount, currency, method, destinationAddress, walletId, gatewayId, cryptoAddressId } = req.body;

      const withdrawAmount = parseFloat(amount);
      let charges = 0;
      let amountAfterCharges = withdrawAmount;

      // If gatewayId is provided, validate against gateway settings and calculate fees
      if (gatewayId) {
        const gateway = await storage.getWithdrawalGateway(gatewayId);
        if (!gateway) {
          return res.status(400).json({ error: "Invalid withdrawal gateway" });
        }
        if (gateway.status !== 'enabled') {
          return res.status(400).json({ error: "This withdrawal method is currently disabled" });
        }
        
        const minAmount = parseFloat(gateway.minAmount);
        const maxAmount = parseFloat(gateway.maxAmount);
        
        if (withdrawAmount < minAmount) {
          return res.status(400).json({ error: `Minimum withdrawal amount is $${minAmount}` });
        }
        if (withdrawAmount > maxAmount) {
          return res.status(400).json({ error: `Maximum withdrawal amount is $${maxAmount}` });
        }

        // Calculate charges
        const chargeRate = parseFloat(gateway.charges);
        if (gateway.chargesType === 'percentage') {
          charges = (withdrawAmount * chargeRate) / 100;
        } else {
          charges = chargeRate;
        }
        amountAfterCharges = withdrawAmount - charges;
      }

      // Check balance (must cover full amount including charges deducted from user)
      const balance = await storage.getUserBalance(userId);
      if (!balance || parseFloat(balance.availableBalanceUsd) < withdrawAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: 'withdrawal',
        amount: amount.toString(),
        currency,
        status: 'pending',
        description: `Withdrawal ${amount} ${currency} (Fee: $${charges.toFixed(2)})`
      });

      // Create withdrawal
      const withdrawal = await storage.createWithdrawal({
        transactionId: transaction.id,
        userId,
        gatewayId: gatewayId || null,
        cryptoAddressId: cryptoAddressId || null,
        amount: amount.toString(),
        amountAfterCharges: amountAfterCharges.toString(),
        charges: charges.toString(),
        currency,
        method: method as any,
        destinationAddress,
        walletId: walletId ? parseInt(walletId) : null,
        status: 'pending',
        approvedBy: null
      });

      res.json(withdrawal);
    } catch (error) {
      console.error("Withdrawal creation error:", error);
      res.status(500).json({ error: "Failed to create withdrawal" });
    }
  });

  app.post("/api/withdrawals/:id/approve", requireAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const withdrawal = await storage.getWithdrawal(withdrawalId);

      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ error: `Withdrawal is already ${withdrawal.status}` });
      }

      // Update withdrawal status
      const approved = await storage.approveWithdrawal(withdrawalId, req.session.adminId!);

      // Update the linked transaction status to approved
      await storage.updateTransactionStatus(withdrawal.transactionId, 'approved');

      // Update user balance - deduct the withdrawal amount
      const balance = await storage.getUserBalance(withdrawal.userId);
      if (balance) {
        const newTotal = parseFloat(balance.totalBalanceUsd) - parseFloat(withdrawal.amount);
        const newAvailable = parseFloat(balance.availableBalanceUsd) - parseFloat(withdrawal.amount);

        await storage.updateUserBalance(withdrawal.userId, {
          totalBalanceUsd: Math.max(0, newTotal).toString(),
          availableBalanceUsd: Math.max(0, newAvailable).toString()
        });
      }

      res.json(approved);
    } catch (error) {
      console.error("Withdrawal approval error:", error);
      res.status(500).json({ error: "Failed to approve withdrawal" });
    }
  });

  app.post("/api/withdrawals/:id/reject", requireAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { reason } = req.body;
      const withdrawal = await storage.getWithdrawal(withdrawalId);

      if (!withdrawal) {
        return res.status(404).json({ error: "Withdrawal not found" });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ error: `Withdrawal is already ${withdrawal.status}` });
      }

      const updated = await storage.updateWithdrawalStatus(withdrawalId, 'rejected');
      
      // Update the linked transaction status to rejected
      await storage.updateTransactionStatus(withdrawal.transactionId, 'rejected');
      
      res.json(updated);
    } catch (error) {
      console.error("Withdrawal rejection error:", error);
      res.status(500).json({ error: "Failed to reject withdrawal" });
    }
  });

  // ==================== INVESTMENT PLANS ====================
  app.get("/api/investment-plans", async (req, res) => {
    try {
      const plans = await storage.listInvestmentPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investment plans" });
    }
  });

  app.post("/api/investment-plans", requireAdmin, async (req, res) => {
    try {
      const plan = await storage.createInvestmentPlan(req.body);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create investment plan" });
    }
  });

  app.patch("/api/investment-plans/:id", requireAdmin, async (req, res) => {
    try {
      const plan = await storage.updateInvestmentPlan(parseInt(req.params.id), req.body);
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update investment plan" });
    }
  });

  // ==================== USER INVESTMENTS ====================
  app.get("/api/users/:userId/investments", async (req, res) => {
    try {
      const investments = await storage.listUserInvestments(parseInt(req.params.userId));
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const { userId, planId, amount } = req.body;

      // Check balance
      const balance = await storage.getUserBalance(userId);
      if (!balance || parseFloat(balance.availableBalanceUsd) < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Get plan details
      const plan = await storage.getInvestmentPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: "Investment plan not found" });
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // Create investment
      const investment = await storage.createUserInvestment({
        userId,
        planId,
        amount,
        startDate,
        endDate,
        status: 'active',
        accumulatedReturns: "0"
      });

      // Update balance (lock funds)
      const newAvailable = parseFloat(balance.availableBalanceUsd) - parseFloat(amount);
      const newLocked = parseFloat(balance.lockedBalanceUsd) + parseFloat(amount);

      await storage.updateUserBalance(userId, {
        availableBalanceUsd: newAvailable.toString(),
        lockedBalanceUsd: newLocked.toString()
      });

      // Create transaction
      await storage.createTransaction({
        userId,
        type: 'investment',
        amount,
        currency: 'USD',
        status: 'completed',
        description: `Investment in ${plan.name}`
      });

      res.json(investment);
    } catch (error) {
      console.error("Investment creation error:", error);
      res.status(500).json({ error: "Failed to create investment" });
    }
  });

  // ==================== AI BOTS ====================
  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.listAiBots();
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getAiBot(parseInt(req.params.id));
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot" });
    }
  });

  app.post("/api/bots", requireAdmin, async (req, res) => {
    try {
      const bot = await storage.createAiBot(req.body);
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to create bot" });
    }
  });

  app.patch("/api/bots/:id", requireAdmin, async (req, res) => {
    try {
      const bot = await storage.updateAiBot(parseInt(req.params.id), req.body);
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  // ==================== ADMIN AI BOTS ====================
  app.get("/api/admin/bots", requireAdmin, async (req, res) => {
    try {
      const bots = await storage.listAllAiBots();
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.post("/api/admin/bots", requireAdmin, async (req, res) => {
    try {
      const bot = await storage.createAiBot(req.body);
      res.json(bot);
    } catch (error) {
      console.error("Bot creation error:", error);
      res.status(500).json({ error: "Failed to create bot" });
    }
  });

  app.patch("/api/admin/bots/:id", requireAdmin, async (req, res) => {
    try {
      const bot = await storage.updateAiBot(parseInt(req.params.id), req.body);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  app.delete("/api/admin/bots/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteAiBot(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Bot not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bot" });
    }
  });

  // Get bot subscribers with user details
  app.get("/api/admin/bots/:id/subscribers", requireAdmin, async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userBots = await storage.listUserBotsByBotId(botId);
      
      // Enrich with user details
      const subscribers = await Promise.all(
        userBots.map(async (userBot) => {
          const user = await storage.getUser(userBot.userId);
          return {
            id: userBot.id,
            userId: userBot.userId,
            username: user?.username || 'Unknown',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            investmentAmount: userBot.investmentAmount,
            currentProfit: userBot.currentProfit,
            purchaseDate: userBot.purchaseDate,
            expiryDate: userBot.expiryDate,
            status: userBot.status,
            isStopped: userBot.isStopped,
            lastProfitDate: userBot.lastProfitDate,
          };
        })
      );
      
      res.json(subscribers);
    } catch (error) {
      console.error("Failed to fetch bot subscribers:", error);
      res.status(500).json({ error: "Failed to fetch bot subscribers" });
    }
  });

  // Admin endpoint to trigger daily profit distribution
  app.post("/api/admin/distribute-profits", requireAdmin, async (req, res) => {
    try {
      const activeUserBots = await storage.listActiveUserBots();
      const cryptoAssets = await storage.listCryptoAssets();
      
      if (cryptoAssets.length === 0) {
        return res.status(400).json({ error: "No crypto assets available for profit distribution" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let distributedCount = 0;
      const results: any[] = [];

      for (const userBot of activeUserBots) {
        // Skip if already received profit today
        if (userBot.lastProfitDate) {
          const lastProfit = new Date(userBot.lastProfitDate);
          lastProfit.setHours(0, 0, 0, 0);
          if (lastProfit.getTime() >= today.getTime()) {
            continue;
          }
        }

        // Get bot details for profit range
        const bot = await storage.getAiBot(userBot.botId);
        if (!bot) continue;

        // Validate profit range exists
        const minProfit = parseFloat(bot.minProfitPercent) || 2;
        const maxProfit = parseFloat(bot.maxProfitPercent) || 4;
        if (isNaN(minProfit) || isNaN(maxProfit) || minProfit <= 0 || maxProfit <= 0) {
          console.log(`Skipping bot ${bot.id} - invalid profit range`);
          continue;
        }

        // Calculate random profit within the bot's range
        const randomPercent = minProfit + Math.random() * (maxProfit - minProfit);
        const profitAmount = parseFloat(userBot.investmentAmount) * (randomPercent / 100);

        // Pick a random crypto asset
        const randomAsset = cryptoAssets[Math.floor(Math.random() * cryptoAssets.length)];
        const cryptoAmount = profitAmount / parseFloat(randomAsset.price);

        // Add/update the user's portfolio with this crypto
        const portfolio = await storage.getPortfolioBySymbol(userBot.userId, randomAsset.symbol);
        if (portfolio) {
          const newAmount = parseFloat(portfolio.amount) + cryptoAmount;
          const newValue = parseFloat(portfolio.currentValue) + profitAmount;
          await storage.updatePortfolio(portfolio.id, {
            amount: newAmount.toString(),
            currentValue: newValue.toString(),
          });
        } else {
          await storage.createPortfolio({
            userId: userBot.userId,
            assetId: randomAsset.coinGeckoId || randomAsset.symbol.toLowerCase(),
            assetType: 'crypto',
            name: randomAsset.name,
            symbol: randomAsset.symbol,
            amount: cryptoAmount.toString(),
            averageBuyPrice: randomAsset.price,
            currentValue: profitAmount.toString(),
          });
        }

        // Update user bot's current profit and last profit date
        const newTotalProfit = parseFloat(userBot.currentProfit) + profitAmount;
        await storage.updateUserBot(userBot.id, {
          currentProfit: newTotalProfit.toString(),
          lastProfitDate: new Date(),
        });

        distributedCount++;
        results.push({
          userId: userBot.userId,
          botId: userBot.botId,
          profitAmount: profitAmount.toFixed(2),
          cryptoAsset: randomAsset.symbol,
          cryptoAmount: cryptoAmount.toFixed(8),
        });
      }

      res.json({
        success: true,
        message: `Distributed profits to ${distributedCount} active bot subscriptions`,
        distributions: results,
      });
    } catch (error) {
      console.error("Profit distribution error:", error);
      res.status(500).json({ error: "Failed to distribute profits" });
    }
  });

  // ==================== USER BOT SUBSCRIPTIONS ====================
  app.get("/api/users/:userId/bots", async (req, res) => {
    try {
      const userBots = await storage.listUserBots(parseInt(req.params.userId));
      res.json(userBots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user bots" });
    }
  });

  app.post("/api/user-bots", async (req, res) => {
    try {
      const { userId, botId, investmentAmount } = req.body;

      // Get bot details
      const bot = await storage.getAiBot(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      // Validate investment amount
      const investment = parseFloat(investmentAmount);
      if (!investment || investment < parseFloat(bot.minInvestment) || investment > parseFloat(bot.maxInvestment)) {
        return res.status(400).json({ 
          error: `Investment must be between $${bot.minInvestment} and $${bot.maxInvestment}` 
        });
      }

      // Check balance (subscription fee + investment amount)
      const totalCost = parseFloat(bot.price) + investment;
      const balance = await storage.getUserBalance(userId);
      if (!balance || parseFloat(balance.totalBalanceUsd) < totalCost) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Calculate expiry date
      const purchaseDate = new Date();
      const expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + bot.durationDays);

      // Create bot subscription
      const userBot = await storage.createUserBot({
        userId,
        botId,
        investmentAmount: investmentAmount.toString(),
        purchaseDate,
        expiryDate,
        status: 'active',
        currentProfit: "0"
      });

      // Update balance (deduct subscription fee + investment amount)
      const newTotal = parseFloat(balance.totalBalanceUsd) - totalCost;
      await storage.updateUserBalance(userId, {
        totalBalanceUsd: newTotal.toString()
      });

      // Create transaction for subscription
      await storage.createTransaction({
        userId,
        type: 'bot_subscription',
        amount: totalCost.toString(),
        currency: 'USD',
        status: 'completed',
        description: `AI Bot: ${bot.name} (Fee: $${bot.price}, Investment: $${investmentAmount})`
      });

      res.json(userBot);
    } catch (error) {
      console.error("Bot subscription error:", error);
      res.status(500).json({ error: "Failed to subscribe to bot" });
    }
  });

  app.post("/api/user-bots/:id/stop", async (req, res) => {
    try {
      const { userId } = req.body;
      const userBot = await storage.getUserBot(parseInt(req.params.id));
      
      if (!userBot) {
        return res.status(404).json({ error: "Bot subscription not found" });
      }
      
      // Verify ownership
      if (userBot.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not own this subscription" });
      }
      
      const updated = await storage.updateUserBot(parseInt(req.params.id), { isStopped: true });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  app.post("/api/user-bots/:id/reactivate", async (req, res) => {
    try {
      const { userId } = req.body;
      const userBot = await storage.getUserBot(parseInt(req.params.id));
      
      if (!userBot) {
        return res.status(404).json({ error: "Bot subscription not found" });
      }
      
      // Verify ownership
      if (userBot.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not own this subscription" });
      }
      
      // Check if subscription has expired
      if (new Date(userBot.expiryDate) < new Date()) {
        return res.status(400).json({ error: "Cannot reactivate expired subscription" });
      }
      
      const updated = await storage.updateUserBot(parseInt(req.params.id), { isStopped: false });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reactivate bot" });
    }
  });

  // ==================== WALLETS ====================
  app.get("/api/users/:userId/wallets", async (req, res) => {
    try {
      const wallets = await storage.listUserWallets(parseInt(req.params.userId), false);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  app.post("/api/wallets", async (req, res) => {
    try {
      const wallet = await storage.createConnectedWallet(req.body);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  app.delete("/api/wallets/:id", async (req, res) => {
    try {
      await storage.deleteConnectedWallet(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wallet" });
    }
  });

  // ==================== CRYPTO ADDRESSES ====================
  app.get("/api/users/:userId/addresses", async (req, res) => {
    try {
      const addresses = await storage.listUserCryptoAddresses(parseInt(req.params.userId));
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const address = await storage.createCryptoAddress(req.body);
      res.json(address);
    } catch (error) {
      res.status(500).json({ error: "Failed to create address" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      await storage.deleteCryptoAddress(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  // ==================== PORTFOLIO ====================
  app.get("/api/users/:userId/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getUserPortfolio(parseInt(req.params.userId));
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolios = await storage.getAllPortfolios();
      const formatted = portfolios.map(p => ({
        id: p.id,
        userId: p.userId,
        assetId: p.assetId,
        assetType: p.assetType,
        name: p.name,
        symbol: p.symbol,
        amount: p.amount,
        averageBuyPrice: p.averageBuyPrice,
        currentValue: p.currentValue,
      }));
      res.json(formatted);
    } catch (error) {
      console.error("Failed to fetch all portfolios:", error);
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.createPortfolio(req.body);
      res.json(portfolio);
    } catch (error) {
      console.error("Failed to create portfolio item:", error);
      res.status(500).json({ error: "Failed to create portfolio item" });
    }
  });

  app.patch("/api/portfolio/:id", async (req, res) => {
    try {
      const portfolio = await storage.updatePortfolio(parseInt(req.params.id), req.body);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      res.json(portfolio);
    } catch (error) {
      console.error("Failed to update portfolio item:", error);
      res.status(500).json({ error: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/portfolio/:id", async (req, res) => {
    try {
      await storage.deletePortfolio(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete portfolio item" });
    }
  });

  app.post("/api/users/:userId/trade", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { action, symbol, amount, price, assetType, name, assetId } = req.body;
      
      if (!action || !symbol || !amount || !price) {
        return res.status(400).json({ error: "Missing required fields: action, symbol, amount, price" });
      }

      const existingPosition = await storage.getPortfolioBySymbol(userId, symbol);
      const tradeAmount = parseFloat(amount);
      const tradePrice = parseFloat(price);
      const tradeValue = tradeAmount * tradePrice;

      if (action === 'buy') {
        const balance = await storage.getUserBalance(userId);
        const totalBalance = parseFloat(balance?.totalBalanceUsd || '0');
        
        if (tradeValue > totalBalance) {
          return res.status(400).json({ error: "Insufficient balance" });
        }

        if (existingPosition) {
          const currentAmount = parseFloat(existingPosition.amount);
          const currentAvgPrice = parseFloat(existingPosition.averageBuyPrice);
          const newAmount = currentAmount + tradeAmount;
          const newAvgPrice = ((currentAmount * currentAvgPrice) + (tradeAmount * tradePrice)) / newAmount;
          
          await storage.updatePortfolio(existingPosition.id, {
            amount: newAmount.toString(),
            averageBuyPrice: newAvgPrice.toString(),
            currentValue: (newAmount * tradePrice).toString(),
          });
        } else {
          await storage.createPortfolio({
            userId,
            assetId: assetId || symbol.toLowerCase(),
            assetType: assetType || 'crypto',
            name: name || symbol,
            symbol,
            amount: tradeAmount.toString(),
            averageBuyPrice: tradePrice.toString(),
            currentValue: tradeValue.toString(),
          });
        }

        const newTotalBalance = totalBalance - tradeValue;
        await storage.updateUserBalance(userId, {
          totalBalanceUsd: newTotalBalance.toString(),
        });

        await storage.createTransaction({
          userId,
          type: 'trade',
          amount: tradeValue.toString(),
          currency: 'USD',
          status: 'completed',
          description: `Bought ${tradeAmount} ${symbol} at $${tradePrice}`,
        });

      } else if (action === 'sell') {
        if (!existingPosition) {
          return res.status(400).json({ error: "No position to sell" });
        }

        const currentAmount = parseFloat(existingPosition.amount);
        if (tradeAmount > currentAmount) {
          return res.status(400).json({ error: "Insufficient holdings" });
        }

        const newAmount = currentAmount - tradeAmount;
        
        if (newAmount <= 0) {
          await storage.deletePortfolio(existingPosition.id);
        } else {
          await storage.updatePortfolio(existingPosition.id, {
            amount: newAmount.toString(),
            currentValue: (newAmount * tradePrice).toString(),
          });
        }

        const balance = await storage.getUserBalance(userId);
        const totalBalance = parseFloat(balance?.totalBalanceUsd || '0');
        const availableBalance = parseFloat(balance?.availableBalanceUsd || '0');
        const newTotalBalance = totalBalance + tradeValue;
        const newAvailableBalance = availableBalance + tradeValue;
        
        await storage.updateUserBalance(userId, {
          totalBalanceUsd: newTotalBalance.toString(),
          availableBalanceUsd: newAvailableBalance.toString(),
        });

        await storage.createTransaction({
          userId,
          type: 'trade',
          amount: tradeValue.toString(),
          currency: 'USD',
          status: 'completed',
          description: `Sold ${tradeAmount} ${symbol} at $${tradePrice}`,
        });
      }

      const updatedPortfolio = await storage.getUserPortfolio(userId);
      const updatedBalance = await storage.getUserBalance(userId);
      
      res.json({ 
        success: true, 
        portfolio: updatedPortfolio,
        balance: updatedBalance
      });
    } catch (error) {
      console.error("Trade error:", error);
      res.status(500).json({ error: "Failed to execute trade" });
    }
  });

  // ==================== BALANCE ====================
  app.get("/api/users/:userId/balance", async (req, res) => {
    try {
      const balance = await storage.getUserBalance(parseInt(req.params.userId));
      res.json(balance || { totalBalanceUsd: "0", availableBalanceUsd: "0", lockedBalanceUsd: "0" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  app.get("/api/balances", requireAdmin, async (req, res) => {
    try {
      const balances = await storage.getAllUserBalances();
      const formatted = balances.map(b => ({
        userId: b.userId,
        totalBalanceUsd: b.totalBalanceUsd,
        availableBalanceUsd: b.availableBalanceUsd,
        lockedBalanceUsd: b.lockedBalanceUsd,
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balances" });
    }
  });

  // ==================== SUPPORT TICKETS ====================
  app.get("/api/tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.listAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/admin/tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.listAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/users/:userId/tickets", async (req, res) => {
    try {
      const tickets = await storage.listUserTickets(parseInt(req.params.userId));
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createSupportTicket(req.body);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { newMessage, status } = req.body;
      
      // Get the current ticket to append the new message
      const currentTicket = await storage.getSupportTicket(ticketId);
      if (!currentTicket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Build updated data
      const updateData: any = { updatedAt: new Date() };
      
      // If a new message is being added, append it atomically
      if (newMessage && newMessage.sender && newMessage.text) {
        const existingMessages = currentTicket.messages || [];
        updateData.messages = [
          ...existingMessages,
          {
            sender: newMessage.sender,
            text: newMessage.text,
            timestamp: newMessage.timestamp || new Date().toISOString()
          }
        ];
      }
      
      // Update status if provided
      if (status) {
        updateData.status = status;
      }
      
      const ticket = await storage.updateSupportTicket(ticketId, updateData);
      res.json(ticket);
    } catch (error) {
      console.error("Failed to update ticket:", error);
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  // ==================== SYSTEM SETTINGS ====================
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/telegram-support", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json({ telegramSupportUrl: settings?.telegramSupportUrl || null });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch telegram support URL" });
    }
  });

  app.patch("/api/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ==================== TICKET CATEGORIES ====================
  app.get("/api/ticket-categories", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const categories = await storage.listSupportTicketCategories(activeOnly);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket categories" });
    }
  });

  app.post("/api/admin/ticket-categories", requireAdmin, async (req, res) => {
    try {
      const category = await storage.createSupportTicketCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket category" });
    }
  });

  app.patch("/api/admin/ticket-categories/:id", requireAdmin, async (req, res) => {
    try {
      const category = await storage.updateSupportTicketCategory(parseInt(req.params.id), req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket category" });
    }
  });

  app.delete("/api/admin/ticket-categories/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteSupportTicketCategory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ticket category" });
    }
  });

  // ==================== CRYPTO ASSETS ====================
  
  // Proxy endpoint for CoinGecko API to avoid CORS issues
  app.get("/api/crypto-prices", async (req, res) => {
    try {
      const ids = req.query.ids as string;
      if (!ids) {
        return res.status(400).json({ error: "Missing 'ids' parameter" });
      }
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&order=market_cap_desc&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error);
      res.status(500).json({ error: "Failed to fetch crypto prices" });
    }
  });

  app.get("/api/crypto-assets", async (req, res) => {
    try {
      const assets = await storage.listCryptoAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crypto assets" });
    }
  });

  app.post("/api/crypto-assets", requireAdmin, async (req, res) => {
    try {
      const asset = await storage.createCryptoAsset({
        ...req.body,
        isManual: true
      });
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to create crypto asset" });
    }
  });

  app.patch("/api/crypto-assets/:id", requireAdmin, async (req, res) => {
    try {
      const asset = await storage.updateCryptoAsset(parseInt(req.params.id), req.body);
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to update crypto asset" });
    }
  });

  // ==================== FOREX ASSETS ====================
  app.get("/api/forex-assets", async (req, res) => {
    try {
      const assets = await storage.listForexAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forex assets" });
    }
  });

  app.post("/api/forex-assets", requireAdmin, async (req, res) => {
    try {
      const asset = await storage.createForexAsset({
        ...req.body,
        isManual: true
      });
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to create forex asset" });
    }
  });

  // ==================== STOCK ASSETS ====================
  app.get("/api/stock-assets", async (req, res) => {
    try {
      const assets = await storage.listStockAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock assets" });
    }
  });

  app.post("/api/stock-assets", requireAdmin, async (req, res) => {
    try {
      const asset = await storage.createStockAsset({
        ...req.body,
        isManual: true
      });
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to create stock asset" });
    }
  });

  // ==================== TRANSACTIONS ====================
  app.get("/api/transactions", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const transactionsList = await storage.listTransactions(status as string);
      
      // Get user info for each transaction
      const transactionsWithUsers = await Promise.all(
        transactionsList.map(async (tx) => {
          const user = await storage.getUser(tx.userId);
          return {
            ...tx,
            user: user ? {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            } : null
          };
        })
      );
      
      res.json(transactionsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const transactions = await storage.listUserTransactions(parseInt(req.params.userId));
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // ==================== SWAPS ====================
  app.get("/api/users/:userId/swaps", async (req, res) => {
    try {
      const swaps = await storage.listUserSwaps(parseInt(req.params.userId));
      res.json(swaps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch swaps" });
    }
  });

  app.post("/api/swaps", async (req, res) => {
    try {
      const { userId, fromAsset, toAsset, fromAmount, toAmount, rate } = req.body;

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: 'swap',
        amount: fromAmount,
        currency: fromAsset,
        status: 'completed',
        description: `Swap ${fromAmount} ${fromAsset} to ${toAmount} ${toAsset}`
      });

      // Create swap
      const swap = await storage.createSwap({
        transactionId: transaction.id,
        userId,
        fromAsset,
        toAsset,
        fromAmount,
        toAmount,
        rate,
        status: 'completed'
      });

      res.json(swap);
    } catch (error) {
      res.status(500).json({ error: "Failed to create swap" });
    }
  });

  // ==================== KYC ====================
  app.get("/api/kyc/pending", requireAdmin, async (req, res) => {
    try {
      const pending = await storage.listPendingKyc();
      res.json(pending);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending KYC" });
    }
  });

  app.get("/api/users/:userId/kyc", async (req, res) => {
    try {
      const kyc = await storage.getKycVerification(parseInt(req.params.userId));
      res.json(kyc || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC" });
    }
  });

  app.post("/api/kyc", async (req, res) => {
    try {
      const kyc = await storage.createKycVerification(req.body);
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create KYC" });
    }
  });

  app.patch("/api/kyc/:id", requireAdmin, async (req, res) => {
    try {
      const kyc = await storage.updateKycVerification(parseInt(req.params.id), {
        ...req.body,
        reviewedBy: req.session.adminId,
        reviewedAt: new Date()
      });
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to update KYC" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
