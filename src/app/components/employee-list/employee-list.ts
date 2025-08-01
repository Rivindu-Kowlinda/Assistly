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
  @Output() balanceUpdated = new EventEmitter<number>(); // Add this output

  customers: any[] = [];
  selectedCustomers: any[] = [];
  loading = true;
  searchValue = '';
  userBalancePoints = 0;
  hasAffordableEmployees = false;
  insufficientPointsMessage = '';

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
        this.userBalancePoints = profile.balancePoints || 0;
        
        // Emit the balance to parent component
        this.balanceUpdated.emit(this.userBalancePoints);

        const roleCostMap = new Map<string, number>();
        prices.forEach(p => roleCostMap.set(p.role.toUpperCase(), p.cost));

        this.customers = employees
          .filter(emp => emp.username !== currentUsername)
          .map((emp: EmployeeResponse) => {
            const role = emp.role[0]?.toUpperCase() || '';
            const price = roleCostMap.get(role) ?? 0;
            const canAfford = this.userBalancePoints >= price;
            
            return {
              id:        emp.id,
              name:      emp.username,
              role,                                // raw role
              roleLabel: this.roleLabelMap[role] || role, // readable label
              price:     price,
              canAfford: canAfford,
              disabled:  !canAfford
            };
          });

        // Check if user can afford any employees
        this.hasAffordableEmployees = this.customers.some(emp => emp.canAfford);
        
        if (!this.hasAffordableEmployees) {
          const cheapestEmployee = this.customers.reduce((min, emp) => 
            emp.price < min.price ? emp : min, this.customers[0]);
          
          this.insufficientPointsMessage = 
            `Insufficient points. You have ${this.userBalancePoints} points. ` +
            `Cheapest available help costs ${cheapestEmployee?.price || 0} points.`;
        }

        // Filter out selected employees that user can no longer afford
        this.selectedCustomers = this.selection.filter(selected => {
          const customer = this.customers.find(c => c.id === selected.id);
          return customer?.canAfford || false;
        });

        // Emit the filtered selection if it changed
        if (this.selectedCustomers.length !== this.selection.length) {
          this.selectionChange.emit(this.selectedCustomers);
        }

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
      // Filter selection to only include affordable employees
      this.selectedCustomers = this.selection.filter(selected => {
        const customer = this.customers.find(c => c.id === selected.id);
        return customer?.canAfford || false;
      });
    }
  }

  onSelectionChange(event: any) {
    // Only allow selection of affordable employees
    const affordableSelection = event.filter((selected: any) => {
      const customer = this.customers.find(c => c.id === selected.id);
      return customer?.canAfford || false;
    });
    
    this.selectedCustomers = affordableSelection;
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
    return this.selectedCustomers.some(selected => selected.id === customer.id);
  }

  isEmployeeAffordable(customer: any): boolean {
    return customer.canAfford;
  }

  toggleSelection(customer: any) {
    // Prevent selection if employee is not affordable
    if (!customer.canAfford) {
      return;
    }

    const idx = this.selectedCustomers.findIndex(selected => selected.id === customer.id);
    if (idx === -1) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers.splice(idx, 1);
    }
    this.selectionChange.emit(this.selectedCustomers);
  }

  getTotalSelectedCost(): number {
    return this.selectedCustomers.reduce((total, emp) => total + (emp.price || 0), 0);
  }

  // Get maximum cost among selected employees
  getMaxSelectedCost(): number {
    if (this.selectedCustomers.length === 0) return 0;
    return Math.max(...this.selectedCustomers.map(emp => emp.price || 0));
  }

  // Get minimum cost among selected employees  
  getMinSelectedCost(): number {
    if (this.selectedCustomers.length === 0) return 0;
    return Math.min(...this.selectedCustomers.map(emp => emp.price || 0));
  }

  canAffordSelection(): boolean {
    // User should be able to afford the most expensive selected employee
    return this.getMaxSelectedCost() <= this.userBalancePoints;
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