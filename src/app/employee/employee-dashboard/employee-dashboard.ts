// src/app/admin/dashboard/employee-dashboard.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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

import {
  DashboardService,
  DashboardResponse,
  EmployeeStat,
  PointsData,
  RequestMade
} from '../../services/dashboard.service';

interface ExtendedRequestMade extends RequestMade {
  rating?: number;
}

import { ChartLine } from '../../components/chart-line/chart-line';
import { Dial } from '../../components/dial/dial';
import { Leaderboard } from '../../components/leaderboard/leaderboard';
import { Popup } from '../../components/response-popup/response-popup';
import { Sidebar } from '../../components/sidebar/sidebar';

interface TableRow {
  id: string;
  requestName: string;
  type: string;
  dateTime: Date;
  userName: string;
  status: string;
  price: number;
  rating?: number;
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css'],
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
    ChartLine,
    Dial,
    Leaderboard,
    Sidebar,
    Popup
  ]
})
export class EmployeeDashboard implements OnInit {
  @ViewChild('chatPopup') chatPopup!: Popup;

  selectedRequestId = '';
  selectedItemType: 'Request' | 'Help' = 'Request';
  selectedRating = 0;

  dashboard!: DashboardResponse;
  loading = true;

  requests: ExtendedRequestMade[] = [];
  helpsProvided: ExtendedRequestMade[] = [];
  employeeStats: EmployeeStat[] = [];
  points!: PointsData;

  tableRows: TableRow[] = [];

  statuses = [
    { label: 'Pending',     value: 'pending'    },
    { label: 'In Progress', value: 'inProgress' },
    { label: 'Completed',   value: 'completed'  }
  ];

  constructor(private svc: DashboardService, private router: Router) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /** ✅ Extract dashboard loading into separate method for reuse */
  private loadDashboardData() {
    this.loading = true;
    
    this.svc.getDashboard().subscribe(res => {
      this.dashboard = res;
      this.employeeStats = res.employeeStats;
      this.points = res.points;
      this.requests = res.requestsMade;
      this.helpsProvided = res.helpsProvided;

      this.tableRows = [
        ...this.requests.map((r: ExtendedRequestMade) => ({
          id: r.id,
          requestName: r.heading,
          type: 'Request',
          dateTime: new Date(r.createdAt),
          userName: r.recipientUsernames,
          status: this.mapStatus(r.status),
          price: r.cost,
          rating: r.rating
        })),
        ...this.helpsProvided
          .filter((h: ExtendedRequestMade) => this.mapStatus(h.status) === 'completed')
          .map((h: ExtendedRequestMade) => ({
            id: h.id,
            requestName: h.heading,
            type: 'Help',
            dateTime: new Date(h.createdAt),
            userName: h.recipientUsernames,
            status: this.mapStatus(h.status),
            price: h.cost,
            rating: h.rating
          }))
      ];

      this.loading = false;
    });
  }

  /** ✅ Handle request completion event from popup */
  onRequestCompleted() {
    // Refresh the dashboard data to reflect updated points balance
    this.loadDashboardData();
  }

  mapStatus(raw: string): string {
    switch (raw.toLowerCase()) {
      case 'pending': return 'pending';
      case 'in_progress': return 'inProgress';
      case 'inprogress': return 'inProgress';
      case 'completed': return 'completed';
      default: return raw.toLowerCase();
    }
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

  /** ✅ Updated onRowClick method with async/await and proper property setting */
  async onRowClick(row: TableRow, event: Event) {
    const tgt = (event.target as HTMLElement);

    // Prevent click when interacting with filter controls
    if (
      tgt.tagName === 'INPUT' ||
      tgt.tagName === 'SELECT' ||
      tgt.closest('.p-select') ||
      tgt.closest('.p-columnfilter')
    ) {
      return;
    }

    // Handle Request rows
    if (row.type === 'Request') {
      // ✅ Set all properties before showing dialog
      this.selectedRequestId = row.id;
      this.selectedItemType = 'Request';
      this.selectedRating = row.rating || 0;
      
      // ✅ Set properties on popup component directly
      this.chatPopup.requestId = this.selectedRequestId;
      this.chatPopup.itemType = this.selectedItemType;
      this.chatPopup.existingRating = this.selectedRating;
      
      // ✅ Wait for dialog initialization to complete
      await this.chatPopup.showDialog();
      return;
    }

    // Handle completed Help rows
    if (row.type === 'Help' && row.status === 'completed') {
      // ✅ Set all properties before showing dialog
      this.selectedRequestId = row.id;
      this.selectedItemType = 'Help';
      this.selectedRating = row.rating || 0;
      
      // ✅ Set properties on popup component directly
      this.chatPopup.requestId = this.selectedRequestId;
      this.chatPopup.itemType = this.selectedItemType;
      this.chatPopup.existingRating = this.selectedRating;
      
      // ✅ Wait for dialog initialization to complete
      await this.chatPopup.showDialog();
    }
  }
}