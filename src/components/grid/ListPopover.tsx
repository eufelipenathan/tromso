import React, { useState } from 'react';
import { Popover } from '@mui/material';
import { ContactField } from '@/types';

interface ListPopoverProps {
  items: ContactField[];
  maxVisible?: number;
  title?: string;
  truncateAt?: number;
  wrapLongText?: boolean;
}

const ListPopover: React.FC<ListPopoverProps> = ({ 
  items = [], 
  maxVisible = 1,
  title = 'Itens',
  truncateAt,
  wrapLongText = false
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!items?.length) return <>-</>;

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;
  const showMore = remainingCount > 0;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const truncateText = (text: string) => {
    if (!truncateAt) return text;
    return text.length > truncateAt 
      ? `${text.substring(0, truncateAt)}...` 
      : text;
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div 
        className="cursor-pointer text-gray-900 hover:text-gray-700"
        onClick={handleClick}
      >
        {truncateText(visibleItems[0].value)}
        {showMore && (
          <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
            +{remainingCount}
          </span>
        )}
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 max-w-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
          <div className="space-y-1">
            {items.map((item, index) => (
              <div 
                key={item.id || index}
                className={`text-sm text-gray-600 ${wrapLongText ? 'break-words' : ''}`}
              >
                {item.value}
              </div>
            ))}
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ListPopover;