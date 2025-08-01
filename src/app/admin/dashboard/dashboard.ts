import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { RouterOutlet } from '@angular/router';

import {
  AdminDashboardService,
  AdminDashboardResponse
} from '../../services/admin-dashboard.service';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

interface TableRow {
  id: string;
  requestName: string;
  recipientUsernames: string;
  type: string;        // 'Request' or 'Response'
  dateTime: Date;
  userName: string;
  status: string;
  price: number;
}

@Component({
  selector: 'admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    SelectModule,
    ButtonModule,
    RouterOutlet,
    AdminSidebar,
  ]
})
export class AdminDashboard implements OnInit {
  loading = true;
  tableRows: TableRow[] = [];

  statuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'inProgress' },
    { label: 'Completed', value: 'completed' }
  ];

  statusLabelMap: { [key: string]: string } = {
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed'
  };

  constructor(private service: AdminDashboardService) {}

  ngOnInit() {
    this.service.getDashboard().subscribe((res: AdminDashboardResponse) => {
      const reqRows: TableRow[] = res.requests.map(r => ({
        id: r.id,
        requestName: r.heading,
        recipientUsernames: r.recipientUsernames,
        type: 'Request',
        dateTime: new Date(r.createdAt),
        userName: r.requestName,
        status: r.status.toLowerCase(),
        price: r.cost
      }));

      const respRows: TableRow[] = res.responses.map(r => ({
        id: r.id,
        requestName: r.heading,
        recipientUsernames: r.recipientUsernames,
        type: 'Response',
        dateTime: new Date(r.createdAt),
        userName: r.requestName,
        status: r.status.toLowerCase(),
        price: r.cost
      }));

      this.tableRows = [...reqRows, ...respRows];
      this.loading = false;
    });
  }

  clear(table: Table) {
    table.clear();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'pending': return 'warn';
      case 'inProgress': return 'info';
      case 'completed': return 'success';
      default: return null;
    }
  }

  onRowClick(row: TableRow, event: Event) {
    const tgt = event.target as HTMLElement;
    if (
      tgt.tagName === 'INPUT' ||
      tgt.tagName === 'SELECT' ||
      tgt.closest('.p-select') ||
      tgt.closest('.p-columnfilter')
    ) return;
    // Optionally open a dialog here
  }
}
