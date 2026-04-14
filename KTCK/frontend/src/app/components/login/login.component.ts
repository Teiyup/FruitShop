import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLogin = true;
  loading = false;
  error = '';
  
  loginForm = {
    email: '',
    password: ''
  };
  
  registerForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
  
  onLogin(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.error = 'Vui lòng nhập email và mật khẩu';
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    
    this.authService.login(this.loginForm.email, this.loginForm.password).subscribe(
      (response: any) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/']);
      },
      (error: any) => {
        this.loading = false;
        this.error = error.error?.message || 'Đăng nhập thất bại';
        this.cdr.detectChanges();
      }
    );
  }
  
  onRegister(): void {
    if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password) {
      this.error = 'Vui lòng điền đầy đủ thông tin';
      return;
    }
    
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.error = 'Mật khẩu không khớp';
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    
    this.authService.register(
      this.registerForm.name,
      this.registerForm.email,
      this.registerForm.password
    ).subscribe(
      (response: any) => {
        this.loading = false;
        this.error = '';
        this.isLogin = true;
        this.loginForm.email = this.registerForm.email;
        this.registerForm = { name: '', email: '', password: '', confirmPassword: '' };
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.loading = false;
        this.error = error.error?.message || 'Đăng ký thất bại';
        this.cdr.detectChanges();
      }
    );
  }
}
