import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, UtensilsCrossed, Search } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      path: '/orders',
      active: location.pathname.startsWith('/orders')
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: UtensilsCrossed,
      path: '/menu',
      active: location.pathname === '/menu'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/search',
      active: location.pathname === '/search'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 text-xs transition-colors ${
                item.active
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <IconComponent className={`w-5 h-5 mb-1 ${item.active ? 'text-orange-600' : 'text-gray-600'}`} />
              <span className={`truncate ${item.active ? 'font-medium text-orange-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;