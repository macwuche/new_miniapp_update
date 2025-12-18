import { useQuery } from "@tanstack/react-query";

interface SystemSettings {
  mainLogo?: string | null;
  siteName?: string;
}

export function Preloader() {
  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: Infinity,
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      data-testid="preloader"
    >
      <div className="flex flex-col items-center gap-6">
        {settings?.mainLogo ? (
          <div className="animate-pulse-logo">
            <img 
              src={settings.mainLogo} 
              alt={settings.siteName || "Loading"} 
              className="w-24 h-24 object-contain"
              data-testid="preloader-logo"
            />
          </div>
        ) : (
          <div className="animate-pulse-logo text-white text-2xl font-bold" data-testid="preloader-fallback">
            Loading...
          </div>
        )}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
