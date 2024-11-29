// src/components/pipeline/KanbanBoard.tsx

import React, { useRef, useEffect, forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Deal, PipelineStage } from '@/types/pipeline';
import DealCard from './DealCard';

interface KanbanBoardProps {
  stages: PipelineStage[];
  deals: Deal[];
  renderCard: (deal: Deal) => React.ReactNode;
  onScroll?: (info: {
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
  }) => void;
}

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  renderCard: (deal: Deal) => React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  deals,
  renderCard,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id!,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{stage.name}</h3>
          <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            {deals.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`
          bg-white rounded-lg h-full overflow-y-auto
          border border-gray-200
          transition-all duration-200 ease-in-out
          ${isOver ? 'ring-2 ring-blue-100 border-blue-200 bg-blue-50/50' : ''}
        `}
      >
        <div className="p-4 space-y-3">
{deals.map((deal) => (
  <DealCard key={deal.id} deal={deal}>
    <div className="hover:shadow-sm hover:scale-[1.005] transition-all duration-300">
      {renderCard(deal)}
    </div>
  </DealCard>
))}

          {deals.length === 0 && (
            <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 select-none">
                Arraste um negócio para esta etapa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = forwardRef<HTMLDivElement, KanbanBoardProps>(
  ({ stages, deals, renderCard, onScroll }, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<{
      animationFrame: number | null;
      velocity: number;
    }>({
      animationFrame: null,
      velocity: 0,
    });

    useEffect(() => {
      return () => {
        if (autoScrollRef.current.animationFrame) {
          cancelAnimationFrame(autoScrollRef.current.animationFrame);
        }
      };
    }, []);

    useEffect(() => {
      const handleScroll = () => {
        if (scrollContainerRef.current && onScroll) {
          onScroll({
            scrollLeft: scrollContainerRef.current.scrollLeft,
            scrollWidth: scrollContainerRef.current.scrollWidth,
            clientWidth: scrollContainerRef.current.clientWidth,
          });
        }
      };

      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        handleScroll();

        const resizeObserver = new ResizeObserver(handleScroll);
        resizeObserver.observe(container);

        return () => {
          container.removeEventListener('scroll', handleScroll);
          resizeObserver.disconnect();
        };
      }
    }, [onScroll]);

    const updateScroll = () => {
      if (!scrollContainerRef.current || autoScrollRef.current.velocity === 0) {
        autoScrollRef.current.animationFrame = null;
        return;
      }

      scrollContainerRef.current.scrollLeft += autoScrollRef.current.velocity;
      autoScrollRef.current.animationFrame = requestAnimationFrame(updateScroll);
    };

    const startAutoScroll = (velocity: number) => {
      autoScrollRef.current.velocity = velocity;

      if (!autoScrollRef.current.animationFrame) {
        autoScrollRef.current.animationFrame = requestAnimationFrame(updateScroll);
      }
    };

    const stopAutoScroll = () => {
      autoScrollRef.current.velocity = 0;
      if (autoScrollRef.current.animationFrame) {
        cancelAnimationFrame(autoScrollRef.current.animationFrame);
        autoScrollRef.current.animationFrame = null;
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const { left, right } = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const scrollZone = 150;
      const maxVelocity = 3;

      if (mouseX < left + scrollZone) {
        const distance = mouseX - left;
        const velocity = Math.max(
          -maxVelocity,
          ((distance - scrollZone) * maxVelocity) / scrollZone
        );
        startAutoScroll(velocity);
      } else if (mouseX > right - scrollZone) {
        const distance = right - mouseX;
        const velocity = Math.min(
          maxVelocity,
          ((distance - scrollZone) * maxVelocity) / scrollZone
        );
        startAutoScroll(-velocity);
      } else {
        stopAutoScroll();
      }
    };

    return (
      // Removemos o DndContext daqui
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <div
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
            scrollContainerRef.current = node;
          }}
          className="flex-1 flex space-x-6 overflow-x-auto overflow-y-hidden pb-6 px-2 relative"
          onDragOver={handleDragOver}
          onMouseLeave={stopAutoScroll}
          onDragEnd={stopAutoScroll}
        >
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((deal) => deal.stageId === stage.id)}
              renderCard={renderCard}
            />
          ))}
        </div>

        {/* Removemos o DragOverlay daqui */}
      </div>
    );
  }
);

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;
