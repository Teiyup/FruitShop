import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  public toast$ = this.toastSubject.asObservable();

  private idCounter = 0;

  constructor() { }

  private show(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number = 3000): void {
    const id = `toast-${++this.idCounter}`;
    const toast: Toast = { id, message, type, duration };

    const toasts = this.toastSubject.value;
    this.toastSubject.next([...toasts, toast]);

    setTimeout(() => {
      const updatedToasts = this.toastSubject.value.filter(t => t.id !== id);
      this.toastSubject.next(updatedToasts);
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 4000);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
}
