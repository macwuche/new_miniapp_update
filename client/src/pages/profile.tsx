import { MobileLayout } from "@/components/layout/mobile-layout";
import { useTelegram } from "@/lib/telegram-mock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Award, Zap, Send, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useTelegram();

  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-8 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto overflow-hidden border-4 border-white shadow-lg">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                {user?.first_name?.[0]}
              </div>
            )}
          </div>
          {user?.is_premium && (
            <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
              <Award size={16} />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-gray-500 mb-6">@{user?.username || "username"}</p>

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
          <Card className="p-4 border-none shadow-sm bg-white">
            <p className="text-xs text-gray-500 mb-1">Today's P&L</p>
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
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm active:bg-gray-50 transition-colors mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            </Link>
          ))}

          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2 mt-6">Support</p>

          {/* Telegram Support */}
          <a href="https://t.me/BrokerageSupport" target="_blank" rel="noopener noreferrer" className="block">
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm active:bg-gray-50 transition-colors mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                  <Send size={20} />
                </div>
                <span className="font-medium text-gray-900">Telegram Support</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xs">Open</span>
                <ChevronRight size={20} />
              </div>
            </button>
          </a>

          {/* In-App Support */}
          <Link href="/support">
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                  <MessageSquare size={20} />
                </div>
                <span className="font-medium text-gray-900">In-App Support</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          </Link>
        </div>

        <Button variant="ghost" className="w-full mt-8 h-12 rounded-xl font-medium text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={18} className="mr-2" />
          Log Out
        </Button>
      </div>
    </MobileLayout>
  );
}
