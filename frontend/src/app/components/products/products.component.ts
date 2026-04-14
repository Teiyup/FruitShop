import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FruitService } from '../../services/fruit.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WishlistService } from '../../services/wishlist.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  fruits: any[] = [];
  allFruits: any[] = [];
  loading = false;
  searchQuery = '';
  selectedFruit: any = null;
  showModal = false;
  addedToCart = false;
  quantity = 1;
  Math = Math;  // Expose Math to template
  
  // New filters
  selectedCategory = '';
  categories: string[] = [];
  sortBy = 'name'; // 'name', 'price-low', 'price-high'
  
  // Wishlist
  wishlistIds: string[] = [];
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(
    private fruitService: FruitService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private wishlistService: WishlistService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    this.loadFruits();
    
    // Subscribe to wishlist changes
    this.wishlistService.wishlist$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(ids => {
      this.wishlistIds = ids;
      this.cdr.detectChanges();
    });
    
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.search();
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadFruits(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.fruitService.getFruits().subscribe(
      (data: any[]) => {
        this.allFruits = data;
        this.fruits = data;
        // Extract unique categories
        this.categories = [...new Set(data.map((f: any) => f.category))].sort();
        this.applyFiltersAndSort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi tải sản phẩm. Vui lòng thử lại!');
        console.error('Lỗi tải sản phẩm:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }
  
  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }
  
  search(): void {
    if (!this.searchQuery.trim()) {
      this.fruits = this.allFruits;
      this.applyFiltersAndSort();
      return;
    }
    
    this.loading = true;
    this.cdr.detectChanges();
    this.fruitService.getFruits(this.searchQuery).subscribe(
      (data: any[]) => {
        this.allFruits = data;
        this.fruits = data;
        this.applyFiltersAndSort();
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi tìm kiếm sản phẩm!');
        console.error('Lỗi tìm kiếm:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  applyFiltersAndSort(): void {
    let filtered = this.allFruits;
    
    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(f => f.category === this.selectedCategory);
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      if (this.sortBy === 'price-low') {
        return a.price - b.price;
      } else if (this.sortBy === 'price-high') {
        return b.price - a.price;
      } else {
        return a.name.localeCompare(b.name, 'vi');
      }
    });
    
    this.fruits = filtered;
    this.cdr.detectChanges();
  }

  onCategoryChange(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }
  
  openProductModal(fruit: any): void {
    this.selectedFruit = fruit;
    this.showModal = true;
    this.quantity = 1;
    this.addedToCart = false;
  }
  
  closeModal(): void {
    this.showModal = false;
    this.selectedFruit = null;
  }
  
  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      this.router.navigate(['/login']);
      return;
    }
    
    const user = this.authService.getCurrentUser();
    this.cartService.addToCart(user.id, this.selectedFruit._id, this.quantity).subscribe(
      (response: any) => {
        this.cartService.updateCartLocal(response);
        this.toastService.success(`Đã thêm ${this.quantity} ${this.selectedFruit.name} vào giỏ hàng!`);
        this.addedToCart = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeModal();
          this.cdr.detectChanges();
        }, 1500);
      },
      (error: any) => {
        this.toastService.error('Lỗi thêm vào giỏ hàng!');
        console.error('Lỗi thêm vào giỏ:', error);
      }
    );
  }

  toggleWishlist(fruitId: string): void {
    this.wishlistService.toggleWishlist(fruitId);
    const isAdded = this.wishlistService.isInWishlist(fruitId);
    const fruit = this.allFruits.find(f => f._id === fruitId);
    if (isAdded) {
      this.toastService.success(`Đã thêm ${fruit.name} vào yêu thích!`);
    } else {
      this.toastService.info(`Đã xóa ${fruit.name} khỏi yêu thích`);
    }
  }

  isWishlisted(fruitId: string): boolean {
    return this.wishlistIds.includes(fruitId);
  }
}
