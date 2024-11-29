export class CacheService {
  private prefix: string;
  private ttl: number;

  constructor(prefix: string, ttlInMinutes: number = 5) {
    this.prefix = prefix;
    this.ttl = ttlInMinutes * 60 * 1000;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set<T>(key: string, value: T): void {
    const item = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem(this.getKey(key), JSON.stringify(item));
  }

  get<T>(key: string): T | null {
    const item = localStorage.getItem(this.getKey(key));
    if (!item) return null;

    const { value, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > this.ttl) {
      this.remove(key);
      return null;
    }

    return value as T;
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}