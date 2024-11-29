import { StorageService } from './storageService';
import { CacheService } from './cacheService';

class DocumentService {
  private storage: StorageService;
  private cache: CacheService;

  constructor() {
    this.storage = new StorageService('documents');
    this.cache = new CacheService('documents', 15); // 15 minutes cache
  }

  async upload(file: File, dealId: string): Promise<string> {
    const path = `${dealId}/${file.name}`;
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

  async getUrls(paths: string[]): Promise<string[]> {
    return Promise.all(paths.map(path => this.getUrl(path)));
  }
}

export const documentService = new DocumentService();