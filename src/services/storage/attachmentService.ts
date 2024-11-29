import { StorageService } from './storageService';
import { CacheService } from './cacheService';

class AttachmentService {
  private storage: StorageService;
  private cache: CacheService;

  constructor() {
    this.storage = new StorageService('attachments');
    this.cache = new CacheService('attachments', 30); // 30 minutes cache
  }

  async upload(file: File, entityType: string, entityId: string): Promise<string> {
    const path = `${entityType}/${entityId}/${file.name}`;
    const url = await this.storage.upload(file, path);
    
    // Cache the URL
    this.cache.set(path, url);
    
    return url;
  }

  async delete(path: string): Promise<void> {
    await this.storage.delete(path);
    this.cache.remove(path);
  }

  async getUrl(path: string): Promise<string> {
    // Try cache first
    const cachedUrl = this.cache.get<string>(path);
    if (cachedUrl) return cachedUrl;

    // Get from storage and cache
    const url = await this.storage.getUrl(path);
    this.cache.set(path, url);
    return url;
  }
}

export const attachmentService = new AttachmentService();