'use client';
import "@/app/ui/global.css";
import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { ThemeContextType, ThemeType } from "@/app/types/theme";
import { getThemeConfig, getNextTheme, getDefaultTheme } from "@/app/config/themes";
import { migrateThemeSettings, getSystemPreferredTheme } from "@/app/utils/theme-migration";
import PerformanceMonitor from "@/app/ui/components/performance-monitor";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<ThemeType>(getDefaultTheme());

  // 获取当前主题配置
  const themeConfig = getThemeConfig(theme);

  useEffect(() => {
    // 使用迁移工具处理主题设置
    const migratedTheme = migrateThemeSettings();
    const systemTheme = getSystemPreferredTheme();
    const initialTheme = migratedTheme || systemTheme;
    
    setThemeState(initialTheme);
    // 应用主题样式类
    document.documentElement.classList.add(initialTheme);
    setMounted(true);
    
    return () => {
      document.documentElement.classList.remove(initialTheme);
    };
  }, []);

  // 设置主题的内部方法
  const setTheme = (newTheme: ThemeType) => {
    // 移除当前主题类
    document.documentElement.classList.remove(theme);
    // 添加新主题类
    document.documentElement.classList.add(newTheme);
    // 更新状态
    setThemeState(newTheme);
    // 保存到 localStorage
    localStorage.setItem("theme", newTheme);
  };

  // 切换到下一个主题
  const toggleTheme = () => {
    const nextTheme = getNextTheme(theme);
    setTheme(nextTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, toggleTheme, setTheme }}>
      <div className="theme-container">
        {/* 渲染主题特定的背景组件 */}
        {themeConfig.hasAnimations && themeConfig.backgroundComponent && (
          <div className="theme-background">
            <themeConfig.backgroundComponent {...(themeConfig.animationConfig || {})} />
          </div>
        )}
        {children}
        {/* 性能监控组件 - 仅在开发环境显示 */}
        <PerformanceMonitor />
      </div>
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