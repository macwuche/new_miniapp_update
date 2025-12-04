import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create admin account
    const hashedPassword = await bcrypt.hash("123456789", 10);
    const existingAdmin = await storage.getAdminByEmail("admin@admin.com");
    
    if (!existingAdmin) {
      await storage.createAdmin({
        email: "admin@admin.com",
        password: hashedPassword,
        permissions: ["all"]
      });
      console.log("✅ Admin account created (admin@admin.com / 123456789)");
    } else {
      console.log("ℹ️  Admin account already exists");
    }

    // Create system settings
    const existingSettings = await storage.getSystemSettings();
    if (!existingSettings) {
      await storage.updateSystemSettings({
        siteName: "Crypto Trading Platform",
        supportEmail: "support@cryptoplatform.com",
        depositEnabled: true,
        withdrawalEnabled: true,
        minDeposit: "10",
        minWithdrawal: "10",
        maintenanceMode: false
      });
      console.log("✅ System settings created");
    }

    // Create sample investment plans
    const plans = await storage.listInvestmentPlans();
    if (plans.length === 0) {
      await storage.createInvestmentPlan({
        name: "Starter Plan",
        description: "Perfect for beginners looking to start their investment journey",
        minAmount: "100",
        maxAmount: "1000",
        roi: "5",
        durationDays: 30,
        riskLevel: "low",
        isActive: true
      });

      await storage.createInvestmentPlan({
        name: "Growth Plan",
        description: "Balanced approach for moderate growth",
        minAmount: "1000",
        maxAmount: "10000",
        roi: "10",
        durationDays: 60,
        riskLevel: "medium",
        isActive: true
      });

      await storage.createInvestmentPlan({
        name: "Premium Plan",
        description: "High returns for experienced investors",
        minAmount: "10000",
        maxAmount: "100000",
        roi: "15",
        durationDays: 90,
        riskLevel: "high",
        isActive: true
      });

      console.log("✅ Investment plans created");
    }

    // Create sample AI bots
    const bots = await storage.listAiBots();
    if (bots.length === 0) {
      await storage.createAiBot({
        name: "Bitcoin Trader Pro",
        description: "Advanced AI bot specializing in BTC trading with proven track record",
        price: "299",
        durationDays: 30,
        expectedRoi: "8-12%",
        totalGains: "0",
        totalLosses: "0",
        winRate: "0",
        isActive: true
      });

      await storage.createAiBot({
        name: "Altcoin Master",
        description: "Multi-currency trading bot for altcoin opportunities",
        price: "499",
        durationDays: 30,
        expectedRoi: "12-18%",
        totalGains: "0",
        totalLosses: "0",
        winRate: "0",
        isActive: true
      });

      await storage.createAiBot({
        name: "Forex Elite",
        description: "Forex trading specialist with advanced market analysis",
        price: "399",
        durationDays: 30,
        expectedRoi: "10-15%",
        totalGains: "0",
        totalLosses: "0",
        winRate: "0",
        isActive: true
      });

      console.log("✅ AI bots created");
    }

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
