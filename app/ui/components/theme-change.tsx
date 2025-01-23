'use client';
import { useTheme } from '@/app/provider/theme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme} >
      主题：{theme==='light'?'light':theme==='dark'?'dark':'yellow'}
    </button>
  );
}