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

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  password: string;
  price: string;
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

  // Popup related properties
  displayUserDialog = false;
  selectedUser: User | null = null;
  editingUser: User | null = null;
  isEditingMode = false;

  ngOnInit() {
    this.customers = [
      {
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        role: 'Senior',
        password: '********',
        price: "5"
      },
      {
        id: 2,
        name: 'Jane Smith',
        username: 'janesmith',
        role: 'Mid',
        password: '********',
        price: "3"
      },
      {
        id: 3,
        name: 'Alice Johnson',
        username: 'alicejohnson',
        role: 'Admin',
        password: '********',
        price: "-"
      },
      {
        id: 4,
        name: 'Bob Wilson',
        username: 'bobwilson',
        role: 'Junior',
        password: '********',
        price: "2"
      },
      {
        id: 5,
        name: 'Sarah Connor',
        username: 'sarahconnor',
        role: 'Senior',
        password: '********',
        price: "5"
      },
      {
        id: 6,
        name: 'Mike Johnson',
        username: 'mikejohnson',
        role: 'Mid',
        password: '********',
        price: "3"
      }
    ];

    this.roles = [
      { label: 'Junior', value: 'Junior' },
      { label: 'Mid', value: 'Mid' },
      { label: 'Senior', value: 'Senior' },
      { label: 'Admin', value: 'Admin' }
    ];

    this.loading = false;
  }

  clear(table: any) {
    table.clear();
  }

  getRoleSeverity(role: string) {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Senior': return 'success';
      case 'Mid': return 'warn';
      case 'Junior': return 'info';
    }
    return null;
  }

  onRowClick(user: User, event: Event) {
    // Prevent event bubbling and ensure clean state
    event.stopPropagation();
    event.preventDefault();
    
    // Close dialog first if it's open
    if (this.displayUserDialog) {
      this.displayUserDialog = false;
    }
    
    // Use setTimeout to ensure clean state transition
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
      // Save all changes when exiting edit mode
      this.saveChanges();
    } else if (this.editingUser) {
      // Clear password field when starting to edit
      this.editingUser.password = '';
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
      // Only update editable fields: username, password, role
      this.selectedUser.username = this.editingUser.username;
      this.selectedUser.role = this.editingUser.role;
      
      // Only update password if it's not empty
      if (this.editingUser.password && this.editingUser.password.trim() !== '') {
        this.selectedUser.password = this.editingUser.password;
      }
      
      this.updateUserInList();
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