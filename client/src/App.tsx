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
