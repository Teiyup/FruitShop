import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<string[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  private storageKey = 'wishlist';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.wishlistSubject.next(JSON.parse(saved));
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.wishlistSubject.value));
  }

  addToWishlist(fruitId: string): void {
    const current = this.wishlistSubject.value;
    if (!current.includes(fruitId)) {
      this.wishlistSubject.next([...current, fruitId]);
      this.saveToStorage();
    }
  }

  removeFromWishlist(fruitId: string): void {
    const current = this.wishlistSubject.value.filter(id => id !== fruitId);
    this.wishlistSubject.next(current);
    this.saveToStorage();
  }

  toggleWishlist(fruitId: string): void {
    if (this.isInWishlist(fruitId)) {
      this.removeFromWishlist(fruitId);
    } else {
      this.addToWishlist(fruitId);
    }
  }

  isInWishlist(fruitId: string): boolean {
    return this.wishlistSubject.value.includes(fruitId);
  }

  getWishlist(): string[] {
    return this.wishlistSubject.value;
  }
}
