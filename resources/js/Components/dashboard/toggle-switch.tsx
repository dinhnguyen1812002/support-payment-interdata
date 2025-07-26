import React, { useEffect, useState } from 'react';
import { Switch } from '@/Components/ui/switch';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '@/Components/theme-provider';

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || theme === undefined) {
    return null;
  }

  const isDark = theme === 'dark';

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        {isDark ? (
          <MoonStar size={14} className="text-blue-400" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
        <span className="text-sm font-medium">
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={handleThemeChange}
        aria-label="Toggle theme"
        className="scale-75"
      />
    </div>
  );
}
