import { storage } from "./storage";
import type { AiBot, UserBot, BotTrade, TradingAssetInfo } from "@shared/schema";

interface SelectedAssetInfo {
  id: string;
  symbol: string;
  name: string;
  logoUrl: string;
}

async function fetchCryptoPrice(assetId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data[assetId]?.usd || null;
  } catch (error) {
    console.error(`[Bot Engine] Failed to fetch price for ${assetId}:`, error);
    return null;
  }
}

export async function processHourlyTrades(): Promise<{
  processed: number;
  trades: Array<{
    userBotId: number;
    userId: number;
    asset: string;
    result: 'win' | 'loss';
    profit: number;
    loss: number;
  }>;
  errors: string[];
}> {
  const results = {
    processed: 0,
    trades: [] as Array<{
      userBotId: number;
      userId: number;
      asset: string;
      result: 'win' | 'loss';
      profit: number;
      loss: number;
    }>,
    errors: [] as string[],
  };

  try {
    const allBots = await storage.listAiBots();
    const activeBots = allBots.filter(b => b.isActive);
    
    if (activeBots.length === 0) {
      console.log('[Bot Engine] No active bots found');
      return results;
    }

    for (const bot of activeBots) {
      try {
        const userBots = await storage.listUserBotsByBotId(bot.id);
        
        for (const userBot of userBots) {
          try {
            if (userBot.isStopped || userBot.isPaused) continue;
            
            // Check if subscription has expired
            if (new Date(userBot.expiryDate) < new Date()) {
              // Unlock remaining funds for expired subscriptions
              await handleExpiredSubscription(userBot);
              continue;
            }
            
            if (userBot.status !== 'active') continue;

            const executed = await processUserBotTrade(userBot, bot, results);
            if (executed) {
              results.processed++;
            }
          } catch (error: any) {
            results.errors.push(`UserBot ${userBot.id}: ${error.message}`);
          }
        }
      } catch (error: any) {
        results.errors.push(`Bot ${bot.id}: ${error.message}`);
      }
    }

    console.log(`[Bot Engine] Processed ${results.processed} trades, ${results.errors.length} errors`);
  } catch (error: any) {
    console.error('[Bot Engine] Fatal error:', error);
    results.errors.push(`Fatal: ${error.message}`);
  }

  return results;
}

