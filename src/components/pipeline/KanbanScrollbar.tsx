import React, { useRef, useEffect, useState } from 'react';
import { PipelineStage } from '@/types/pipeline';

interface KanbanScrollbarProps {
  stages: PipelineStage[];
  scrollInfo: {
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
  };
  onScroll: (scrollLeft: number) => void;
}

const KanbanScrollbar: React.FC<KanbanScrollbarProps> = ({
  stages,
  scrollInfo,
  onScroll
}) => {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  const { scrollLeft, scrollWidth, clientWidth } = scrollInfo;
  const scrollableWidth = scrollWidth - clientWidth;
  const viewportRatio = clientWidth / scrollWidth;
  const viewportWidth = Math.max(clientWidth * viewportRatio, 32);
  const maxPosition = clientWidth - viewportWidth;
  const position = (scrollLeft / scrollableWidth) * maxPosition;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const deltaX = e.clientX - startX;
      const percentageMoved = deltaX / maxPosition;
      const newScrollLeft = startScrollLeft + (percentageMoved * scrollableWidth);
      onScroll(Math.max(0, Math.min(scrollableWidth, newScrollLeft)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, startScrollLeft, maxPosition, scrollableWidth, onScroll]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === scrollbarRef.current) {
      const rect = scrollbarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentageClicked = clickPosition / clientWidth;
      const newScrollLeft = percentageClicked * scrollableWidth;
      onScroll(Math.max(0, Math.min(scrollableWidth, newScrollLeft)));
    } else {
      setIsDragging(true);
      setStartX(e.clientX);
      setStartScrollLeft(scrollLeft);
    }
  };

  return (
    <div className="h-12 px-6 flex items-center">
      <div className="w-full h-2 bg-gray-100 rounded-full shadow-inner">
        <div
          ref={scrollbarRef}
          className="relative w-full h-full"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute top-0 h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{
              width: `${viewportWidth}px`,
              left: `${position}px`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KanbanScrollbar;