import React from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface DealTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const DealTabs: React.FC<DealTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="border-b bg-white">
      <nav className="px-4 sm:px-6 flex overflow-x-auto hide-scrollbar">
        <div className="flex space-x-4 sm:space-x-8 min-w-full sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex-shrink-0
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  ml-2 rounded-full text-xs px-2 py-0.5
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DealTabs;