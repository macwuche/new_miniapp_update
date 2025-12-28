import { storage } from "./storage";
import type { AiBot, UserBot, BotTrade } from "@shared/schema";

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
            
            if (new Date(userBot.expiryDate) < new Date()) continue;
            
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

  const tradingAssets = bot.tradingAssets || ['BTC', 'ETH'];
  const assetDistribution = (bot.assetDistribution || {}) as Record<string, number>;
  
  const selectedAsset = selectAssetByDistribution(tradingAssets, assetDistribution);

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
      await storage.updateUserBalance(userBot.userId, {
        totalBalanceUsd: (currentTotal + profitAmount).toFixed(8),
        availableBalanceUsd: (currentAvailable + profitAmount).toFixed(8),
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
    results.errors.push(`Balance update for user ${userBot.userId}: ${error.message}`);
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
  assets: string[],
  distribution: Record<string, number>
): string {
  if (!assets || assets.length === 0) {
    return 'BTC';
  }

  const hasDistribution = Object.keys(distribution).length > 0;
  
  if (!hasDistribution) {
    return assets[Math.floor(Math.random() * assets.length)];
  }

  const random = Math.random() * 100;
  let cumulative = 0;

  for (const asset of assets) {
    cumulative += distribution[asset] || 0;
    if (random <= cumulative) {
      return asset;
    }
  }

  return assets[assets.length - 1];
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
