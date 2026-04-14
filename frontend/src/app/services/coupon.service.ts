import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Get all coupons (admin only)
  getCoupons(token: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/coupons`, { headers });
  }

  // Create coupon (admin only)
  createCoupon(couponData: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/coupons`, couponData, { headers });
  }

  // Update coupon (admin only)
  updateCoupon(couponId: string, couponData: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.apiUrl}/coupons/${couponId}`, couponData, { headers });
  }

  // Delete coupon (admin only)
  deleteCoupon(couponId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(`${this.apiUrl}/coupons/${couponId}`, { headers });
  }

  // Validate coupon
  validateCoupon(code: string, orderTotal: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validate-coupon`, { code, orderTotal });
  }
}
