import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FruitService } from '../../services/fruit.service';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { CouponService } from '../../services/coupon.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  fruits: any[] = [];
  orders: any[] = [];
  users: any[] = [];
  coupons: any[] = [];
  activeTab = 'products';
  showProductForm = false;
  showCouponForm = false;
  loading = false;
  
  productForm = {
    _id: '',
    name: '',
    price: 0,
    image: '',
    category: '',
    description: '',
    stock: 100
  };

  couponForm = {
    _id: '',
    code: '',
    discountType: 'percent',
    discountValue: 0,
    maxUses: null,
    minOrderValue: 0,
    expiryDate: '',
    description: ''
  };
  
  constructor(
    private authService: AuthService,
    private fruitService: FruitService,
    private orderService: OrderService,
    private userService: UserService,
    private couponService: CouponService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadProducts();
    this.loadOrders();
    this.loadUsers();
    this.loadCoupons();
  }
  
  loadProducts(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.fruitService.getFruits().subscribe(
      (data: any[]) => {
        this.fruits = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi tải sản phẩm!');
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }
  
  loadOrders(): void {
    const token = this.authService.getToken();
    this.orderService.getOrders(token!).subscribe(
      (data: any[]) => {
        this.orders = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.toastService.error('Lỗi tải đơn hàng!');
        this.cdr.detectChanges();
      }
    );
  }

  loadUsers(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastService.error('Token không tồn tại!');
      return;
    }
    
    this.userService.getUsers(token).subscribe(
      (data: any[]) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Lỗi tải người dùng:', error);
        this.toastService.error(error.error?.message || 'Lỗi tải người dùng!');
        this.cdr.detectChanges();
      }
    );
  }

  loadCoupons(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.toastService.error('Token không tồn tại!');
      return;
    }
    
    this.couponService.getCoupons(token).subscribe(
      (data: any[]) => {
        this.coupons = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Lỗi tải mã coupon:', error);
        this.toastService.error(error.error?.message || 'Lỗi tải mã coupon!');
        this.cdr.detectChanges();
      }
    );
  }

  newCoupon(): void {
    this.couponForm = {
      _id: '',
      code: '',
      discountType: 'percent',
      discountValue: 0,
      maxUses: null,
      minOrderValue: 0,
      expiryDate: '',
      description: ''
    };
    this.showCouponForm = true;
  }

  editCoupon(coupon: any): void {
    this.couponForm = { 
      ...coupon,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
    };
    this.showCouponForm = true;
  }

  saveCoupon(): void {
    if (!this.couponForm.code || this.couponForm.discountValue === undefined || this.couponForm.discountValue <= 0) {
      this.toastService.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const token = this.authService.getToken();
    
    // Prepare coupon data with proper type conversions
    const couponData = {
      code: this.couponForm.code,
      discountType: this.couponForm.discountType,
      discountValue: Number(this.couponForm.discountValue),
      maxUses: this.couponForm.maxUses ? Number(this.couponForm.maxUses) : null,
      minOrderValue: this.couponForm.minOrderValue ? Number(this.couponForm.minOrderValue) : 0,
      expiryDate: this.couponForm.expiryDate ? this.couponForm.expiryDate : null,
      description: this.couponForm.description
    };

    if (this.couponForm._id) {
      // Update
      this.couponService.updateCoupon(this.couponForm._id, couponData, token!).subscribe(
        (response: any) => {
          const index = this.coupons.findIndex(c => c._id === this.couponForm._id);
          if (index !== -1) {
            this.coupons[index] = response;
          }
          this.showCouponForm = false;
          this.toastService.success('Cập nhật mã coupon thành công!');
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error updating coupon:', error);
          this.toastService.error(error.error?.message || 'Cập nhật mã coupon thất bại!');
          this.cdr.detectChanges();
        }
      );
    } else {
      // Create
      this.couponService.createCoupon(couponData, token!).subscribe(
        (response: any) => {
          this.coupons.push(response);
          this.showCouponForm = false;
          this.toastService.success('Tạo mã coupon thành công!');
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error creating coupon:', error);
          this.toastService.error(error.error?.message || 'Tạo mã coupon thất bại!');
          this.cdr.detectChanges();
        }
      );
    }
  }

  deleteCoupon(couponId: string, couponCode: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã coupon: ${couponCode}?`)) {
      return;
    }

    const token = this.authService.getToken();
    this.couponService.deleteCoupon(couponId, token!).subscribe(
      (response) => {
        this.coupons = this.coupons.filter(c => c._id !== couponId);
        this.toastService.success(`Đã xóa mã coupon: ${couponCode}`);
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastService.error(error.error?.message || 'Lỗi xóa mã coupon!');
        this.cdr.detectChanges();
      }
    );
  }
  
  editProduct(fruit: any): void {
    this.productForm = { ...fruit };
    this.showProductForm = true;
  }
  
  newProduct(): void {
    this.productForm = {
      _id: '',
      name: '',
      price: 0,
      image: '',
      category: '',
      description: '',
      stock: 100
    };
    this.showProductForm = true;
  }
  
  saveProduct(): void {
    if (!this.productForm.name || this.productForm.price <= 0) {
      alert('Vui lòng nhập đầy đủ thông tin sản phẩm');
      return;
    }
    
    const token = this.authService.getToken();
    
    if (this.productForm._id) {
      // Update
      this.fruitService.updateFruit(this.productForm._id, this.productForm, token!).subscribe(
        (response: any) => {
          const index = this.fruits.findIndex(f => f._id === this.productForm._id);
          if (index !== -1) {
            this.fruits[index] = response;
          }
          this.showProductForm = false;
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Lỗi cập nhật sản phẩm:', error);
          alert('Cập nhật sản phẩm thất bại');
          this.cdr.detectChanges();
        }
      );
    } else {
      // Create
      this.fruitService.addFruit(this.productForm, token!).subscribe(
        (response: any) => {
          this.fruits.push(response);
          this.showProductForm = false;
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Lỗi thêm sản phẩm:', error);
          alert('Thêm sản phẩm thất bại');
          this.cdr.detectChanges();
        }
      );
    }
  }
  
  deleteProduct(id: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }
    
    const token = this.authService.getToken();
    this.fruitService.deleteFruit(id, token!).subscribe(
      (response) => {
        this.fruits = this.fruits.filter(f => f._id !== id);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Lỗi xóa sản phẩm:', error);
        alert('Xóa sản phẩm thất bại');
        this.cdr.detectChanges();
      }
    );
  }
  
  seedData(): void {
    if (!confirm('Bạn có chắc chắn muốn tạo dữ liệu seed? Dữ liệu hiện tại sẽ bị xóa')) {
      return;
    }
    
    const token = this.authService.getToken();
    this.loading = true;
    this.cdr.detectChanges();
    
    this.fruitService.seedData(token!).subscribe(
      (response) => {
        this.loading = false;
        alert('Tạo dữ liệu seed thành công');
        this.cdr.detectChanges();
        this.loadProducts();
      },
      (error) => {
        this.loading = false;
        console.error('Lỗi tạo dữ liệu seed:', error);
        alert('Tạo dữ liệu seed thất bại');
        this.cdr.detectChanges();
      }
    );
  }
  
  updateOrderStatus(orderId: string, newStatus: string): void {
    const token = this.authService.getToken();
    
    this.orderService.updateOrderStatus(orderId, newStatus, token!).subscribe(
      (response) => {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
          order.status = newStatus;
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Lỗi cập nhật trạng thái:', error);
        this.cdr.detectChanges();
      }
    );
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

  getSelectValue(event: any): string {
    return event.target.value;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if image is too large
          if (width > 800) {
            height = (height * 800) / width;
            width = 800;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with quality 0.7
          this.productForm.image = canvas.toDataURL('image/jpeg', 0.7);
          this.cdr.detectChanges();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getCompletedOrders(): number {
    return this.orders.filter(order => order.status === 'completed').length;
  }

  getTotalStock(): number {
    return this.fruits.reduce((total, fruit) => total + (fruit.stock || 0), 0);
  }

  deleteUser(userId: string, userName: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng: ${userName}?`)) {
      return;
    }

    const token = this.authService.getToken();
    this.userService.deleteUser(userId, token!).subscribe(
      (response) => {
        this.users = this.users.filter(u => u._id !== userId);
        this.toastService.success(`Đã xóa người dùng: ${userName}`);
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastService.error(error.error?.message || 'Lỗi xóa người dùng!');
        this.cdr.detectChanges();
      }
    );
  }

  updateUserRole(userId: string, newRole: string): void {
    const token = this.authService.getToken();
    this.userService.updateUserRole(userId, newRole, token!).subscribe(
      (response) => {
        const user = this.users.find(u => u._id === userId);
        if (user) {
          user.role = newRole;
        }
        this.toastService.success(`Đã cập nhật quyền hạn`);
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastService.error(error.error?.message || 'Lỗi cập nhật quyền hạn!');
        this.cdr.detectChanges();
      }
    );
  }
}

