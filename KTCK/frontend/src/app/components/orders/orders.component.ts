import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  isAdmin = false;
  
  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.isAdmin = this.authService.isAdmin();
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const token = this.authService.getToken();
    
    this.orderService.getOrders(token!).subscribe(
      (data: any[]) => {
        this.orders = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi tải đơn hàng!');
        console.error('Lỗi tải đơn hàng:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }
  
  updateOrderStatus(orderId: string, newStatus: string): void {
    const token = this.authService.getToken();
    
    this.orderService.updateOrderStatus(orderId, newStatus, token!).subscribe(
      (response: any) => {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
          order.status = newStatus;
        }
        this.toastService.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi cập nhật trạng thái!');
        console.error('Lỗi cập nhật trạng thái:', error);
        this.cdr.detectChanges();
      }
    );
  }

  reorder(order: any): void {
    const user = this.authService.getCurrentUser();
    
    // Add all items from the order back to cart
    let itemCount = 0;
    order.items.forEach((item: any) => {
      this.cartService.addToCart(user.id, item.fruitId, item.quantity).subscribe(
        (response: any) => {
          itemCount++;
          if (itemCount === order.items.length) {
            this.cartService.updateCartLocal(response);
            this.toastService.success('Đã thêm sản phẩm từ đơn cũ vào giỏ hàng!');
            setTimeout(() => {
              this.router.navigate(['/cart']);
            }, 1500);
          }
        },
        (error: any) => {
          this.toastService.error('Lỗi thêm sản phẩm vào giỏ hàng!');
          console.error('Lỗi reorder:', error);
        }
      );
    });
  }
  
  getStatusDisplay(status: string): string {
    const statusMap: any = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  }
  
  getStatusColor(status: string): string {
    const colorMap: any = {
      'pending': 'yellow',
      'confirmed': 'blue',
      'shipped': 'purple',
      'delivered': 'green',
      'cancelled': 'red'
    };
    return colorMap[status] || 'gray';
  }

  getSelectValue(event: any): string {
    return event.target.value;
  }
}
