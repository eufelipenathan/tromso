import React from 'react';
import { useLocation } from 'react-router-dom';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if current page is a settings page with sidebar
  const isSettingsPage = location.pathname.startsWith('/settings/');
  
  return (
    <main className={`
      flex-1 overflow-auto
      ${isSettingsPage 
        ? 'p-4 sm:py-6 sm:pr-6 sm:pl-0' // Remove left padding for settings pages
        : 'p-4 sm:p-6' // Keep full padding for other pages
      }
    `}>
      {children}
    </main>
  );
};

export default MainContent;