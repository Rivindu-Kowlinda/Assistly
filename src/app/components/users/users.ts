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

interface CreateUserForm {
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
  balancePoints: number;
  monthlyAllocation: number;
}

interface FormValidation {
  username: { touched: boolean; invalid: boolean };
  password: { touched: boolean; invalid: boolean };
  confirmPassword: { touched: boolean; invalid: boolean };
  role: { touched: boolean; invalid: boolean };
  balancePoints: { touched: boolean; invalid: boolean };
  monthlyAllocation: { touched: boolean; invalid: boolean };
}

interface EditFormValidation {
  username: { touched: boolean; invalid: boolean };
  newPassword: { touched: boolean; invalid: boolean };
  confirmNewPassword: { touched: boolean; invalid: boolean };
  role: { touched: boolean; invalid: boolean };
  monthlyAllocation: { touched: boolean; invalid: boolean };
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
  newUser: CreateUserForm = {
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    balancePoints: 0,
    monthlyAllocation: 0
  };

  // Form validation states
  createFormValidation: FormValidation = {
    username: { touched: false, invalid: false },
    password: { touched: false, invalid: false },
    confirmPassword: { touched: false, invalid: false },
    role: { touched: false, invalid: false },
    balancePoints: { touched: false, invalid: false },
    monthlyAllocation: { touched: false, invalid: false }
  };

  editFormValidation: EditFormValidation = {
    username: { touched: false, invalid: false },
    newPassword: { touched: false, invalid: false },
    confirmNewPassword: { touched: false, invalid: false },
    role: { touched: false, invalid: false },
    monthlyAllocation: { touched: false, invalid: false }
  };

  // Password confirmation for edit mode
  confirmNewPassword: string = '';

  // Current logged in user (you'll need to get this from your auth service)
  currentUserUsername: string = 'admin'; // Replace with actual current user

