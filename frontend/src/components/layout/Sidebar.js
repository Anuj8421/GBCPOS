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
    <div className="w-64 bg-brand-navy border-r border-brand-navy flex flex-col pt-16" data-testid="sidebar">
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
                  ? 'bg-brand-orange text-white'
                  : 'text-white/80 hover:bg-white/10'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Version Info */}
      <div className="p-4 border-t border-white/10 text-xs text-white/60 text-center">
        iMin Swift 2 Pro<br />v1.0.0
      </div>
    </div>
  );
};

export default Sidebar;