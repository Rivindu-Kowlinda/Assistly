import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    this.markFormGroupTouched();

    if (this.loginForm.valid) {
      this.isLoading = true;
      console.log('Login attempt started');

      this.auth.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;

          const role = this.auth.getRole();
          console.log('User role:', role);

          if (role === 'ADMIN') {
            this.router.navigate(['/adminDashboard']);
          } else if (role === 'JUNIOR' || role === 'MID' || role === 'SENIOR') {
            this.router.navigate(['/employeeDashboard']);
          } else {
            console.warn('Unknown role:', role);
            this.notificationService.showNotification('Invalid role received', 'error');
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.isLoading = false;
          this.notificationService.showNotification('Invalid username or password. Please try again.', 'error');
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
