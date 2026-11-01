import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

/** Sun/moon button that flips between light and dark. The choice is remembered. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn('text-muted-foreground', className)}
    >
      {theme === 'light' ? (
        <Moon className="h-[18px] w-[18px]" aria-hidden />
      ) : (
        <Sun className="h-[18px] w-[18px]" aria-hidden />
      )}
    </Button>
  );
}
