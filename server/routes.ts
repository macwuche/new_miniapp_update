import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Extend Express Request to include session
declare module "express-session" {
  interface SessionData {
    adminId?: number;
    userId?: number;
  }
}

const PgSession = connectPg(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
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
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);

      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
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

  // ==================== USERS ====================
  app.get("/api/users", requireAdmin, async (req, res) => {
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
      const creditAmountNum = parseFloat(creditAmount);

      // Update deposit status
      const approved = await storage.approveDeposit(depositId, req.session.adminId!);

      // Update the linked transaction status to approved
      await storage.updateTransactionStatus(deposit.transactionId, 'approved');

      // Update user balance
      const balance = await storage.getUserBalance(deposit.userId);
      if (balance) {
        const newTotal = parseFloat(balance.totalBalanceUsd) + creditAmountNum;
        const newAvailable = parseFloat(balance.availableBalanceUsd) + creditAmountNum;

        await storage.updateUserBalance(deposit.userId, {
          totalBalanceUsd: newTotal.toString(),
          availableBalanceUsd: newAvailable.toString()
        });
      } else {
        await storage.createUserBalance({
          userId: deposit.userId,
          totalBalanceUsd: creditAmount,
          availableBalanceUsd: creditAmount,
          lockedBalanceUsd: "0"
        });
      }

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
      const { userId, botId } = req.body;

      // Get bot details
      const bot = await storage.getAiBot(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      // Check balance
      const balance = await storage.getUserBalance(userId);
      if (!balance || parseFloat(balance.availableBalanceUsd) < parseFloat(bot.price)) {
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
        purchaseDate,
        expiryDate,
        status: 'active',
        currentProfit: "0"
      });

      // Update balance
      const newAvailable = parseFloat(balance.availableBalanceUsd) - parseFloat(bot.price);
      await storage.updateUserBalance(userId, {
        availableBalanceUsd: newAvailable.toString()
      });

      // Create transaction
      await storage.createTransaction({
        userId,
        type: 'bot_subscription',
        amount: bot.price,
        currency: 'USD',
        status: 'completed',
        description: `AI Bot: ${bot.name}`
      });

      res.json(userBot);
    } catch (error) {
      console.error("Bot subscription error:", error);
      res.status(500).json({ error: "Failed to subscribe to bot" });
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

  // ==================== BALANCE ====================
  app.get("/api/users/:userId/balance", async (req, res) => {
    try {
      const balance = await storage.getUserBalance(parseInt(req.params.userId));
      res.json(balance || { totalBalanceUsd: "0", availableBalanceUsd: "0", lockedBalanceUsd: "0" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
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
      const ticket = await storage.updateSupportTicket(parseInt(req.params.id), req.body);
      res.json(ticket);
    } catch (error) {
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
