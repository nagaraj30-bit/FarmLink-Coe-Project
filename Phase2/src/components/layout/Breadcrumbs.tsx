import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const path = location.pathname;

  if (path === '/') return null;

  const getBreadcrumbItems = () => {
    const items: { label: string; to?: string }[] = [
      { label: language === 'ta' ? 'முகப்பு' : 'Home', to: '/' },
    ];

    if (path.startsWith('/farmer')) {
      items.push({
        label: language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard',
        to: path === '/farmer' ? undefined : '/farmer',
      });
    } else if (path.startsWith('/my-listings')) {
      items.push({
        label: language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard',
        to: '/farmer',
      });
      items.push({
        label: language === 'ta' ? 'எனது விளைபொருட்கள்' : 'My Listings',
      });
    } else if (path.startsWith('/add-produce')) {
      items.push({
        label: language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard',
        to: '/farmer',
      });
      items.push({
        label: language === 'ta' ? 'விளைபொருள் சேர்க்க' : 'Add Produce',
      });
    } else if (path.startsWith('/offers/')) {
      items.push({
        label: language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard',
        to: '/farmer',
      });
      items.push({
        label: language === 'ta' ? 'வாய்ப்புகள் ஒப்பீடு' : 'Compare Offers',
      });
    } else if (path.startsWith('/marketplace')) {
      items.push({
        label: language === 'ta' ? 'கொள்முதல் சந்தை' : 'Marketplace',
        to: path === '/marketplace' ? undefined : '/marketplace',
      });
    } else if (path.startsWith('/produce/')) {
      items.push({
        label: language === 'ta' ? 'கொள்முதல் சந்தை' : 'Marketplace',
        to: '/marketplace',
      });
      items.push({
        label: language === 'ta' ? 'விளைபொருள் விவரம்' : 'Produce Details',
      });
    } else if (path.startsWith('/make-offer/')) {
      items.push({
        label: language === 'ta' ? 'கொள்முதல் சந்தை' : 'Marketplace',
        to: '/marketplace',
      });
      items.push({
        label: language === 'ta' ? 'விலை வாய்ப்பு' : 'Submit Offer',
      });
    } else if (path === '/roles') {
      items.push({
        label: language === 'ta' ? 'பயனர் தேர்வு' : 'Role Selection',
      });
    } else if (path === '/login') {
      items.push({
        label: language === 'ta' ? 'உள்நுழைவு' : 'Sign In',
      });
    } else if (path === '/register') {
      items.push({
        label: language === 'ta' ? 'பதிவு' : 'Register',
      });
    } else if (path.startsWith('/buyer/my-offers')) {
      items.push({
        label: language === 'ta' ? 'கொள்முதல் சந்தை' : 'Marketplace',
        to: '/marketplace',
      });
      items.push({
        label: language === 'ta' ? 'எனது சலுகைகள்' : 'My Offers',
      });
    } else if (path.startsWith('/profile')) {
      items.push({
        label: language === 'ta' ? 'விவசாயி டாஷ்போர்டு' : 'Farmer Dashboard',
        to: '/farmer',
      });
      items.push({
        label: language === 'ta' ? 'சுயவிவர மேலாண்மை' : 'Farmer Profile',
      });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbItems();

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-1 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
      {breadcrumbs.map((item, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx === 0 && <Home className="w-3.5 h-3.5 text-slate-400 mr-0.5" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-emerald-800 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-bold text-slate-800' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
