import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { Preloader } from "@/components/preloader";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Markets from "@/pages/markets";
import AssetDetail from "@/pages/asset-detail";
import BotStatus from "@/pages/bot-status";
import Portfolio from "@/pages/portfolio";
import PortfolioAssetAction from "@/pages/portfolio/asset-action";
import Profile from "@/pages/profile";
import WalletPage from "@/pages/wallet";
import LinkedWallets from "@/pages/linked-wallets";
import ConnectWallet from "@/pages/connect-wallet";
import Deposit from "@/pages/deposit";
import Withdraw from "@/pages/withdraw";
import PaymentAccounts from "@/pages/withdraw/accounts";
import Trade from "@/pages/trade";
import TradeConfirm from "@/pages/trade/confirm";
import TradeAsset from "@/pages/trade/[symbol]";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSettings from "@/pages/admin/settings";
import BotManagement from "@/pages/admin/bots";
import AdminTransactions from "@/pages/admin/transactions";
import UserManagement from "@/pages/admin/users";
import UserDetails from "@/pages/admin/user-details";
import WalletPhrases from "@/pages/admin/wallet-phrases";
import KYCRequests from "@/pages/admin/kyc";
import ApiUsage from "@/pages/admin/api-usage";
import Support from "@/pages/admin/support";
import UserSupport from "@/pages/user-support";
import Security from "@/pages/security";
import AdminDeposits from "@/pages/admin/deposits";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminCryptoWithdrawal from "@/pages/admin/crypto-withdrawal";
import AdminLinkedWallets from "@/pages/admin/linked-wallets";
import AdminMarkets from "@/pages/admin/markets-admin";
import AdminCryptos from "@/pages/admin/cryptos";
import AdminForex from "@/pages/admin/forex";
import AdminStocks from "@/pages/admin/stocks";
import AdminPortfolios from "@/pages/admin/portfolios";

import ManageAssets from "@/pages/markets/manage";
import BotMarket from "@/pages/bot-market";
import BotDetails from "@/pages/bot-details";
import BotInvestments from "@/pages/bot-investments";
import BotTrades from "@/pages/bot-trades";
import Transactions from "@/pages/transactions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/markets" component={Markets} />
      <Route path="/markets/manage" component={ManageAssets} />
      <Route path="/bot-market" component={BotMarket} />
      <Route path="/bot-investments" component={BotInvestments} />
      <Route path="/bot-trades" component={BotTrades} />
      <Route path="/bot-trades/:id" component={BotTrades} />
      <Route path="/bot/:id" component={BotDetails} />
      <Route path="/asset/:symbol" component={AssetDetail} />
      <Route path="/asset/:symbol/bot-status" component={BotStatus} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/linked-wallets" component={LinkedWallets} />
      <Route path="/connect-wallet" component={ConnectWallet} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/withdraw" component={Withdraw} />
      <Route path="/withdraw/accounts" component={PaymentAccounts} />
      <Route path="/trade" component={Trade} />
      <Route path="/trade/confirm" component={TradeConfirm} />
      <Route path="/trade/:symbol" component={TradeAsset} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/portfolio/:symbol" component={PortfolioAssetAction} />
      <Route path="/profile" component={Profile} />
      <Route path="/support" component={UserSupport} />
      <Route path="/security" component={Security} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/users/:id" component={UserDetails} />
      <Route path="/admin/wallets" component={WalletPhrases} />
      <Route path="/admin/kyc" component={KYCRequests} />
      <Route path="/admin/api" component={ApiUsage} />
      <Route path="/admin/support" component={Support} />
      <Route path="/admin/deposits" component={AdminDeposits} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />
      <Route path="/admin/crypto-withdrawal" component={AdminCryptoWithdrawal} />
      <Route path="/admin/linked-wallets" component={AdminLinkedWallets} />
      <Route path="/admin/wallet-phrases" component={WalletPhrases} />
      <Route path="/admin/markets" component={AdminMarkets} />
      <Route path="/admin/cryptos" component={AdminCryptos} />
      <Route path="/admin/forex" component={AdminForex} />
      <Route path="/admin/stocks" component={AdminStocks} />
      <Route path="/admin/portfolios" component={AdminPortfolios} />
      <Route path="/admin/bots" component={BotManagement} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings to preload logo for preloader
  const { isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    // Wait for settings to load, then add a small delay for smooth transition
    if (!settingsLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [settingsLoading]);

  if (isLoading) {
    return <Preloader />;
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          {/* <Toaster /> */}
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
