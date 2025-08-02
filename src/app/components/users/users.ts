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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UserService, ApiUser } from '../../services/user.service';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  price: string;
  monthlyAllocation: number;
  newPassword?: string;
  requestCount?: number;
  helpPendingCount?: number;
  helpAcceptedCount?: number;
  deleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
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
    AvatarModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService]
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
    role: '',
    balancePoints: 0,
    monthlyAllocation: 0
  };

  // Role label map
  roleLabelMap: { [key: string]: string } = {
    JUNIOR: 'Junior',
    MID: 'Mid',
    SENIOR: 'Senior',
    ADMIN: 'Admin'
  };

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.roles = [
      { label: 'Junior', value: 'Junior' },
      { label: 'Mid',    value: 'MID'    },
      { label: 'Senior', value: 'SENIOR' },
      { label: 'Admin',  value: 'ADMIN'  }
    ];
    this.loadUsersFromAPI();
  }

  isAdminOnlyView(): boolean {
    return this.customers.length > 0 && this.customers.every(customer => customer.role === 'ADMIN');
  }

  openCreateUserDialog() {
    this.newUser = {
      username: '',
      password: '',
      role: this.roles[0].value,
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
      balancePoints: this.newUser.role === 'ADMIN' ? 0 : this.newUser.balancePoints,
      monthlyAllocation: this.newUser.role === 'ADMIN' ? 0 : this.newUser.monthlyAllocation
    };

    this.userService.createUser(payload).subscribe({
      next: created => {
        this.customers = [
          ...this.customers,
          {
            id: created.id,
            name: created.username,
            username: created.username,
            password: created.password,
            role: created.role[0],
            price: created.balancePoints.toString(),
            monthlyAllocation: created.monthlyAllocation,
            newPassword: ''
          }
        ];
        this.displayCreateUserDialog = false;
        this.newUser = {
          username: '',
          password: '',
          role: this.roles[0].value,
          balancePoints: 0,
          monthlyAllocation: 0
        };
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully'
        });
      },
      error: err => {
        console.error('Create user failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create user'
        });
      }
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
          newPassword: '',
          requestCount: user.requestCount,
          helpPendingCount: user.helpPendingCount,
          helpAcceptedCount: user.helpAcceptedCount,
          deleted: user.deleted,
          deletedAt: user.deletedAt,
          deletedBy: user.deletedBy
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
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
      this.editingUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        price: user.price,
        monthlyAllocation: user.monthlyAllocation,
        requestCount: user.requestCount,
        helpPendingCount: user.helpPendingCount,
        helpAcceptedCount: user.helpAcceptedCount,
        password: '',
        newPassword: ''
      };
      this.isEditingMode = false;
      this.displayUserDialog = true;
    }, 50);
  }

  toggleEditMode() {
    this.isEditingMode = !this.isEditingMode;
    if (!this.isEditingMode && this.selectedUser) {
      this.editingUser = {
        id: this.selectedUser.id,
        name: this.selectedUser.name,
        username: this.selectedUser.username,
        role: this.selectedUser.role,
        price: this.selectedUser.price,
        monthlyAllocation: this.selectedUser.monthlyAllocation,
        requestCount: this.selectedUser.requestCount,
        helpPendingCount: this.selectedUser.helpPendingCount,
        helpAcceptedCount: this.selectedUser.helpAcceptedCount,
        password: '',
        newPassword: ''
      };
    } else if (this.editingUser) {
      this.editingUser.newPassword = '';
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
      const updatedUser: any = {
        id: this.selectedUser.id,
        username: this.editingUser.username,
        role: [this.editingUser.role],
        balancePoints: this.editingUser.role === 'ADMIN' ? 0 : parseInt(this.selectedUser.price),
        monthlyAllocation: this.editingUser.role === 'ADMIN' ? 0 : this.editingUser.monthlyAllocation,
        requestCount: this.selectedUser.requestCount ?? 0,
        helpPendingCount: this.selectedUser.helpPendingCount ?? 0,
        helpAcceptedCount: this.selectedUser.helpAcceptedCount ?? 0
      };

      if (this.editingUser.newPassword?.trim()) {
        updatedUser.password = this.editingUser.newPassword.trim();
      }

      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.selectedUser!.username = updatedUser.username;
          this.selectedUser!.role = updatedUser.role[0];
          this.selectedUser!.monthlyAllocation = updatedUser.monthlyAllocation;
          this.selectedUser!.price = updatedUser.balancePoints.toString();
          this.updateUserInList();
          this.isEditingMode = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully'
          });
        },
        error: err => {
          console.error('Failed to update user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update user'
          });
        }
      });
    }
  }

  confirmDeleteUser() {
    if (!this.selectedUser) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${this.selectedUser.username}"? This action will soft delete the user and they won't be able to login.`,
      header: 'Confirm User Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Delete User',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deleteUser();
      }
    });
  }

  deleteUser() {
    if (!this.selectedUser) return;

    this.userService.softDeleteUser(this.selectedUser.id).subscribe({
      next: (response) => {
        // Remove user from the list
        this.customers = this.customers.filter(user => user.id !== this.selectedUser!.id);
        
        this.messageService.add({
          severity: 'success',
          summary: 'User Deleted',
          detail: `User "${response.deletedUser}" has been successfully deleted`
        });
        
        this.closeDialog();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        let errorMessage = 'Failed to delete user';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 400) {
          errorMessage = 'Cannot delete this user. You may be trying to delete your own account.';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: errorMessage
        });
      }
    });
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