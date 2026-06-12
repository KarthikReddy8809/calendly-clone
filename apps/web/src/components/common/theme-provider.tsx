import { useEffect } from 'react';
import { useUiStore } from '@/stores/ui-store';

/** Applies the persisted theme to the document root. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
