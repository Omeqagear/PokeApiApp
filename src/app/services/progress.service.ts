import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private storage = inject(StorageService);
  private readonly STORAGE_KEY = 'viewed-pokemon';

  private _viewedIds = signal<Set<number>>(new Set(this.storage.get<number[]>('viewed-pokemon') || []));

  viewedCount = computed(() => this._viewedIds().size);
  progressPercent = computed(() => Math.round((this._viewedIds().size / 1025) * 100));

  isViewed(id: number): boolean {
    return this._viewedIds().has(id);
  }

  markViewed(id: number): void {
    if (id <= 0 || id > 1025) return;
    const current = new Set(this._viewedIds());
    current.add(id);
    this._viewedIds.set(current);
    this.storage.set(this.STORAGE_KEY, Array.from(current));
  }

  markUnviewed(id: number): void {
    const current = new Set(this._viewedIds());
    current.delete(id);
    this._viewedIds.set(current);
    this.storage.set(this.STORAGE_KEY, Array.from(current));
  }

  clearProgress(): void {
    this._viewedIds.set(new Set());
    this.storage.remove(this.STORAGE_KEY);
  }
}
