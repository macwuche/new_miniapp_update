import { useState, useEffect } from 'react';

// Mock data for development in browser
const MOCK_USER = {
  id: 123456789,
  first_name: "Alex",
  last_name: "Trader",
  username: "alextrader",
  language_code: "en",
  is_premium: true,
  photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
};

export function useTelegram() {
  const [user, setUser] = useState<any>(null);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    const app = (window as any).Telegram?.WebApp;
    
    if (app) {
      app.ready();
      setWebApp(app);
      
      if (app.initDataUnsafe?.user) {
        setUser(app.initDataUnsafe.user);
      } else {
        // Fallback for development if running outside Telegram
        console.log("Running in dev mode, using mock Telegram user");
        setUser(MOCK_USER);
      }
    } else {
       // Fallback if script not loaded or dev environment
       setUser(MOCK_USER);
    }
  }, []);

  return {
    user,
    webApp,
    isExpanded: webApp?.isExpanded ?? false,
    viewportHeight: webApp?.viewportHeight ?? window.innerHeight,
  };
}
