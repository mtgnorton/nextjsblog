'use client';
import { useTheme } from '@/app/provider/theme';
import { MoonIcon, SunIcon,StarIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
      {/* 如果theme是light，显示 🌙深色*/}
      {/* 如果theme是dark，显示 🌟 黄色*/}
      {/* 如果theme是yellow，显示 🌞 浅色*/}
  return (


    <button 
      onClick={toggleTheme}
      className={`px-2 py-1 rounded-lg ${theme === 'light' ? 'bg-dark text-light' : theme === 'dark' ? 'bg-yellow text-dark' : 'bg-light text-dark'} hover:opacity-80 transition-colors duration-200`}
    >

      {theme === 'light' ? <MoonIcon className="size-6" /> : theme === 'dark' ? <StarIcon className="size-6" /> : <SunIcon className="size-6" />}
    </button>
  );
}