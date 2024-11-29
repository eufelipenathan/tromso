// src/components/pipeline/DealCard.tsx

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Deal } from '@/types/pipeline';

interface DealCardProps {
  deal: Deal;
  children: React.ReactNode;
}

const DealCard: React.FC<DealCardProps> = ({ deal, children }) => {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id!,
      data: deal,
    });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/deals/${deal.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="relative touch-none select-none"
      style={{
        opacity: isDragging ? 0 : undefined,
        transform: CSS.Transform.toString(transform),
        transition: transform ? undefined : 'transform 200ms ease',
      }}
    >
      <div className={isDragging ? 'cursor-grabbing' : 'cursor-pointer'}>
        {children}
      </div>
    </div>
  );
};

export default DealCard;
