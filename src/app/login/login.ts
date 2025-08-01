import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      console.log('Login attempt started');
      
      this.auth.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          
          const role = this.auth.getRole();
          console.log('User role:', role);
          
          // Navigate to the correct routes based on your routing configuration
          if (role === 'ADMIN') {
            console.log('Navigating to adminDashboard');
            this.router.navigate(['/adminDashboard']);
          } else if (role === 'JUNIOR' || role === 'MID' || role === 'SENIOR') {
            console.log('Navigating to employeeDashboard');
            this.router.navigate(['/employeeDashboard']);
          } else {
            console.warn('Unknown role:', role);
            this.errorMessage = 'Invalid role received';
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.isLoading = false;
          this.errorMessage = 'Invalid login credentials';
        }
      });
    } else {
      console.log('Form is invalid');
      this.errorMessage = 'Please fill in all required fields';
    }
  }
}