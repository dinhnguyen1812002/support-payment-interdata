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
    <div className="flex items-center space-x-2  p-2 dark:bg-dark h-10 border-b">
      <Sun
        size={16}
        className={`transition-colors ${!isDark ? 'text-primary' : 'text-muted-foreground'}`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleThemeChange}
        aria-label="Toggle theme"
        className="data-[state=checked]:bg-slate-900 data-[state=unchecked]:text-primary  dark:bg-amber-50"
      />
      <MoonStar
        size={16}
        className={`transition-colors ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`}
      />
    </div>
  );
}
