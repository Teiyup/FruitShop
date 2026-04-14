import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  private compareSubject = new BehaviorSubject<any[]>([]);
  compare$ = this.compareSubject.asObservable();
  
  private storageKey = 'compareProducts';
  private maxCompare = 3;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.compareSubject.next(JSON.parse(stored));
      } catch (e) {
        this.compareSubject.next([]);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.compareSubject.value));
  }

  addToCompare(product: any): boolean {
    const current = this.compareSubject.value;
    
    // Check if product already in compare
    if (current.some(p => p._id === product._id)) {
      return false;
    }
    
    // Check if we've reached max compare
    if (current.length >= this.maxCompare) {
      return false;
    }
    
    const updated = [...current, product];
    this.compareSubject.next(updated);
    this.saveToStorage();
    return true;
  }

  removeFromCompare(productId: string): void {
    const updated = this.compareSubject.value.filter(p => p._id !== productId);
    this.compareSubject.next(updated);
    this.saveToStorage();
  }

  toggleCompare(product: any): boolean {
    const current = this.compareSubject.value;
    if (current.some(p => p._id === product._id)) {
      this.removeFromCompare(product._id);
      return false;
    } else {
      return this.addToCompare(product);
    }
  }

  isInCompare(productId: string): boolean {
    return this.compareSubject.value.some(p => p._id === productId);
  }

  getCompare(): any[] {
    return this.compareSubject.value;
  }

  clearCompare(): void {
    this.compareSubject.next([]);
    this.saveToStorage();
  }

  getMaxCompare(): number {
    return this.maxCompare;
  }
}
