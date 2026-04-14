import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FruitService {
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) { }
  
  getFruits(search?: string): Observable<any[]> {
    let url = `${this.apiUrl}/fruits`;
    if (search) {
      url += `?search=${search}`;
    }
    return this.http.get<any[]>(url);
  }
  
  getFruitById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fruits/${id}`);
  }
  
  addFruit(fruit: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/fruits`, fruit, { headers });
  }
  
  updateFruit(id: string, fruit: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.apiUrl}/fruits/${id}`, fruit, { headers });
  }
  
  deleteFruit(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(`${this.apiUrl}/fruits/${id}`, { headers });
  }
  
  seedData(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/seed`, {}, { headers });
  }
}
