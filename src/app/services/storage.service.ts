import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'pokedex_';

  /**
   * Save data to localStorage with prefix
   */
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${this.PREFIX}${key}`, serialized);
    } catch (error) {
      console.error(`Failed to save to localStorage [${key}]:`, error);
    }
  }

  /**
   * Get data from localStorage with prefix
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error(`Failed to read from localStorage [${key}]:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to remove from localStorage [${key}]:`, error);
    }
  }

  /**
   * Clear all items with our prefix
   */
  clear(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.PREFIX)) {
        result.push(key.replace(this.PREFIX, ''));
      }
    }
    return result;
  }
}
