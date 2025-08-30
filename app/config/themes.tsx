// 主题配置文件
import { MoonIcon, SunIcon, StarIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ThemeConfig, ThemeType } from '@/app/types/theme';
import StarryBackground from '@/app/ui/components/starry-background';

// 主题配置数组
export const themes: ThemeConfig[] = [
  {
    name: 'light',
    displayName: '浅色',
    cssClass: 'light',
    icon: SunIcon,
    hasAnimations: false
  },
  {
    name: 'dark',
    displayName: '深色',
    cssClass: 'dark',
    icon: MoonIcon,
    hasAnimations: false
  },
  {
    name: 'yellow',
    displayName: '黄色',
    cssClass: 'yellow',
    icon: StarIcon,
    hasAnimations: false
  },
  {
    name: 'starry-sky',
    displayName: '星空',
    cssClass: 'starry-sky',
    icon: SparklesIcon,
    hasAnimations: true,
    backgroundComponent: StarryBackground,
    animationConfig: {
      starsCount: 60,
      animationDuration: 4,
      enableTwinkle: true,
      enableFloat: true
    }
  }
];

// 根据主题名称获取主题配置
export function getThemeConfig(themeName: ThemeType): ThemeConfig {
  const config = themes.find(theme => theme.name === themeName);
  if (!config) {
    throw new Error(`未找到主题配置: ${themeName}`);
  }
  return config;
}

// 获取下一个主题
export function getNextTheme(currentTheme: ThemeType): ThemeType {
  const currentIndex = themes.findIndex(theme => theme.name === currentTheme);
  const nextIndex = currentIndex === themes.length - 1 ? 0 : currentIndex + 1;
  return themes[nextIndex].name;
}

// 获取默认主题
export function getDefaultTheme(): ThemeType {
  return 'light';
}