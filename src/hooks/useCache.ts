import { useCallback } from 'react';
import { CacheService } from '@/services/storage';

export function useCache(prefix: string, ttlInMinutes?: number) {
  const cache = new CacheService(prefix, ttlInMinutes);

  const set = useCallback(<T>(key: string, value: T) => {
    cache.set(key, value);
  }, [cache]);

  const get = useCallback(<T>(key: string) => {
    return cache.get<T>(key);
  }, [cache]);

  const remove = useCallback((key: string) => {
    cache.remove(key);
  }, [cache]);

  const clear = useCallback(() => {
    cache.clear();
  }, [cache]);

  return {
    set,
    get,
    remove,
    clear
  };
}