import { Menu, Moon, Sun, UserPlus, ChevronDown } from 'lucide-react';
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
import { useUiStore } from '@/stores/ui-store';

export function Header() {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white px-4 md:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Invite">
          <UserPlus className="h-[18px] w-[18px]" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 rounded-full p-0.5 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8 bg-[#eef2ff]">
                <AvatarFallback className="bg-[#eef2ff] text-[#006BFF]">K</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Karthik Reddy</span>
                <span className="text-xs text-muted-foreground">demo@calendly.clone</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Toggle theme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
