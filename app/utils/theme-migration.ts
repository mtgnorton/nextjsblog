// 主题迁移工具
import { ThemeType } from '@/app/types/theme';

/**
 * 迁移旧的主题设置到新的主题系统
 * 确保向后兼容性
 */
export function migrateThemeSettings(): ThemeType | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedTheme = localStorage.getItem('theme');
    
    if (!savedTheme) {
      return null;
    }

    // 验证主题是否为有效的主题类型
    const validThemes: ThemeType[] = ['light', 'dark', 'yellow', 'starry-sky'];
    
    if (validThemes.includes(savedTheme as ThemeType)) {
      return savedTheme as ThemeType;
    }

    // 如果是无效的主题，清除localStorage并返回null
    localStorage.removeItem('theme');
    console.warn(`无效的主题设置已清除: ${savedTheme}`);
    return null;
    
  } catch (error) {
    console.error('主题迁移过程中发生错误:', error);
    return null;
  }
}

/**
 * 获取系统偏好的主题
 */
export function getSystemPreferredTheme(): ThemeType {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    console.error('获取系统主题偏好时发生错误:', error);
    return 'light';
  }
}

/**
 * 验证主题类型是否有效
 */
export function isValidTheme(theme: string): theme is ThemeType {
  const validThemes: ThemeType[] = ['light', 'dark', 'yellow', 'starry-sky'];
  return validThemes.includes(theme as ThemeType);
}