import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSettings from "@/pages/admin/settings";
import BotManagement from "@/pages/admin/bots";
import AdminTransactions from "@/pages/admin/transactions";
import UserManagement from "@/pages/admin/users";
import WalletPhrases from "@/pages/admin/wallet-phrases";
import KYCRequests from "@/pages/admin/kyc";
import InvestmentPlans from "@/pages/admin/investments";
import NewInvestmentPlan from "@/pages/admin/investments/new";
import ApiUsage from "@/pages/admin/api-usage";
import Support from "@/pages/admin/support";
import AdminDeposits from "@/pages/admin/deposits";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminSwap from "@/pages/admin/swap";
import AdminMarkets from "@/pages/admin/markets-admin";
import AdminCryptos from "@/pages/admin/cryptos";
import AdminForex from "@/pages/admin/forex";
import AdminStocks from "@/pages/admin/stocks";
import AdminPortfolios from "@/pages/admin/portfolios";

import ManageAssets from "@/pages/markets/manage";
import BotMarket from "@/pages/bot-market";
import BotDetails from "@/pages/bot-details";
import BotInvestments from "@/pages/bot-investments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/markets" component={Markets} />
      <Route path="/markets/manage" component={ManageAssets} />
      <Route path="/bot-market" component={BotMarket} />
      <Route path="/bot-investments" component={BotInvestments} />
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
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/portfolio/:symbol" component={PortfolioAssetAction} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/wallets" component={WalletPhrases} />
      <Route path="/admin/kyc" component={KYCRequests} />
      <Route path="/admin/investments" component={InvestmentPlans} />
      <Route path="/admin/investments/new" component={NewInvestmentPlan} />
      <Route path="/admin/api" component={ApiUsage} />
      <Route path="/admin/support" component={Support} />
      <Route path="/admin/deposits" component={AdminDeposits} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />
      <Route path="/admin/swap" component={AdminSwap} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* <Toaster /> */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
