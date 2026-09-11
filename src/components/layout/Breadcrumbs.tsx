import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (path === '/') {
      return [{ label: 'Home' }];
    }

    if (path === '/roles') {
      return [{ label: 'Home', to: '/' }, { label: 'Demo profiles' }];
    }

    if (path === '/farmer') {
      return [{ label: 'Dashboard' }];
    }

    if (path === '/farmer/listings') {
      return [{ label: 'Dashboard', to: '/farmer' }, { label: 'My listings' }];
    }

    if (path === '/farmer/add-produce' || path === '/farmer/add-listing') {
      return [{ label: 'Dashboard', to: '/farmer' }, { label: 'Add produce' }];
    }

    if (path.startsWith('/farmer/listings/') && path.endsWith('/offers')) {
      return [
        { label: 'Dashboard', to: '/farmer' },
        { label: 'My listings', to: '/farmer/listings' },
        { label: 'Compare offers' },
      ];
    }

    if (path === '/marketplace' || path === '/buyer') {
      return [{ label: 'Marketplace' }];
    }

    if (path.startsWith('/listing/') && path.endsWith('/offer')) {
      const listingId = path.split('/')[2];
      return [
        { label: 'Marketplace', to: '/marketplace' },
        { label: 'Produce details', to: `/listing/${listingId}` },
        { label: 'Make offer' },
      ];
    }

    if (path.startsWith('/listing/')) {
      return [{ label: 'Marketplace', to: '/marketplace' }, { label: 'Produce details' }];
    }

    return [{ label: 'Home', to: '/' }, { label: 'Page' }];
  };

  const items = getBreadcrumbs();

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center text-xs text-stone-600 font-medium">
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-stone-400 select-none" aria-hidden="true">&gt;</span>}
              {isLast || !item.to ? (
                <span className="font-semibold text-stone-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-stone-600 hover:text-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm outline-hidden transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
