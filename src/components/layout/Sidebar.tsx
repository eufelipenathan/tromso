import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  ChevronDown,
  SlidersHorizontal,
  DollarSign,
} from 'lucide-react';

interface SidebarProps {
  isSettingsOpen: boolean;
  onSettingsToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSettingsOpen,
  onSettingsToggle,
}) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Negócios', href: '/deals', icon: DollarSign },
    { name: 'Empresas', href: '/companies', icon: Building2 },
    { name: 'Contatos', href: '/contacts', icon: Users },
  ];

  const settingsNavigation = [
    {
      name: 'Seções e campos',
      href: '/settings/custom-fields',
      icon: SlidersHorizontal,
    },
    { name: 'Pipelines', href: '/settings/pipelines', icon: DollarSign },
  ];

  return (
    <aside className="w-56 bg-gray-900 shadow-xl">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        <span className="text-lg font-bold text-white">CloudCRM</span>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }
              `}
            >
              <Icon
                className={`mr-2.5 h-4 w-4 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Settings Section */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <button
            onClick={onSettingsToggle}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
              ${
                location.pathname.startsWith('/settings')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }
            `}
          >
            <div className="flex items-center">
              <Settings
                className={`mr-2.5 h-4 w-4 ${
                  location.pathname.startsWith('/settings')
                    ? 'text-white'
                    : 'text-gray-500'
                }`}
              />
              Configurações
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                isSettingsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isSettingsOpen && (
            <div className="mt-1 ml-3 space-y-1">
              {settingsNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }
                    `}
                  >
                    <Icon
                      className={`mr-2.5 h-4 w-4 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
