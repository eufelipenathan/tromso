import { useDealStore } from '@/stores/dealStore';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { Deal } from '@/types/pipeline';

export function useDeals() {
  const {
    deals,
    setDeals,
    addDeal,
    updateDeal,
    removeDeal,
    getDeal,
    getDealsForPipeline
  } = useDealStore();

  const { execute } = useOptimisticUpdate<Deal>();

  const optimisticUpdateDeal = async (
    id: string,
    updates: Partial<Deal>,
    updateFn: () => Promise<void>
  ) => {
    const deal = getDeal(id);
    if (!deal) return;

    const updatedDeal = { ...deal, ...updates };

    await execute(
      updateFn,
      updatedDeal,
      deal,
      {
        loadingKey: `update-deal-${id}`,
        onSuccess: () => {
          updateDeal(id, updates);
        }
      }
    );
  };

  return {
    deals,
    setDeals,
    addDeal,
    updateDeal: optimisticUpdateDeal,
    removeDeal,
    getDeal,
    getDealsForPipeline
  };
}