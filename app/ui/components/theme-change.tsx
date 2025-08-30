'use client';
import { useTheme } from '@/app/provider/theme';

export default function ThemeToggle() {
  const { theme, themeConfig, toggleTheme } = useTheme();

  // 主题切换时添加页面动画
  const handleToggle = () => {
    // 添加切换动画类
    document.body.classList.add('theme-switching');

    // 执行主题切换
    toggleTheme();

    // 动画完成后移除类
    setTimeout(() => {
      document.body.classList.remove('theme-switching');
    }, 400);
  };

  // 使用当前主题对应的图标
  const Icon = themeConfig.icon;

  // 简约的按钮样式
  const getButtonStyle = () => {
    return 'theme-toggle-button p-2 rounded-full bg-transparent border-2 border-current hover:border-opacity-80';
  };

  // 获取提示文本 - 显示下一个主题的名称
  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return '切换到深色主题';
      case 'dark':
        return '切换到黄色主题';
      case 'yellow':
        return '切换到星空主题';
      case 'starry-sky':
        return '切换到浅色主题';
      default:
        return '切换主题';
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={getButtonStyle()}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <Icon className="theme-icon size-5" />
    </button>
  );
}