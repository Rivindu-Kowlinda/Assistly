// src/app/components/employee-list/employee-list.ts
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { TableModule }       from 'primeng/table';
import { ButtonModule }      from 'primeng/button';
import { InputIcon }         from 'primeng/inputicon';
import { IconField }         from 'primeng/iconfield';
import { CommonModule }      from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule }   from 'primeng/inputtext';
import { Slider }            from 'primeng/slider';
import { FormsModule }       from '@angular/forms';
import { ProgressBar }       from 'primeng/progressbar';
import { forkJoin }          from 'rxjs';

import {
  EmployeeService,
  EmployeeResponse,
  RolePrice
} from '../../services/employee.service';

@Component({
  selector: 'employee-list',
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css'],
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    IconField,
    InputIcon,
    CommonModule,
    MultiSelectModule,
    InputTextModule,
    FormsModule
  ]
})
export class EmployeeList implements OnInit, OnChanges {
  @Input() selection: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();

  customers: any[] = [];
  selectedCustomers: any[] = [];
  loading = true;
  searchValue = '';

  // Role mapping for display purposes
  roleLabelMap: { [key: string]: string } = {
    JUNIOR: 'Junior',
    MID: 'Mid',
    SENIOR: 'Senior'
  };

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    forkJoin({
      profile: this.employeeService.getProfile(),
      data:    this.employeeService.getEmployeeData()
    }).subscribe({
      next: ({ profile, data: [employees, prices] }) => {
        const currentUsername = profile.username;

        const roleCostMap = new Map<string, number>();
        prices.forEach(p => roleCostMap.set(p.role.toUpperCase(), p.cost));

        this.customers = employees
          .filter(emp => emp.username !== currentUsername)
          .map((emp: EmployeeResponse) => {
            const role = emp.role[0]?.toUpperCase() || '';
            return {
              id:        emp.id,
              name:      emp.username,
              role,                                // raw role
              roleLabel: this.roleLabelMap[role] || role, // readable label
              price:     roleCostMap.get(role) ?? 0
            };
          });

        this.selectedCustomers = [...this.selection];
        this.loading = false;
      },
      error: err => {
        console.error('Error loading employees or profile:', err);
        this.loading = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selection'] && !changes['selection'].firstChange) {
      this.selectedCustomers = [...this.selection];
    }
  }

  onSelectionChange(event: any) {
    this.selectedCustomers = event;
    this.selectionChange.emit(this.selectedCustomers);
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  isSelected(customer: any): boolean {
    return this.selectedCustomers.includes(customer);
  }

  toggleSelection(customer: any) {
    const idx = this.selectedCustomers.indexOf(customer);
    if (idx === -1) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers.splice(idx, 1);
    }
    this.selectionChange.emit(this.selectedCustomers);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'unqualified': return 'danger';
      case 'qualified':   return 'success';
      case 'new':         return 'info';
      case 'negotiation': return 'warn';
      case 'renewal':     return null;
      default:            return '';
    }
  }
}
