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
  email: string;
  phone: string;
  role: string;
  password: string;
  country: { name: string; code: string };
  representative: { name: string; image: string };
  status: string;
  verified: boolean;
  date: Date;
  lastLogin: Date;
  department: string;
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
  representatives: any[] = [];
  statuses: any[] = [];
  roles: any[] = [];
  loading = true;

  selectedRepresentatives: any[] = [];
  selectedStatus: any = null;
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
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        role: 'Senior Employee',
        password: '********',
        country: { name: 'USA', code: 'us' },
        representative: { name: 'Amy Elsner', image: 'amyelsner.png' },
        status: 'qualified',
        verified: true,
        date: new Date('2023-01-15'),
        lastLogin: new Date('2024-07-20'),
        department: 'Engineering'
      },
      {
        id: 2,
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane.smith@company.com',
        phone: '+49-123-456789',
        role: 'Mid Employee',
        password: '********',
        country: { name: 'Germany', code: 'de' },
        representative: { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        status: 'unqualified',
        verified: false,
        date: new Date('2023-03-22'),
        lastLogin: new Date('2024-07-19'),
        department: 'Marketing'
      },
      {
        id: 3,
        name: 'Alice Johnson',
        username: 'alicejohnson',
        email: 'alice.johnson@company.com',
        phone: '+44-20-7946-0958',
        role: 'Admin',
        password: '********',
        country: { name: 'UK', code: 'gb' },
        representative: { name: 'Xuxue Feng', image: 'xuxuefeng.png' },
        status: 'qualified',
        verified: true,
        date: new Date('2022-11-08'),
        lastLogin: new Date('2024-07-22'),
        department: 'IT Administration'
      },
      {
        id: 4,
        name: 'Bob Wilson',
        username: 'bobwilson',
        email: 'bob.wilson@company.com',
        phone: '+1-555-0789',
        role: 'Junior Employee',
        password: '********',
        country: { name: 'Canada', code: 'ca' },
        representative: { name: 'Amy Elsner', image: 'amyelsner.png' },
        status: 'new',
        verified: true,
        date: new Date('2024-05-12'),
        lastLogin: new Date('2024-07-21'),
        department: 'Sales'
      }
    ];

    this.representatives = [
      { name: 'Amy Elsner', image: 'amyelsner.png' },
      { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
      { name: 'Xuxue Feng', image: 'xuxuefeng.png' }
    ];

    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' }
    ];

    this.roles = [
      { label: 'Junior Employee', value: 'Junior Employee' },
      { label: 'Mid Employee', value: 'Mid Employee' },
      { label: 'Senior Employee', value: 'Senior Employee' },
      { label: 'Admin', value: 'Admin' }
    ];

    this.loading = false;
  }

  clear(table: any) {
    table.clear();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'unqualified': return 'danger';
      case 'qualified': return 'success';
      case 'new': return 'info';
      case 'negotiation': return 'warn';
      case 'renewal': return null;
      case 'proposal': return 'info';
    }
    return null;
  }

  getRoleSeverity(role: string) {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Senior Employee': return 'success';
      case 'Mid Employee': return 'warn';
      case 'Junior Employee': return 'info';
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
      // Update selected user with editing user data
      this.selectedUser = { ...this.editingUser };
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