import React from 'react';
import { Bell, Power, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const Header = () => {
  const { user, logout } = useAuth();
  const { storeStatus, setStoreStatus, notifications } = useApp();

  const handleStatusToggle = (checked) => {
    setStoreStatus(checked ? 'open' : 'closed');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  return (
    <header className="h-16 bg-brand-orange border-b border-brand-orange/80 flex items-center justify-between" data-testid="header">
      {/* Logo Section */}
      <div className="w-64 h-full flex items-center justify-center border-r border-white/20">
        <img 
          src="/gbc-logo-dashboard-v2.png" 
          alt="GBC Logo" 
          className="h-12 w-auto"
        />
      </div>

      {/* Store Status and Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Store Status:</span>
          <Switch
            checked={storeStatus === 'open'}
            onCheckedChange={handleStatusToggle}
            data-testid="store-status-toggle"
          />
          <Badge
            variant={storeStatus === 'open' ? 'default' : 'secondary'}
            className={storeStatus === 'open' ? 'bg-green-600' : 'bg-gray-500'}
            data-testid="store-status-badge"
          >
            {storeStatus === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-white/10" data-testid="notifications-button">
              <Bell className="w-5 h-5 text-white" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id}>
                  {notification.message}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 hover:bg-white/10" data-testid="user-menu-button">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <User className="w-4 h-4 text-brand-orange" />
              </div>
              <span className="text-sm font-medium text-white">{user?.name || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} data-testid="logout-button">
              <Power className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;