async function processUserBotTrade(
  userBot: UserBot,
  bot: AiBot,
  results: { trades: any[]; errors: string[] }
): Promise<boolean> {
  const minProfit = parseFloat(bot.minProfitPercent) || 1;
  const maxProfit = parseFloat(bot.maxProfitPercent) || 5;
  const winRate = parseFloat(bot.expectedRoi) || 70;
  
  const isWin = Math.random() * 100 < winRate;

  const tradingAssets = bot.tradingAssets || [];
  const assetDistribution = (bot.assetDistribution || {}) as Record<string, number>;
  
  const selectedAssetInfo = selectAssetByDistribution(tradingAssets, assetDistribution);
  const selectedAsset = selectedAssetInfo.symbol;

  const remainingVal = parseFloat(userBot.remainingAllocation);
  const allocatedVal = parseFloat(userBot.allocatedAmount);
  const investmentVal = parseFloat(userBot.investmentAmount);
  
  let effectiveAllocation: number;
  
  if (!isNaN(remainingVal)) {
    effectiveAllocation = remainingVal;
  } else if (!isNaN(allocatedVal) && allocatedVal > 0) {
    effectiveAllocation = allocatedVal;
  } else {
    effectiveAllocation = investmentVal || 0;
  }
  
  if (effectiveAllocation <= 0) return false;
  
  let balance = await storage.getUserBalance(userBot.userId);
  if (!balance) {
    balance = await storage.createUserBalance({
      userId: userBot.userId,
      totalBalanceUsd: "0",
      availableBalanceUsd: "0",
      lockedBalanceUsd: "0",
    });
  }
  
  const currentTotal = parseFloat(balance.totalBalanceUsd) || 0;
  const currentAvailable = parseFloat(balance.availableBalanceUsd) || 0;
  const currentLocked = parseFloat(balance.lockedBalanceUsd) || 0;
  
  const maxTradeableAmount = Math.min(effectiveAllocation, currentLocked);
  if (maxTradeableAmount <= 0) return false;
  
  const tradePercent = 5 + Math.random() * 10;
  let tradeAmount = maxTradeableAmount * (tradePercent / 100);
  tradeAmount = Math.min(tradeAmount, maxTradeableAmount);

  let profitAmount = 0;
  let lossAmount = 0;

  if (isWin) {
    const profitPercent = minProfit + Math.random() * (maxProfit - minProfit);
    profitAmount = tradeAmount * (profitPercent / 100);
  } else {
    const lossPercent = minProfit + Math.random() * (maxProfit - minProfit) * 0.7;
    lossAmount = Math.min(tradeAmount * (lossPercent / 100), maxTradeableAmount);
  }

  await storage.createBotTrade({
    userBotId: userBot.id,
    userId: userBot.userId,
    assetSymbol: selectedAsset,
    assetType: bot.category || 'crypto',
    tradeResult: isWin ? 'win' : 'loss',
    tradeAmount: tradeAmount.toFixed(8),
    profitAmount: profitAmount.toFixed(8),
    lossAmount: lossAmount.toFixed(8),
    assetPriceAtTrade: null,
    assetName: selectedAssetInfo.name,
    assetLogoUrl: selectedAssetInfo.logoUrl,
  } as any);

  const existingProfit = parseFloat(userBot.currentProfit) || 0;
  const totalDistributed = parseFloat(userBot.totalProfitDistributed) || 0;
  
  const newRemaining = isWin 
    ? effectiveAllocation 
    : Math.max(0, effectiveAllocation - lossAmount);
  
  const newCurrentProfit = existingProfit + profitAmount - lossAmount;
  const newTotalDistributed = totalDistributed + profitAmount;

  await storage.updateUserBot(userBot.id, {
    currentProfit: newCurrentProfit.toFixed(8),
    totalProfitDistributed: newTotalDistributed.toFixed(8),
    remainingAllocation: newRemaining.toFixed(8),
    lastTradeDate: new Date(),
  } as any);

  try {
    if (profitAmount > 0) {
      const assetPrice = await fetchCryptoPrice(selectedAssetInfo.id);
      
      const cryptoAmount = assetPrice && assetPrice > 0 
        ? profitAmount / assetPrice 
        : profitAmount;
      
      console.log(`[Bot Engine] Profit distribution: $${profitAmount.toFixed(2)} USD → ${cryptoAmount.toFixed(8)} ${selectedAsset} (price: $${assetPrice || 'unknown'})`);
      
      const existingPortfolio = await storage.getPortfolioBySymbol(userBot.userId, selectedAsset);
      
      if (existingPortfolio) {
        const currentAmount = parseFloat(existingPortfolio.amount) || 0;
        const newAmount = currentAmount + cryptoAmount;
        const currentValue = parseFloat(existingPortfolio.currentValue) || 0;
        const newValue = currentValue + profitAmount;
        
        await storage.updatePortfolio(existingPortfolio.id, {
          amount: newAmount.toFixed(8),
          currentValue: newValue.toFixed(8),
          averageBuyPrice: assetPrice ? assetPrice.toFixed(8) : existingPortfolio.averageBuyPrice,
          logoUrl: selectedAssetInfo.logoUrl || existingPortfolio.logoUrl,
        });
      } else {
        await storage.createPortfolio({
          userId: userBot.userId,
          assetId: selectedAssetInfo.id,
          assetType: bot.category || 'crypto',
          name: selectedAssetInfo.name,
          symbol: selectedAsset,
          logoUrl: selectedAssetInfo.logoUrl,
          amount: cryptoAmount.toFixed(8),
          averageBuyPrice: assetPrice ? assetPrice.toFixed(8) : '1',
          currentValue: profitAmount.toFixed(8),
        });
      }
      
      await storage.updateUserBalance(userBot.userId, {
        totalBalanceUsd: (currentTotal + profitAmount).toFixed(8),
        availableBalanceUsd: (currentAvailable + profitAmount).toFixed(8),
        lockedBalanceUsd: currentLocked.toFixed(8),
      });
    } else if (lossAmount > 0) {
      let remainingLoss = lossAmount;
      let newLocked = currentLocked;
      let newAvailable = currentAvailable;
      
      if (remainingLoss <= currentLocked) {
        newLocked = currentLocked - remainingLoss;
      } else {
        newLocked = 0;
        remainingLoss -= currentLocked;
        newAvailable = Math.max(0, currentAvailable - remainingLoss);
      }
      
      const newTotal = newAvailable + newLocked;
      
      await storage.updateUserBalance(userBot.userId, {
        totalBalanceUsd: newTotal.toFixed(8),
        availableBalanceUsd: newAvailable.toFixed(8),
        lockedBalanceUsd: newLocked.toFixed(8),
      });
    }
  } catch (error: any) {
    results.errors.push(`Balance/Portfolio update for user ${userBot.userId}: ${error.message}`);
  }

  results.trades.push({
    userBotId: userBot.id,
    userId: userBot.userId,
    asset: selectedAsset,
    result: isWin ? 'win' : 'loss',
    profit: profitAmount,
    loss: lossAmount,
  });
  
  return true;
}

