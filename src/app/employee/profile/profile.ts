import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Sidebar }           from '../../components/sidebar/sidebar';
import { ButtonModule }      from 'primeng/button';
import { DialogModule }      from 'primeng/dialog';
import { InputTextModule }   from 'primeng/inputtext';
import { Router }            from '@angular/router';
import { UserService }       from '../../services/proflile.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user = {
    username: '',
    role: '',
    balancePoints: 0,
    monthlyAllocation: 0,
    requestCount: 0,
    helpPending: 0,
    helpCompleted: 0
  };

  displayChangePassword = false;

  currentPassword = '';
  newPassword     = '';
  confirmPassword = '';

  currentTouched = false;
  newTouched     = false;
  confirmTouched = false;

  // Now allow null so we can reset to null
  currentError: string | null = null;
  newError:     string | null = null;
  confirmError: string | null = null;

  changeError:  string | null = null;

  roleMap: { [key: string]: string } = {
    ADMIN:  'Admin',
    JUNIOR: 'Junior',
    MID:    'Mid',
    SENIOR: 'Senior'
  };

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: data => {
        this.user = {
          username:          data.username,
          role:              this.roleMap[data.role[0]] || data.role[0],
          balancePoints:     data.balancePoints,
          monthlyAllocation: data.monthlyAllocation,
          requestCount:      data.requestCount,
          helpPending:       data.helpPendingCount,
          helpCompleted:     data.helpAcceptedCount
        };
      },
      error: err => console.error('Failed to load profile data', err)
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  openChangePassword() {
    this.displayChangePassword = true;
    this.currentPassword  = '';
    this.newPassword      = '';
    this.confirmPassword  = '';
    this.currentTouched   = false;
    this.newTouched       = false;
    this.confirmTouched   = false;

    // reset all errors to null
    this.currentError = null;
    this.newError     = null;
    this.confirmError = null;
    this.changeError  = null;
  }

  onBlur(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') {
      this.currentTouched = true;
      this.validateCurrent();
    }
    if (field === 'new') {
      this.newTouched = true;
      this.validateNew();
      if (this.confirmTouched) this.validateConfirm();
    }
    if (field === 'confirm') {
      this.confirmTouched = true;
      this.validateConfirm();
    }
  }

  private validateCurrent() {
    this.currentError = this.currentPassword
      ? null
      : 'Current password is required';
  }

  private validateNew() {
    if (!this.newPassword) {
      this.newError = 'New password is required';
    } else if (this.newPassword.length < 6) {
      this.newError = 'Password must be at least 6 characters';
    } else {
      this.newError = null;
    }
  }

  private validateConfirm() {
    if (!this.confirmPassword) {
      this.confirmError = 'Confirmation is required';
    } else if (this.confirmPassword.length < 6) {
      this.confirmError = 'Password must be at least 6 characters';
    } else if (this.newPassword !== this.confirmPassword) {
      this.confirmError = 'Passwords do not match';
    } else {
      this.confirmError = null;
    }
  }

  isFormValid(): boolean {
    return (
      !!this.currentPassword &&
      this.newPassword.length >= 6 &&
      this.confirmPassword === this.newPassword &&
      !this.currentError &&
      !this.newError &&
      !this.confirmError
    );
  }

  submitChangePassword() {
    this.currentTouched = this.newTouched = this.confirmTouched = true;
    this.validateCurrent();
    this.validateNew();
    this.validateConfirm();

    if (!this.isFormValid()) return;

    this.changeError = null;

    this.userService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword:     this.newPassword
      })
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            'Password changed successfully',
            'success'
          );
          localStorage.removeItem('jwt');
          localStorage.removeItem('role');
          this.router.navigate(['/login']);
        },
        error: err => {
          const msg = (err.error?.message || '').toLowerCase();
          if (msg.includes('current')) {
            this.currentError   = 'Current password is incorrect';
            this.currentTouched = true;
          } else {
            this.changeError = err.error?.message
              || 'Failed to change password. Please try again.';
          }
        }
      });
  }

  getFirstLetter(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '';
  }
}
