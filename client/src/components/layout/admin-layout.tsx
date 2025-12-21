import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Bot, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  Key,
  FileCheck,
  Headphones,
  Code,
  Newspaper,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Coins,
  Globe,
  Building2,
  PieChart,
  Loader2,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { AdminThemeProvider, useAdminTheme } from "@/lib/admin-theme";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminData, setAdminData] = useState<{ email: string } | null>(null);
  const { adminTheme, toggleTheme } = useAdminTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const admin = await adminAPI.me() as { email: string };
        setAdminData(admin);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setLocation("/admin");
      }
    };
    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        adminTheme === "dark" ? "bg-slate-900" : "bg-gray-50"
      )}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: Wallet, label: "Transactions", href: "/admin/transactions" },
    { icon: ArrowDownLeft, label: "Deposits", href: "/admin/deposits" },
    { icon: ArrowUpRight, label: "Withdrawals", href: "/admin/withdrawals" },
    { icon: BarChart3, label: "Markets", href: "/admin/markets" },
    { icon: Coins, label: "Cryptos", href: "/admin/cryptos" },
    { icon: Globe, label: "Forex", href: "/admin/forex" },
    { icon: Building2, label: "Stocks", href: "/admin/stocks" },
    { icon: PieChart, label: "User Portfolio", href: "/admin/portfolios" },
    { icon: Bot, label: "Bot Management", href: "/admin/bots" },
    { icon: Key, label: "Wallet Phrases", href: "/admin/wallets" },
    { icon: FileCheck, label: "KYC Requests", href: "/admin/kyc" },
    { icon: Code, label: "API Usage", href: "/admin/api" },
    { icon: Headphones, label: "Support", href: "/admin/support" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }
    setLocation("/admin");
  };

  const SidebarContent = () => (
    <div className={cn(
      "flex flex-col h-full",
      adminTheme === "dark" ? "bg-slate-900 text-white" : "bg-white text-gray-900 border-r border-gray-200"
    )}>
      <div className={cn(
        "p-6 border-b shrink-0",
        adminTheme === "dark" ? "border-slate-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
            A
          </div>
          <h1 className="text-xl font-bold">AdminPanel</h1>
        </div>
      </div>

      <div className={cn(
        "flex-1 overflow-y-auto py-4 px-3 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full",
        adminTheme === "dark" 
          ? "[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
          : "[&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
      )}>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : adminTheme === "dark"
                      ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}>
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn(
        "p-4 border-t shrink-0",
        adminTheme === "dark" ? "border-slate-800" : "border-gray-200"
      )}>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div 
      className={cn(
        "min-h-screen flex",
        adminTheme === "dark" ? "bg-slate-950" : "bg-gray-50"
      )}
      data-admin-theme={adminTheme}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className={cn(
          "h-16 sticky top-0 z-40 px-6 flex items-center justify-between border-b",
          adminTheme === "dark" 
            ? "bg-slate-900 border-slate-800" 
            : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "lg:hidden",
                  adminTheme === "dark" ? "text-slate-300 hover:text-white" : ""
                )}>
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={cn(
                "p-0 w-64",
                adminTheme === "dark" ? "border-r-slate-800 bg-slate-900" : "border-r-gray-200 bg-white"
              )}>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="relative hidden sm:block max-w-md w-full">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                adminTheme === "dark" ? "text-slate-500" : "text-gray-400"
              )} size={16} />
              <Input 
                placeholder="Search users, transactions..." 
                className={cn(
                  "pl-9 w-[300px] transition-all",
                  adminTheme === "dark" 
                    ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800" 
                    : "bg-gray-50 border-gray-200 focus:bg-white"
                )} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className={cn(
                "relative",
                adminTheme === "dark" 
                  ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                  : "text-gray-500 hover:text-gray-900"
              )}
              data-testid="button-toggle-admin-theme"
            >
              {adminTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className={cn(
              "relative",
              adminTheme === "dark" 
                ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                : "text-gray-500 hover:text-gray-900"
            )}>
              <Bell size={20} />
              <span className={cn(
                "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2",
                adminTheme === "dark" ? "border-slate-900" : "border-white"
              )}></span>
            </Button>
            
            <div className={cn(
              "flex items-center gap-3 pl-4 border-l",
              adminTheme === "dark" ? "border-slate-700" : "border-gray-200"
            )}>
              <div className="text-right hidden sm:block">
                <p className={cn(
                  "text-sm font-medium",
                  adminTheme === "dark" ? "text-white" : "text-gray-900"
                )}>Admin User</p>
                <p className={cn(
                  "text-xs",
                  adminTheme === "dark" ? "text-slate-400" : "text-gray-500"
                )}>Super Admin</p>
              </div>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={cn(
          "flex-1 p-4 sm:p-6 overflow-x-hidden",
          adminTheme === "dark" ? "text-white" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
