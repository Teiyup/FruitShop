import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api';
  private cartSubject = new BehaviorSubject<any[]>([]);
  public cart$ = this.cartSubject.asObservable();
  
  constructor(private http: HttpClient) { }
  
  getCart(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cart/${userId}`);
  }
  
  addToCart(userId: string, fruitId: string, quantity: number): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/cart/${userId}`, { fruitId, quantity });
  }
  
  updateCartItem(userId: string, fruitId: string, quantity: number): Observable<any[]> {
    return this.http.put<any[]>(`${this.apiUrl}/cart/${userId}/${fruitId}`, { quantity });
  }
  
  removeFromCart(userId: string, fruitId: string): Observable<any[]> {
    return this.http.delete<any[]>(`${this.apiUrl}/cart/${userId}/${fruitId}`);
  }
  
  clearCart(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cart/${userId}`);
  }
  
  updateCartLocal(items: any[]): void {
    this.cartSubject.next(items);
  }
}
