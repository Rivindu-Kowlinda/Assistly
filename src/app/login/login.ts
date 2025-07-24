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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe({
        next: () => {
          const role = this.auth.getRole();
          if (role === 'ADMIN') this.router.navigate(['/admin']);
          else this.router.navigate(['/employee']);
        },
        error: () => alert('Invalid login')
      });
    }
  }
}