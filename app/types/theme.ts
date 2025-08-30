// 主题配置接口和类型定义
import { ComponentType } from 'react';

// 主题类型定义
export type ThemeType = 'light' | 'dark' | 'yellow' | 'starry-sky';

// 动画配置接口
export interface AnimationConfig {
  starsCount?: number;
  animationDuration?: number;
  enableTwinkle?: boolean;
  enableFloat?: boolean;
}

// 主题配置接口
export interface ThemeConfig {
  name: ThemeType;
  displayName: string;
  cssClass: string;
  icon: ComponentType<{ className?: string }>;
  hasAnimations: boolean;
  backgroundComponent?: ComponentType<AnimationConfig>;
  customStyles?: string;
  animationConfig?: AnimationConfig;
}

// 主题上下文类型
export interface ThemeContextType {
  theme: ThemeType;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}