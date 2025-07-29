import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';

import { UserService, ApiUser } from '../../services/user.service';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  price: string;
  monthlyAllocation: number;
  requestCount?: number;
  helpPendingCount?: number;
  helpAcceptedCount?: number;
}

@Component({
  selector: 'users',
  templateUrl: 'users.html',
  styleUrls: ['users.css'],
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
    HttpClientModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    PasswordModule,
    CardModule,
    DividerModule,
    AvatarModule
  ]
})
export class TableFilterBasicDemo implements OnInit {
  customers: User[] = [];
  roles: any[] = [];
  loading = true;

  selectedRole: any = null;
  searchTerm: string = '';

  displayUserDialog = false;
  selectedUser: User | null = null;
  editingUser: User | null = null;
  isEditingMode = false;

  displayCreateUserDialog = false;
  newUser = {
    username: '',
    password: '',
    role: '',               // will be one of this.roles[].value
    balancePoints: 0,
    monthlyAllocation: 0
  };

  constructor(private userService: UserService) {}
  
  ngOnInit() {
    this.roles = [
      { label: 'Junior', value: 'JUNIOR' },
      { label: 'Mid',    value: 'MID'    },
      { label: 'Senior', value: 'SENIOR' },
      { label: 'Admin',  value: 'ADMIN'  }
    ];
    this.loadUsersFromAPI();
  }

  // Helper method to check if we should hide the balance points column
  isAdminOnlyView(): boolean {
    return this.customers.length > 0 && this.customers.every(customer => customer.role === 'ADMIN');
  }

  openCreateUserDialog() {
    this.newUser = {
      username: '',
      password: '',
      role: this.roles[0].value,   // default to first role
      balancePoints: 0,
      monthlyAllocation: 0
    };
    this.displayCreateUserDialog = true;
  }

  saveNewUser() {
    const payload = {
      username: this.newUser.username,
      password: this.newUser.password,
      role: [ this.newUser.role ],
      // Only include balance points and monthly allocation if not admin
      balancePoints: this.newUser.role === 'ADMIN' ? 0 : this.newUser.balancePoints,
      monthlyAllocation: this.newUser.role === 'ADMIN' ? 0 : this.newUser.monthlyAllocation
    };

    this.userService.createUser(payload).subscribe({
      next: created => {
        // inject into your table with the shape you need
        this.customers = [
          ...this.customers,
          {
            id: created.id,
            name: created.username,
            username: created.username,
            password: '••••••••',          // mask it
            role: created.role[0],
            price: created.balancePoints.toString(),
            monthlyAllocation: created.monthlyAllocation
          }
        ];
        this.displayCreateUserDialog = false;
        
        // Reset form
        this.newUser = {
          username: '',
          password: '',
          role: this.roles[0].value,
          balancePoints: 0,
          monthlyAllocation: 0
        };
      },
      error: err => console.error('Create user failed', err)
    });
  }

  loadUsersFromAPI() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data: ApiUser[]) => {
        this.customers = data.map(user => ({
          id: user.id,
          name: user.username,
          username: user.username,
          password: user.password,
          role: user.role[0],
          price: user.balancePoints.toString(),
          monthlyAllocation: user.monthlyAllocation,
          requestCount: user.requestCount,
          helpPendingCount: user.helpPendingCount,
          helpAcceptedCount: user.helpAcceptedCount
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        this.loading = false;
      }
    });
  }

  clear(table: any) {
    table.clear();
  }

  getRoleSeverity(role: string) {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'danger';
      case 'SENIOR': return 'success';
      case 'MID': return 'warn';
      case 'JUNIOR': return 'info';
      default: return null;
    }
  }

  onRowClick(user: User, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.displayUserDialog) this.displayUserDialog = false;
    setTimeout(() => {
      this.selectedUser = { ...user };
      this.editingUser = { ...user };
      this.isEditingMode = false;
      this.displayUserDialog = true;
    }, 50);
  }

  toggleEditMode() {
    this.isEditingMode = !this.isEditingMode;
    if (!this.isEditingMode) {
      // Reset editing user to original values if canceling
      if (this.selectedUser) {
        this.editingUser = { ...this.selectedUser };
      }
    }
  }

  closeDialog() {
    this.displayUserDialog = false;
    this.selectedUser = null;
    this.editingUser = null;
    this.isEditingMode = false;
  }

  saveChanges() {
    if (this.editingUser && this.selectedUser) {
      const updatedUser: ApiUser = {
        id: this.selectedUser.id,
        username: this.editingUser.username,
        password: this.editingUser.password,
        role: [this.editingUser.role],
        // If role is admin, set balance points and monthly allocation to 0
        balancePoints: this.editingUser.role === 'ADMIN' ? 0 : parseInt(this.selectedUser.price),
        monthlyAllocation: this.editingUser.role === 'ADMIN' ? 0 : this.editingUser.monthlyAllocation,
        requestCount: this.selectedUser.requestCount ?? 0,
        helpPendingCount: this.selectedUser.helpPendingCount ?? 0,
        helpAcceptedCount: this.selectedUser.helpAcceptedCount ?? 0
      };

      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.selectedUser!.username = updatedUser.username;
          this.selectedUser!.password = updatedUser.password;
          this.selectedUser!.role = updatedUser.role[0];
          this.selectedUser!.monthlyAllocation = updatedUser.monthlyAllocation;
          this.selectedUser!.price = updatedUser.balancePoints.toString();
          this.updateUserInList();
          this.isEditingMode = false;
        },
        error: (err) => {
          console.error('Failed to update user:', err);
        }
      });
    }
  }

  updateUserInList() {
    if (this.selectedUser) {
      const index = this.customers.findIndex(c => c.id === this.selectedUser!.id);
      if (index > -1) {
        this.customers[index] = { ...this.selectedUser };
      }
    }
  }
}