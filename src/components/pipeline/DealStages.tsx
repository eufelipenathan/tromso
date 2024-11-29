import React, { useState, useEffect } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  order: number;
}

interface DealStagesProps {
  stages: Stage[];
  currentStage: string;
  dealId: string;
}

const DealStages: React.FC<DealStagesProps> = ({
  stages,
  currentStage: initialStage,
  dealId
}) => {
  const [currentStage, setCurrentStage] = useState(initialStage);
  const [animatingStage, setAnimatingStage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStage(initialStage);
  }, [initialStage]);

  const handleStageClick = async (stageId: string) => {
    if (stageId === currentStage) return;

    // Inicia animação
    setAnimatingStage(stageId);
    setCurrentStage(stageId);

    try {
      await updateDoc(doc(db, 'deals', dealId), {
        stageId,
        updatedAt: new Date()
      });
    } catch (error) {
      setCurrentStage(currentStage);
      console.error('Error updating deal stage:', error);
    } finally {
      // Remove animação após 600ms
      setTimeout(() => {
        setAnimatingStage(null);
      }, 600);
    }
  };

  const getCurrentStageOrder = () => {
    const currentStageData = stages.find(s => s.id === currentStage);
    return currentStageData?.order || 0;
  };

  return (
    <div className="w-full overflow-x-auto hide-scrollbar relative z-[100]">
      <div className="min-w-max px-8">
        <div className="flex items-center relative py-8">
          {stages.map((stage, index) => {
            const isActive = stage.id === currentStage;
            const isComplete = stage.order < getCurrentStageOrder();
            const isAnimating = stage.id === animatingStage;
            
            return (
              <React.Fragment key={stage.id}>
                <div className="flex-1 relative min-w-[120px] first:ml-3">
                  {/* Barra de progresso com animação de fluxo */}
                  <div 
                    className={`
                      absolute top-3 left-0 right-0 h-1 transition-all duration-500
                      ${index === 0 ? 'left-1/2' : ''}
                      ${index === stages.length - 1 ? 'right-1/2' : ''}
                      ${isComplete || isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200'}
                      ${isComplete || isActive ? 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent after:animate-shimmer' : ''}
                    `}
                  />

                  <div className="relative flex flex-col items-center">
                    <button
                      onClick={() => handleStageClick(stage.id)}
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center
                        transition-all duration-500 mb-3 relative z-10
                        transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isComplete 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 ring-blue-200 hover:from-blue-600 hover:to-blue-700 shadow-lg' 
                          : isActive
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 ring-blue-200 hover:from-blue-600 hover:to-blue-700 shadow-lg scale-110'
                            : 'bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }
                        ${!isActive && !isComplete ? 'cursor-pointer' : ''}
                        ${isAnimating ? 'animate-bounce-small' : ''}
                      `}
                    >
                      {isComplete ? (
                        <Check 
                          className={`
                            h-4 w-4 text-white
                            ${isAnimating ? 'animate-spin-once' : ''}
                          `}
                        />
                      ) : (
                        <div 
                          className={`
                            w-2 h-2 rounded-full transition-all duration-500
                            ${isActive ? 'bg-white scale-125' : 'bg-gray-300 group-hover:bg-blue-500'}
                          `}
                        />
                      )}
                    </button>

                    <div 
                      className={`
                        text-sm font-medium text-center px-3
                        transition-all duration-500
                        ${isComplete || isActive 
                          ? 'text-blue-600 transform translate-y-1 scale-105' 
                          : 'text-gray-500'
                        }
                        ${isAnimating ? 'animate-pulse' : ''}
                      `}
                    >
                      {stage.name}
                    </div>

                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-500">
                        <div className="absolute inset-0 bg-blue-400 animate-progress-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DealStages;