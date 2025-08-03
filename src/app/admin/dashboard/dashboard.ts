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
  type: string;
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
    { label: 'In Progress', value: 'inprogress' },
    { label: 'Completed', value: 'completed' }
  ];

  statusLabelMap: { [key: string]: string } = {
    pending: 'Pending',
    inprogress: 'In Progress',
    completed: 'Completed'
  };

  constructor(private service: AdminDashboardService) {}

  ngOnInit() {
    this.service.getDashboard().subscribe((res: AdminDashboardResponse) => {
      const normalizeStatus = (status: string) =>
        status.toLowerCase().replace(/_/g, '');

      const reqRows: TableRow[] = res.requests.map(r => ({
        id: r.id,
        requestName: r.heading,
        recipientUsernames: r.requestName, // swapped
        type: 'Request',
        dateTime: new Date(r.createdAt),
        userName: r.recipientUsernames, // swapped
        status: normalizeStatus(r.status),
        price: r.cost
      }));

      const respRows: TableRow[] = res.responses.map(r => ({
        id: r.id,
        requestName: r.heading,
        recipientUsernames: r.requestName, // swapped
        type: 'Response',
        dateTime: new Date(r.createdAt),
        userName: r.recipientUsernames, // swapped
        status: normalizeStatus(r.status),
        price: r.cost
      }));

      this.tableRows = [...reqRows, ...respRows].sort(
        (a, b) => b.dateTime.getTime() - a.dateTime.getTime()
      );

      this.loading = false;
    });
  }

  clear(table: Table) {
    table.clear();
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'pending': return 'warn';
      case 'inprogress': return 'info';
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
    // Optional: open modal or navigate
  }
}
