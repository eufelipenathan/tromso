import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const commonIcons = [
    'Banknote', 'BarChart', 'Building2', 'CircleDollarSign', 'Factory', 'Goal', 
    'LineChart', 'PieChart', 'ShoppingBag', 'Store', 'Target', 'Wallet'
  ];

  const SelectedIcon = Icons[value as keyof typeof Icons] || Icons.Banknote;

  return (
    <div className="relative -mt-[1px]">
      {/* Botão de seleção */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 relative shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <SelectedIcon className="h-6 w-6 text-gray-600" />
        <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3" />
      </button>

      {/* Dropdown de ícones */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[999]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[1000] mt-0 p-2 w-[280px] bg-white rounded-lg shadow-lg border border-gray-200 right-[calc(100%+1rem)] top-0">
            <div className="grid grid-cols-4 gap-2">
              {commonIcons.map((iconName) => {
                const Icon = Icons[iconName as keyof typeof Icons];
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center
                      transition-colors
                      ${value === iconName 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-50 text-gray-600'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IconPicker;