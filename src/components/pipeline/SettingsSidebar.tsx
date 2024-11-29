import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  PieChart,
  XCircle,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsSidebarProps {
  customFieldsEntity?: 'company' | 'contact';
  onCustomFieldsEntityChange?: (entity: 'company' | 'contact') => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  customFieldsEntity,
  onCustomFieldsEntityChange,
}) => {
  const location = useLocation();
  const isCustomFieldsPage = location.pathname === '/settings/custom-fields';
  const isPipelinePage = location.pathname.startsWith('/settings/pipelines');

  // Save collapsed state per page type
  const storageKey = `sidebar-collapsed-${
    isCustomFieldsPage ? 'fields' : 'pipelines'
  }`;
  const [isCollapsed, setIsCollapsed] = useLocalStorage(storageKey, false);

  if (!isCustomFieldsPage && !isPipelinePage) return null;

  return (
    <aside
      className={`
        relative bg-white border-r transition-all duration-300
        ${isCollapsed ? 'w-12' : 'w-56'}
      `}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 w-6 h-6 bg-white border rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <nav className={`p-3 ${isCollapsed ? 'hidden' : ''}`}>
        {isCustomFieldsPage && (
          <>
            <button
              onClick={() => onCustomFieldsEntityChange?.('company')}
              className={`
                w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors mb-1
                flex items-center space-x-2
                ${
                  customFieldsEntity === 'company'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>Empresas</span>
            </button>
            <button
              onClick={() => onCustomFieldsEntityChange?.('contact')}
              className={`
                w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors
                flex items-center space-x-2
                ${
                  customFieldsEntity === 'contact'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>Contatos</span>
            </button>
          </>
        )}

        {isPipelinePage && (
          <>
            <Link
              to="/settings/pipelines"
              className={`
                block px-3 py-2 text-xs font-medium rounded-lg transition-colors mb-1
                flex items-center space-x-2
                ${
                  location.pathname === '/settings/pipelines'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <PieChart className="h-4 w-4 flex-shrink-0" />
              <span>Pipelines e etapas</span>
            </Link>
            <Link
              to="/settings/pipelines/loss-reasons"
              className={`
                block px-3 py-2 text-xs font-medium rounded-lg transition-colors
                flex items-center space-x-2
                ${
                  location.pathname === '/settings/pipelines/loss-reasons'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span>Motivos de perda</span>
            </Link>
          </>
        )}
      </nav>

      {/* Collapsed state mini menu */}
      {isCollapsed && (
        <div className="py-3">
          {isCustomFieldsPage && (
            <>
              <button
                onClick={() => onCustomFieldsEntityChange?.('company')}
                title="Empresas"
                className={`
                  w-full p-2 mb-1 flex items-center justify-center
                  ${
                    customFieldsEntity === 'company'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Building2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onCustomFieldsEntityChange?.('contact')}
                title="Contatos"
                className={`
                  w-full p-2 flex items-center justify-center
                  ${
                    customFieldsEntity === 'contact'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Users className="h-4 w-4" />
              </button>
            </>
          )}

          {isPipelinePage && (
            <>
              <Link
                to="/settings/pipelines"
                title="Pipelines e etapas"
                className={`
                  block w-full p-2 mb-1 flex items-center justify-center
                  ${
                    location.pathname === '/settings/pipelines'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <PieChart className="h-4 w-4" />
              </Link>
              <Link
                to="/settings/pipelines/loss-reasons"
                title="Motivos de perda"
                className={`
                  block w-full p-2 flex items-center justify-center
                  ${
                    location.pathname === '/settings/pipelines/loss-reasons'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <XCircle className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      )}
    </aside>
  );
};

export default SettingsSidebar;
