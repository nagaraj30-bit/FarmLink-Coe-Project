import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileTopBar } from './MobileTopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-[#faf8f5] text-[#1f2923]">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar with Breadcrumbs & Profile Switcher */}
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Mobile Top Bar */}
        <MobileTopBar />

        {/* Page Content (with bottom padding on mobile for fixed bottom nav) */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
