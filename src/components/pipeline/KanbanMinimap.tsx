import React, { useRef, useEffect, useState } from 'react';
import { PipelineStage } from '@/types/pipeline';

interface KanbanMinimapProps {
  stages: PipelineStage[];
  scrollInfo: {
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
  };
  onScroll: (scrollLeft: number) => void;
}

const KanbanMinimap: React.FC<KanbanMinimapProps> = ({
  stages,
  scrollInfo,
  onScroll
}) => {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  const { scrollLeft, scrollWidth, clientWidth } = scrollInfo;
  const scrollableWidth = scrollWidth - clientWidth;
  const viewportRatio = clientWidth / scrollWidth;
  const minimapWidth = 114;
  const minimapHeight = 30;
  const viewportWidth = Math.max(minimapWidth * viewportRatio, 42);
  const maxPosition = minimapWidth - viewportWidth;
  const position = (scrollLeft / scrollableWidth) * maxPosition;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const minimapRect = minimapRef.current?.getBoundingClientRect();
      if (!minimapRect) return;

      // Calcula a posição relativa ao minimap
      let relativeX = e.clientX - minimapRect.left;
      
      // Limita a posição dentro dos limites do minimap
      relativeX = Math.max(0, Math.min(relativeX, minimapWidth));
      
      // Calcula o novo scroll baseado na posição relativa
      const percentageMoved = (relativeX - startX) / maxPosition;
      const newScrollLeft = startScrollLeft + (percentageMoved * scrollableWidth);
      onScroll(Math.max(0, Math.min(scrollableWidth, newScrollLeft)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, startX, startScrollLeft, maxPosition, scrollableWidth, onScroll, minimapWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = minimapRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.target === minimapRef.current) {
      const clickPosition = e.clientX - rect.left;
      const percentageClicked = clickPosition / minimapWidth;
      const newScrollLeft = percentageClicked * scrollableWidth;
      onScroll(Math.max(0, Math.min(scrollableWidth, newScrollLeft)));
    } else {
      setIsDragging(true);
      setStartX(e.clientX - rect.left);
      setStartScrollLeft(scrollLeft);
    }
  };

  return (
    <div className="fixed bottom-16 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-lg p-1.5">
        <div 
          className="relative w-[114px] h-[40px] bg-gray-100 rounded-md overflow-hidden"
          ref={minimapRef}
          onMouseDown={handleMouseDown}
        >
          {/* Colunas do minimap */}
          <div className="absolute inset-0 flex">
            {stages.map((_, index) => (
              <div 
                key={index}
                className="flex-1 border-r border-gray-300 last:border-0 bg-gray-200"
              />
            ))}
          </div>

          {/* Viewport indicator */}
          <div
            className="absolute top-0 h-full bg-blue-500/40 hover:bg-blue-500/50 rounded-md transition-colors shadow-sm"
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

export default KanbanMinimap;