'use client';
import { useTheme } from '@/app/provider/theme';
import { getNextTheme, getThemeConfig } from '@/app/config/themes';

export default function ThemeToggle() {
  const { theme, themeConfig, toggleTheme } = useTheme();
  
  // 获取下一个主题的配置，用于显示对应的图标
  const nextTheme = getNextTheme(theme);
  const nextThemeConfig = getThemeConfig(nextTheme);
  const NextIcon = nextThemeConfig.icon;

  // 根据当前主题确定按钮样式
  const getButtonStyle = () => {
    switch (theme) {
      case 'light':
        return 'bg-dark text-light';
      case 'dark':
        return 'bg-yellow text-dark';
      case 'yellow':
        return 'bg-gray-800 text-white';
      case 'starry-sky':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg';
      default:
        return 'bg-dark text-light';
    }
  };

  // 获取按钮的特殊效果类
  const getButtonEffects = () => {
    if (theme === 'starry-sky') {
      return 'hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300';
    }
    return 'hover:opacity-80 transition-colors duration-200';
  };

  return (
    <button 
      onClick={toggleTheme}
      className={`p-1 rounded ${getButtonStyle()} ${getButtonEffects()}`}
      title={`切换到${nextThemeConfig.displayName}主题`}
      aria-label={`当前主题: ${themeConfig.displayName}，点击切换到${nextThemeConfig.displayName}主题`}
    >
      <NextIcon className={`size-5 ${theme === 'starry-sky' ? 'animate-pulse' : ''}`} />
    </button>
  );
}