import { Link, useLocation } from "wouter";
import { Home, TrendingUp, PieChart, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: TrendingUp, label: "Markets", path: "/markets" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: PieChart, label: "Portfolio", path: "/portfolio" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  // Don't show nav on admin pages
  if (location.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg dark:bg-neutral-900/95 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-200 cursor-pointer min-w-[64px] active:scale-95",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "font-bold" : "font-normal"
                )}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
