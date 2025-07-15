import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { Sidebar } from "../../components/sidebar/sidebar";
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ChartLine } from '../../components/chart-line/chart-line';
import { Dial } from '../../components/dial/dial';

export interface Request {
  id: number;
  requestName: string;
  type: string;
  dateTime: Date;
  userName: string;
  status: string;
  price: number;
}

@Component({
  selector: 'table-filter-basic-demo',
  templateUrl: 'employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css'],
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    SelectModule,
    CommonModule,
    Sidebar,
    RouterOutlet,
    FormsModule,
    ChartLine,
    Dial
]
})
export class EmployeeDashboard implements OnInit {
  requests: Request[] = [
    {
      id: 1,
      requestName: 'Server Access',
      type: 'IT',
      dateTime: new Date('2025-07-15T09:30'),
      userName: 'alice',
      status: 'pending',
      price: 0
    },
    {
      id: 2,
      requestName: 'Office Supplies',
      type: 'Admin',
      dateTime: new Date('2025-07-14T14:00'),
      userName: 'bob',
      status: 'completed',
      price: 45.75
    },
    {
      id: 3,
      requestName: 'Bug Fix',
      type: 'Dev',
      dateTime: new Date('2025-07-13T11:15'),
      userName: 'carol',
      status: 'inProgress',
      price: 0
    },
    {
      id: 4,
      requestName: 'New Laptop',
      type: 'Procurement',
      dateTime: new Date('2025-07-12T16:45'),
      userName: 'dave',
      status: 'cancelled',
      price: 1200
    }
  ];

  statuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'inProgress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  loading = false;
  value: string | null = null;
  ngOnInit() {
    // nothing needed—data is already there
  }

  clear(table: Table) {
    table.clear();
  }

  getSeverity(status: string): string | null {
    switch (status) {
      case 'pending':
        return 'warn';
      case 'inProgress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return null;
    }
  }
}
