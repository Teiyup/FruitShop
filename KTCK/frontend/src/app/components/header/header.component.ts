import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  cartCount = 0;
  showMobileMenu = false;
  isAdmin = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user: any) => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
      this.cdr.detectChanges();
      
      if (user) {
        this.loadCartCount();
      }
    });
    
    this.cartService.cart$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((items: any[]) => {
      this.cartCount = items.reduce((total, item) => total + (item.quantity || 0), 0);
      this.cdr.detectChanges();
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadCartCount(): void {
    if (!this.currentUser) return;
    
    this.cartService.getCart(this.currentUser.id).subscribe((items: any[]) => {
      this.cartCount = items.reduce((total, item) => total + (item.quantity || 0), 0);
      this.cdr.detectChanges();
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.showMobileMenu = false;
  }
}