  // Fixed Role label map to handle both uppercase and lowercase
  roleLabelMap: { [key: string]: string } = {
    JUNIOR: 'Junior',
    MID: 'Mid',
    SENIOR: 'Senior',
    ADMIN: 'Admin',
    junior: 'Junior',
    mid: 'Mid',
    senior: 'Senior',
    admin: 'Admin'
  };

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.roles = [
      { label: 'Junior', value: 'JUNIOR' },
      { label: 'Mid',    value: 'MID'    },
      { label: 'Senior', value: 'SENIOR' },
      { label: 'Admin',  value: 'ADMIN'  }
    ];
    this.loadUsersFromAPI();
  }

  isAdminOnlyView(): boolean {
    return this.customers.length > 0 && this.customers.every(customer => customer.role === 'ADMIN');
  }

  // Check if current user can delete the selected user
  canDeleteUser(): boolean {
    if (!this.selectedUser) return false;
    return this.selectedUser.username !== this.currentUserUsername;
  }

  // Helper methods to check password validity for visual styling
  isCreatePasswordInvalid(): boolean {
    return this.newUser.password.length > 0 && this.newUser.password.length < 6;
  }

  isCreateConfirmPasswordInvalid(): boolean {
    return this.newUser.confirmPassword.length > 0 && 
           (this.newUser.confirmPassword !== this.newUser.password || this.newUser.confirmPassword.length < 6);
  }

  isEditPasswordInvalid(): boolean {
    if (!this.editingUser?.newPassword) return false;
    return this.editingUser.newPassword.length > 0 && this.editingUser.newPassword.length < 6;
  }

  isEditConfirmPasswordInvalid(): boolean {
    if (!this.editingUser?.newPassword || !this.confirmNewPassword) return false;
    return this.confirmNewPassword.length > 0 && 
           (this.confirmNewPassword !== this.editingUser.newPassword || this.confirmNewPassword.length < 6);
  }

  // Check if we should show confirm password field in edit mode
  shouldShowConfirmPasswordInEdit(): boolean {
    return this.editingUser?.newPassword !== undefined && this.editingUser.newPassword.length > 0;
  }

  // Validation methods for create form
  validateCreateUsername(): void {
    this.createFormValidation.username.touched = true;
    this.createFormValidation.username.invalid = !this.newUser.username.trim();
  }

  validateCreatePassword(): void {
    this.createFormValidation.password.touched = true;
    this.createFormValidation.password.invalid = this.newUser.password.length < 6;
  }

  validateCreateConfirmPassword(): void {
    this.createFormValidation.confirmPassword.touched = true;
    this.createFormValidation.confirmPassword.invalid = 
      this.newUser.password !== this.newUser.confirmPassword || this.newUser.confirmPassword.length < 6;
  }

  validateCreateRole(): void {
    this.createFormValidation.role.touched = true;
    this.createFormValidation.role.invalid = !this.newUser.role;
  }

  validateCreateBalancePoints(): void {
    if (this.newUser.role !== 'ADMIN') {
      this.createFormValidation.balancePoints.touched = true;
      this.createFormValidation.balancePoints.invalid = this.newUser.balancePoints < 0;
    }
  }

  validateCreateMonthlyAllocation(): void {
    if (this.newUser.role !== 'ADMIN') {
      this.createFormValidation.monthlyAllocation.touched = true;
      this.createFormValidation.monthlyAllocation.invalid = this.newUser.monthlyAllocation < 0;
    }
  }

  // Validation methods for edit form
  validateEditUsername(): void {
    if (!this.editingUser) return;
    this.editFormValidation.username.touched = true;
    this.editFormValidation.username.invalid = !this.editingUser.username?.trim();
  }

  validateEditPassword(): void {
    if (!this.editingUser) return;
    this.editFormValidation.newPassword.touched = true;
    if (this.editingUser.newPassword && this.editingUser.newPassword.trim()) {
      this.editFormValidation.newPassword.invalid = this.editingUser.newPassword.length < 6;
    } else {
      this.editFormValidation.newPassword.invalid = false;
    }
  }

  validateEditConfirmPassword(): void {
    this.editFormValidation.confirmNewPassword.touched = true;
    if (this.editingUser?.newPassword && this.editingUser.newPassword.trim()) {
      this.editFormValidation.confirmNewPassword.invalid = 
        this.editingUser.newPassword !== this.confirmNewPassword || this.confirmNewPassword.length < 6;
    } else {
      this.editFormValidation.confirmNewPassword.invalid = false;
    }
  }

  validateEditRole(): void {
    if (!this.editingUser) return;
    this.editFormValidation.role.touched = true;
    this.editFormValidation.role.invalid = !this.editingUser.role;
  }

  validateEditMonthlyAllocation(): void {
    if (!this.editingUser || this.editingUser.role === 'ADMIN') return;
    this.editFormValidation.monthlyAllocation.touched = true;
    this.editFormValidation.monthlyAllocation.invalid = (this.editingUser.monthlyAllocation || 0) < 0;
  }

  // Check if create form is valid
  isCreateFormValid(): boolean {
    const isUsernameValid = this.newUser.username.trim() !== '';
    const isPasswordValid = this.newUser.password.length >= 6;
    const isConfirmPasswordValid = this.newUser.password === this.newUser.confirmPassword && this.newUser.confirmPassword.length >= 6;
    const isRoleValid = this.newUser.role !== '';
    
    let isBalanceValid = true;
    let isAllocationValid = true;
    
    if (this.newUser.role !== 'ADMIN') {
      isBalanceValid = this.newUser.balancePoints >= 0;
      isAllocationValid = this.newUser.monthlyAllocation >= 0;
    }

    return isUsernameValid && isPasswordValid && isConfirmPasswordValid && isRoleValid && isBalanceValid && isAllocationValid;
  }

  // Check if edit form is valid
  isEditFormValid(): boolean {
    if (!this.editingUser) return false;
    
    const isUsernameValid = this.editingUser.username?.trim() !== '';
    const isRoleValid = this.editingUser.role !== '';
    
    let isPasswordValid = true;
    let isConfirmPasswordValid = true;
    
    if (this.editingUser.newPassword && this.editingUser.newPassword.trim()) {
      isPasswordValid = this.editingUser.newPassword.length >= 6;
      isConfirmPasswordValid = this.editingUser.newPassword === this.confirmNewPassword && this.confirmNewPassword.length >= 6;
    }
    
    let isAllocationValid = true;
    if (this.editingUser.role !== 'ADMIN') {
      isAllocationValid = (this.editingUser.monthlyAllocation || 0) >= 0;
    }

    return isUsernameValid && isRoleValid && isPasswordValid && isConfirmPasswordValid && isAllocationValid;
  }

  openCreateUserDialog() {
    this.newUser = {
      username: '',
      password: '',
      confirmPassword: '',
      role: this.roles[0].value,
      balancePoints: 0,
      monthlyAllocation: 0
    };
    
    // Reset validation state
    this.createFormValidation = {
      username: { touched: false, invalid: false },
      password: { touched: false, invalid: false },
      confirmPassword: { touched: false, invalid: false },
      role: { touched: false, invalid: false },
      balancePoints: { touched: false, invalid: false },
      monthlyAllocation: { touched: false, invalid: false }
    };
    
    this.displayCreateUserDialog = true;
  }

  saveNewUser() {
    if (!this.isCreateFormValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

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
      default: return 'info';
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
      this.confirmNewPassword = '';
      this.isEditingMode = false;
      
      // Reset edit form validation
      this.editFormValidation = {
        username: { touched: false, invalid: false },
        newPassword: { touched: false, invalid: false },
        confirmNewPassword: { touched: false, invalid: false },
        role: { touched: false, invalid: false },
        monthlyAllocation: { touched: false, invalid: false }
      };
      
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
      this.confirmNewPassword = '';
      
      // Reset validation state
      this.editFormValidation = {
        username: { touched: false, invalid: false },
        newPassword: { touched: false, invalid: false },
        confirmNewPassword: { touched: false, invalid: false },
        role: { touched: false, invalid: false },
        monthlyAllocation: { touched: false, invalid: false }
      };
    } else if (this.editingUser) {
      this.editingUser.newPassword = '';
      this.confirmNewPassword = '';
    }
  }

  closeDialog() {
    this.displayUserDialog = false;
    this.selectedUser = null;
    this.editingUser = null;
    this.isEditingMode = false;
    this.confirmNewPassword = '';
  }

  saveChanges() {
    if (!this.isEditFormValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly'
      });
      return;
    }

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

    if (!this.canDeleteUser()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Delete Not Allowed',
        detail: 'You cannot delete your own account'
      });
      return;
    }

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