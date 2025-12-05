import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Award, Zap, Send, MessageSquare, Sun, Moon, Smartphone } from "lucide-react";
import { Link } from "wouter";
import { useTheme } from "@/lib/theme";

export default function Profile() {
  const { user } = useTelegram();
  const { theme, setTheme } = useTheme();

  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-8 text-center dark:bg-slate-900 min-h-screen">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 mx-auto overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-300">
                {user?.first_name?.[0]}
              </div>
            )}
          </div>
          {user?.is_premium && (
            <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm">
              <Award size={16} />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">@{user?.username || "username"}</p>

        {!user?.is_premium && (
           <div className="mb-6 bg-gradient-to-r from-primary/10 to-blue-400/10 p-4 rounded-2xl border border-blue-100">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-primary text-white rounded-full">
                 <Zap size={18} fill="currentColor" />
               </div>
               <div className="text-left">
                 <h3 className="font-bold text-primary">Upgrade to Pro</h3>
                 <p className="text-xs text-gray-500">0% fees on your first deposit</p>
               </div>
             </div>
             <Button className="w-full bg-primary text-white shadow-blue-200 shadow-lg">
               Get Started
             </Button>
           </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Card className="p-4 border-none shadow-md bg-gradient-to-br from-primary to-blue-600 text-white">
            <p className="text-xs opacity-80 mb-1">Total Assets</p>
            <p className="text-lg font-bold">$12,450.00</p>
          </Card>
          <Card className="p-4 border-none shadow-sm bg-white dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today's P&L</p>
            <p className="text-lg font-bold text-green-500">+$324.50</p>
          </Card>
        </div>

        <div className="space-y-3 text-left">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Account</p>
          
          {[
            { icon: Shield, label: "Security", to: "/security" },
            { icon: CreditCard, label: "Payment Methods", to: "/withdraw/accounts" },
          ].map((item) => (
            <Link key={item.label} href={item.to}>
              <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm active:bg-gray-50 dark:active:bg-slate-700 transition-colors mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300 dark:text-gray-500" />
              </button>
            </Link>
          ))}

          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2 mt-6">Appearance</p>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme("light")}
                data-testid="theme-light"
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Sun size={22} />
                <span className="text-xs font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                data-testid="theme-dark"
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Moon size={22} />
                <span className="text-xs font-medium">Dark</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                data-testid="theme-auto"
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Smartphone size={22} />
                <span className="text-xs font-medium">Auto</span>
              </button>
            </div>
          </div>

          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2 mt-6">Support</p>

          {/* Telegram Support */}
          <a href="https://t.me/BrokerageSupport" target="_blank" rel="noopener noreferrer" className="block">
            <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm active:bg-gray-50 dark:active:bg-slate-700 transition-colors mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500">
                  <Send size={20} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Telegram Support</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xs">Open</span>
                <ChevronRight size={20} />
              </div>
            </button>
          </a>

          {/* In-App Support */}
          <Link href="/support">
            <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm active:bg-gray-50 dark:active:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-500">
                  <MessageSquare size={20} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">In-App Support</span>
              </div>
              <ChevronRight size={20} className="text-gray-300 dark:text-gray-500" />
            </button>
          </Link>
        </div>

        <Button variant="ghost" className="w-full mt-8 h-12 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
          <LogOut size={18} className="mr-2" />
          Log Out
        </Button>
      </div>
    </MobileLayout>
  );
}
