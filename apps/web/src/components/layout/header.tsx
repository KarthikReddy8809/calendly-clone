import { Menu, Moon, Sun, UserPlus, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from '@tanstack/react-router';
import { useUiStore } from '@/stores/ui-store';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { initials } from '@/lib/utils';
import { useCurrentUser, useLogout } from '@/modules/auth/hooks/use-auth';

export function Header() {
  const { theme, toggleTheme, setMobileNavOpen } = useUiStore();
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => void navigate({ to: '/login', search: { redirect: undefined } }),
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-background px-4 md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </Button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Invite">
          <UserPlus className="h-[18px] w-[18px]" aria-hidden />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex items-center gap-1 rounded-full p-0.5 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="h-8 w-8 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(user?.name ?? '')}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Toggle theme
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
