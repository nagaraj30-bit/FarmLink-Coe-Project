import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoUser } from '../../hooks/useDemoUser';
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  ListOrdered,
  UserCheck,
  Home,
  LogIn,
  UserPlus,
  ShoppingBag,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const { isFarmer, isGuest, currentUser } = useDemoUser();

  const getLinks = () => {
    if (isGuest || !currentUser) {
      return [
        {
          id: 'nav-home',
          to: '/',
          label: language === 'ta' ? 'முகப்பு' : 'Home',
          icon: <Home className="w-5 h-5" />,
        },
        {
          id: 'nav-marketplace',
          to: '/marketplace',
          label: language === 'ta' ? 'சந்தை' : 'Marketplace',
          icon: <Store className="w-5 h-5" />,
        },
        {
          id: 'nav-login',
          to: '/login',
          label: language === 'ta' ? 'உள்நுழை' : 'Sign In',
          icon: <LogIn className="w-5 h-5" />,
        },
        {
          id: 'nav-register',
          to: '/register',
          label: language === 'ta' ? 'பதிவு' : 'Register',
          icon: <UserPlus className="w-5 h-5" />,
        },
        {
          id: 'nav-roles',
          to: '/roles',
          label: language === 'ta' ? 'டெமோ' : 'Demo',
          icon: <UserCheck className="w-5 h-5" />,
        },
      ];
    }

    if (isFarmer) {
      return [
        {
          id: 'nav-farmer-dashboard',
          to: '/farmer',
          label: language === 'ta' ? 'டாஷ்போர்டு' : 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          id: 'nav-marketplace',
          to: '/marketplace',
          label: language === 'ta' ? 'சந்தை' : 'Marketplace',
          icon: <Store className="w-5 h-5" />,
        },
        {
          id: 'nav-add-produce',
          to: '/add-produce',
          label: language === 'ta' ? 'சேர்க்க' : 'Add',
          icon: <PlusCircle className="w-5 h-5" />,
        },
        {
          id: 'nav-my-listings',
          to: '/my-listings',
          label: language === 'ta' ? 'இருப்பு' : 'Listings',
          icon: <ListOrdered className="w-5 h-5" />,
        },
        {
          id: 'nav-roles',
          to: '/roles',
          label: language === 'ta' ? 'பயனர்' : 'Persona',
          icon: <UserCheck className="w-5 h-5" />,
        },
      ];
    }

    // Buyer mode
    return [
      {
        id: 'nav-marketplace',
        to: '/marketplace',
        label: language === 'ta' ? 'சந்தை' : 'Marketplace',
        icon: <Store className="w-5 h-5" />,
      },
      {
        id: 'nav-buyer-offers',
        to: '/buyer/my-offers',
        label: language === 'ta' ? 'சலுகைகள்' : 'My Offers',
        icon: <ShoppingBag className="w-5 h-5" />,
      },
      {
        id: 'nav-roles',
        to: '/roles',
        label: language === 'ta' ? 'பயனர்' : 'Persona',
        icon: <UserCheck className="w-5 h-5" />,
      },
    ];
  };

  const links = getLinks();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
                {item.icon}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
