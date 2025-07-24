// Updated employee-list.component.ts
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TableModule }       from 'primeng/table';
import { Tag }               from 'primeng/tag';
import { ButtonModule }      from 'primeng/button';
import { InputIcon }         from 'primeng/inputicon';
import { IconField }         from 'primeng/iconfield';
import { CommonModule }      from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule }   from 'primeng/inputtext';
import { Slider }            from 'primeng/slider';
import { FormsModule }      from '@angular/forms';
import { ProgressBar }       from 'primeng/progressbar';

@Component({
  selector: 'employee-list',
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css'],
  standalone: true,
  imports: [
    TableModule, Tag, ButtonModule, IconField, InputIcon,
    CommonModule, MultiSelectModule, InputTextModule,
    Slider, ProgressBar, FormsModule
  ]
})
export class EmployeeList implements OnInit, OnChanges {
  @Input() selection: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();

  customers: any[] = [];
  selectedCustomers: any[] = [];
  representatives: any[] = [];
  statuses: any[] = [];
  loading: boolean = true;
  activityValues: number[] = [0, 100];
  searchValue: string = '';

  isSelected(customer: any): boolean {
    return this.selectedCustomers.includes(customer);
  }

  toggleSelection(customer: any) {
    const index = this.selectedCustomers.indexOf(customer);
    if (index === -1) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers.splice(index, 1);
    }
    this.selectionChange.emit(this.selectedCustomers);
  }

  ngOnInit() {
    this.customers = [
      { 
        id: 1, 
        name: 'John Doe',
        role: 'Senior',
        price: 5
      },
      { 
        id: 2, 
        name: 'Jane Smith',
        role: 'Senior',
        price: 5
      },
      { 
        id: 3, 
        name: 'Alice Johnson',
        role: 'Senior',
        price: 5
      },
      { 
        id: 4, 
        name: 'Bob Wilson',
        role: 'Mid',
        price: 3
      },
      { 
        id: 5, 
        name: 'Carol Davis',
        role: 'Junior',
        price: 2
      },
      { 
        id: 6, 
        name: 'David Brown',
        role: 'Mid',
        price: 3
      }
    ];

    this.representatives = [
      { name: 'Amy Elsner', image: 'amyelsner.png' },
      { name: 'Anna Fali', image: 'annafali.png' },
      { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
      { name: 'Onyama Limba', image: 'onyamalimba.png' },
      { name: 'Stephen Shaw', image: 'stephenshaw.png' }
    ];

    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' }
    ];

    // Initialize selectedCustomers from input
    this.selectedCustomers = [...this.selection];
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selection'] && !changes['selection'].firstChange) {
      // Update selectedCustomers when input changes from parent
      this.selectedCustomers = [...this.selection];
    }
  }

  getSeverity(status: string) {
    switch(status) {
      case 'unqualified': return 'danger';
      case 'qualified': return 'success';
      case 'new': return 'info';
      case 'negotiation': return 'warn';
      case 'renewal': return null;
      default: return '';
    }
  }

  onSelectionChange(event: any) {
    // Update selectedCustomers and emit the change
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
}