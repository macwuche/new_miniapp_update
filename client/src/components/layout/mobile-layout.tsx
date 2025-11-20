import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { useTelegram } from "@/lib/telegram-mock";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  const { webApp } = useTelegram();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-primary/20">
      <main className={className}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
