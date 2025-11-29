import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { GlobalSearch } from './GlobalSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { NotificationDropdown } from '@/components/NotificationDropdown';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Global Search */}
      <div className="flex-shrink-0">
        <GlobalSearch />
      </div>

      {/* Notification - Centered on mobile, with user menu on tablet+ */}
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-secondary rounded-lg px-2 md:px-3 py-2 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-foreground">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-muted-foreground">Staff</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-error">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
