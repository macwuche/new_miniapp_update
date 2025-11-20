import { Link, useLocation } from "wouter";
import { Home, TrendingUp, PieChart, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: TrendingUp, label: "Markets", path: "/markets" },
    { icon: PieChart, label: "Portfolio", path: "/portfolio" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  // Don't show nav on admin pages
  if (location.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors duration-200 cursor-pointer",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              )}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
