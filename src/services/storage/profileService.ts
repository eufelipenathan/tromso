import { StorageService } from './storageService';
import { CacheService } from './cacheService';

class ProfileService {
  private storage: StorageService;
  private cache: CacheService;

  constructor() {
    this.storage = new StorageService('profiles');
    this.cache = new CacheService('profiles', 60); // 1 hour cache
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const path = `${userId}/avatar`;
    const url = await this.storage.upload(file, path);
    
    // Cache the URL
    this.cache.set(`avatar:${userId}`, url);
    
    return url;
  }

  async deleteAvatar(userId: string): Promise<void> {
    const path = `${userId}/avatar`;
    await this.storage.delete(path);
    this.cache.remove(`avatar:${userId}`);
  }

  async getAvatarUrl(userId: string): Promise<string> {
    const cacheKey = `avatar:${userId}`;
    
    // Try cache first
    const cachedUrl = this.cache.get<string>(cacheKey);
    if (cachedUrl) return cachedUrl;

    // Get from storage and cache
    const url = await this.storage.getUrl(`${userId}/avatar`);
    this.cache.set(cacheKey, url);
    return url;
  }
}

export const profileService = new ProfileService();