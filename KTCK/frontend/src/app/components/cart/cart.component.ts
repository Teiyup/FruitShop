import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { CouponService } from '../../services/coupon.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = false;
  showCheckout = false;
  orderCreating = false;
  orderSuccess = false;
  showConfirmDialog = false;
  confirmDialogItem: any = null;
  
  couponCode: string = '';
  discountAmount: number = 0;
  appliedCoupon: any = null;
  validatingCoupon = false;
  
  checkoutForm = {
    address: '',
    phone: ''
  };
  
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private toastService: ToastService,
    private couponService: CouponService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    this.loadCart();
  }
  
  loadCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    const user = this.authService.getCurrentUser();
    this.loading = true;
    
    this.cartService.getCart(user.id).subscribe(
      (items: any[]) => {
        this.cartItems = items;
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi tải giỏ hàng!');
        console.error('Lỗi tải giỏ hàng:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }
  
  openConfirmDialog(fruitId: string): void {
    this.confirmDialogItem = this.cartItems.find(item => item.fruitId === fruitId);
    this.showConfirmDialog = true;
  }

  confirmRemove(): void {
    this.showConfirmDialog = false;
    this.removeFromCart(this.confirmDialogItem.fruitId);
  }

  cancelRemove(): void {
    this.showConfirmDialog = false;
    this.confirmDialogItem = null;
  }
  
  removeFromCart(fruitId: string): void {
    const user = this.authService.getCurrentUser();
    const item = this.cartItems.find(i => i.fruitId === fruitId);
    
    this.cartService.removeFromCart(user.id, fruitId).subscribe(
      (items: any[]) => {
        this.cartItems = items;
        this.cartService.updateCartLocal(items);
        this.toastService.success(`Đã xóa ${item.name} khỏi giỏ hàng`);
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi xóa sản phẩm!');
        console.error('Lỗi xóa sản phẩm:', error);
        this.cdr.detectChanges();
      }
    );
  }
  
  updateQuantity(fruitId: string, quantity: number): void {
    if (quantity < 1) {
      this.openConfirmDialog(fruitId);
      return;
    }
    
    const user = this.authService.getCurrentUser();
    
    this.cartService.updateCartItem(user.id, fruitId, quantity).subscribe(
      (items: any[]) => {
        this.cartItems = items;
        this.cartService.updateCartLocal(items);
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi cập nhật số lượng!');
        console.error('Lỗi cập nhật số lượng:', error);
        this.cdr.detectChanges();
      }
    );
  }
  
  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.toastService.warning('Vui lòng nhập mã coupon!');
      return;
    }

    this.validatingCoupon = true;
    const orderTotal = this.getTotalPrice();

    this.couponService.validateCoupon(this.couponCode, orderTotal).subscribe(
      (response: any) => {
        this.appliedCoupon = response.coupon;
        this.discountAmount = response.discountAmount;
        this.toastService.success(`Áp dụng coupon thành công! Giảm ${this.discountAmount.toLocaleString('vi-VN')}đ`);
        this.validatingCoupon = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.appliedCoupon = null;
        this.discountAmount = 0;
        this.toastService.error(error.error?.message || 'Mã coupon không hợp lệ!');
        this.validatingCoupon = false;
        this.cdr.detectChanges();
      }
    );
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.appliedCoupon = null;
    this.discountAmount = 0;
    this.toastService.info('Đã xóa mã coupon');
    this.cdr.detectChanges();
  }

  getFinalPrice(): number {
    return Math.max(0, this.getTotalPrice() - this.discountAmount);
  }
  
  createOrder(): void {
    if (!this.checkoutForm.address || !this.checkoutForm.phone) {
      this.toastService.warning('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(this.checkoutForm.phone.replace(/\s/g, ''))) {
      this.toastService.error('Số điện thoại không hợp lệ (10-11 chữ số)');
      return;
    }
    
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    const totalPrice = this.getTotalPrice();
    
    const order = {
      items: this.cartItems,
      totalPrice,
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : null,
      address: this.checkoutForm.address,
      phone: this.checkoutForm.phone
    };
    
    this.orderCreating = true;
    
    this.orderService.createOrder(order, token!).subscribe(
      (response: any) => {
        this.orderCreating = false;
        this.orderSuccess = true;
        this.cartItems = [];
        this.cartService.updateCartLocal([]);
        this.toastService.success('Đặt hàng thành công!');
        this.cdr.detectChanges();
        
        // Clear cart from backend
        this.cartService.clearCart(user.id).subscribe(
          () => {
            setTimeout(() => {
              this.router.navigate(['/orders']);
            }, 2000);
          },
          (error: any) => {
            console.error('Lỗi xóa giỏ hàng:', error);
            setTimeout(() => {
              this.router.navigate(['/orders']);
            }, 2000);
          }
        );
      },
      (error: any) => {
        this.orderCreating = false;
        this.toastService.error('Tạo đơn hàng thất bại. Vui lòng thử lại!');
        console.error('Lỗi tạo đơn hàng:', error);
        this.cdr.detectChanges();
      }
    );
  }
  
  continueShopping(): void {
    this.router.navigate(['/']);
  }
}
