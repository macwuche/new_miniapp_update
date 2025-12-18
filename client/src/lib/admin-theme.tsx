import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AdminTheme = "light" | "dark";

interface AdminThemeContextType {
  adminTheme: AdminTheme;
  setAdminTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [adminTheme, setAdminThemeState] = useState<AdminTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("admin-theme") as AdminTheme) || "light";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("admin-theme", adminTheme);
  }, [adminTheme]);

  const setAdminTheme = (theme: AdminTheme) => {
    setAdminThemeState(theme);
  };

  const toggleTheme = () => {
    setAdminThemeState(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <AdminThemeContext.Provider value={{ adminTheme, setAdminTheme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
