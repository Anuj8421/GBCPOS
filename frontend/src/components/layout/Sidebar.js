import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Store, 
  TrendingUp, 
  DollarSign,
  Users,
  Settings,
  ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: UtensilsCrossed, label: 'Menu', path: '/menu' },
    { icon: Store, label: 'Store', path: '/store' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: DollarSign, label: 'Finance', path: '/finance' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="w-64 bg-brand-navy border-r border-brand-navy flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4 bg-white">
        <img 
          src="/gbc-logo.png" 
          alt="GBC Logo" 
          className="h-12 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" data-testid="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                isActive(item.path)
                  ? 'bg-brand-orange/10 text-brand-orange'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Info */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        iMin Swift 2 Pro<br />v1.0.0
      </div>
    </div>
  );
};

export default Sidebar;