function selectAssetByDistribution(
  assets: TradingAssetInfo[] | string[],
  distribution: Record<string, number>
): SelectedAssetInfo {
  const defaultAsset: SelectedAssetInfo = {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  };
  
  if (!assets || assets.length === 0) {
    return defaultAsset;
  }

  const normalizedAssets: SelectedAssetInfo[] = assets.map(asset => {
    if (typeof asset === 'string') {
      return {
        id: asset.toLowerCase(),
        symbol: asset.toUpperCase(),
        name: asset,
        logoUrl: '',
      };
    }
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      logoUrl: asset.logoUrl || '',
    };
  });

  const hasDistribution = Object.keys(distribution).length > 0;
  
  if (!hasDistribution) {
    return normalizedAssets[Math.floor(Math.random() * normalizedAssets.length)];
  }

  const random = Math.random() * 100;
  let cumulative = 0;

  for (const asset of normalizedAssets) {
    const distValue = distribution[asset.symbol] || distribution[asset.symbol.toLowerCase()] || distribution[asset.symbol.toUpperCase()] || 0;
    cumulative += distValue;
    if (random <= cumulative) {
      return asset;
    }
  }

  return normalizedAssets[normalizedAssets.length - 1];
}

async function handleExpiredSubscription(userBot: UserBot): Promise<void> {
  // Only process if there's remaining allocation and status is still active
  const remainingAllocation = parseFloat(userBot.remainingAllocation) || 0;
  if (remainingAllocation <= 0 || userBot.status !== 'active') return;
  
  try {
    // Get user balance
    const balance = await storage.getUserBalance(userBot.userId);
    if (!balance) return;
    
    const currentAvailable = parseFloat(balance.availableBalanceUsd) || 0;
    const currentLocked = parseFloat(balance.lockedBalanceUsd) || 0;
    
    // Unlock remaining allocation
    const amountToUnlock = Math.min(remainingAllocation, currentLocked);
    const newLocked = currentLocked - amountToUnlock;
    const newAvailable = currentAvailable + amountToUnlock;
    const newTotal = newAvailable + newLocked;
    
    await storage.updateUserBalance(userBot.userId, {
      totalBalanceUsd: newTotal.toFixed(8),
      availableBalanceUsd: newAvailable.toFixed(8),
      lockedBalanceUsd: newLocked.toFixed(8)
    });
    
    // Mark subscription as completed
    await storage.updateUserBot(userBot.id, {
      status: 'completed',
      remainingAllocation: "0"
    } as any);
    
    console.log(`[Bot Engine] Expired subscription ${userBot.id}: unlocked $${amountToUnlock.toFixed(2)} for user ${userBot.userId}`);
  } catch (error: any) {
    console.error(`[Bot Engine] Failed to handle expired subscription ${userBot.id}:`, error.message);
  }
}

let botEngineInterval: NodeJS.Timeout | null = null;

export function startBotEngine() {
  if (botEngineInterval) {
    console.log('[Bot Engine] Already running');
    return;
  }

  console.log('[Bot Engine] Starting trading engine (runs every 5 minutes)');
  
  botEngineInterval = setInterval(async () => {
    console.log('[Bot Engine] Running trade processing...');
    try {
      await processHourlyTrades();
    } catch (error) {
      console.error('[Bot Engine] Error during scheduled run:', error);
    }
  }, 5 * 60 * 1000);
}

export function stopBotEngine() {
  if (botEngineInterval) {
    clearInterval(botEngineInterval);
    botEngineInterval = null;
    console.log('[Bot Engine] Stopped');
  }
}
