import React, { useState } from 'react';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import MainContent from './layout/MainContent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isSettingsOpen={isSettingsOpen}
        onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  );
};

export default Layout;