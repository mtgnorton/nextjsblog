'use client';
import "@/app/ui/global.css";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<string>("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    // 不再直接操作 body，而是使用 :root 选择器
    document.documentElement.classList.add(initialTheme);
    setMounted(true);
    
    return () => {
      document.documentElement.classList.remove(initialTheme);
    };
  }, []);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'yellow'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = currentIndex === themes.length - 1 ? 0 : currentIndex + 1;
    const newTheme = themes[nextIndex];

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}