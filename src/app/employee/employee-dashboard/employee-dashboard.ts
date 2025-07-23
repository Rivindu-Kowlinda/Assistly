import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ChartLine } from '../../components/chart-line/chart-line';
import { Dial } from '../../components/dial/dial';
import { Leaderboard } from '../../components/leaderboard/leaderboard';
import { Popup } from '../../components/popup/popup';  // Import the Popup component

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
    ButtonModule,    // ← for the Export button
    CommonModule,
    Sidebar,
    RouterOutlet,
    FormsModule,
    ChartLine,
    Dial,
    Leaderboard,
    Popup
  ]
})
export class EmployeeDashboard implements OnInit {
  @ViewChild('popup') popup!: Popup;

  // your hardcoded data
  requests: Request[] = [
    { id: 1, requestName: 'Server Access',   type: 'Request',          dateTime: new Date('2025-07-15T09:30'), userName: 'alice', status: 'pending',    price: 2    },
    { id: 2, requestName: 'Office Supplies', type: 'Request',       dateTime: new Date('2025-07-14T14:00'), userName: 'bob',   status: 'completed',  price: 5},
    { id: 3, requestName: 'Bug Fix',         type: 'Response',         dateTime: new Date('2025-07-13T11:15'), userName: 'carol', status: 'inProgress', price: 2    },
    { id: 4, requestName: 'New Laptop',      type: 'Request', dateTime: new Date('2025-07-12T16:45'), userName: 'dave',  status: 'inProgress',  price: 3 }
  ];

  statuses = [
    { label: 'Pending',      value: 'pending'    },
    { label: 'In Progress',  value: 'inProgress' },
    { label: 'Completed',    value: 'completed'  }
  ];

  loading = false;
  value: string | null = null;

    // Columns to use for CSV export
  exportColumns = [
    { title: 'Request Name', dataKey: 'requestName' },
    { title: 'Type',         dataKey: 'type'        },
    { title: 'Date/Time',    dataKey: 'dateTime'    },
    { title: 'User Name',    dataKey: 'userName'    },
    { title: 'Status',       dataKey: 'status'      },
    { title: 'Price',        dataKey: 'price'       }
  ];

  ngOnInit() {
    // no initialization needed for hardcoded data
  }

  /** clear filters/sorting on a given table */
  clear(table: Table) {
    table.clear();
  }

  /** map status to tag severity */
  getSeverity(status: string): string | null {
    switch (status) {
      case 'pending':     return 'warn';
      case 'inProgress':  return 'info';
      case 'completed':   return 'success';
      default:            return null;
    }
  }

  /** show popup when clicking a row (unless clicking a filter element) */
  onRowClick(request: Request, event: Event) {
    const tgt = (event.target as HTMLElement);
    if (
      tgt.tagName === 'INPUT' ||
      tgt.tagName === 'SELECT' ||
      tgt.closest('.p-select') ||
      tgt.closest('.p-columnfilter')
    ) {
      return;
    }
    this.popup.showDialog();
  }
}
