// employee-tabs.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'employee-tabs',
  templateUrl: './scrollable-tabs.html',
  styleUrls: ['./scrollable-tabs.css'],
  standalone: true,
  imports: [CommonModule, TabsModule, CardModule, TagModule, ButtonModule]
})
export class EmployeeTabs implements OnChanges {
  @Input() selectedEmployees: any[] = [];
  @Output() employeeRemoved = new EventEmitter<any>();
  
  activeTabValue: string = 'empty';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedEmployees']) {
      // Update active tab when selection changes
      if (this.selectedEmployees.length > 0) {
        // Set active tab to first employee if current tab is not valid
        const currentTabExists = this.selectedEmployees.some(emp => emp.id.toString() === this.activeTabValue);
        if (!currentTabExists) {
          this.activeTabValue = this.selectedEmployees[0].id.toString();
        }
      } else {
        this.activeTabValue = 'empty';
      }
    }
  }

  removeEmployee(event: Event, employee: any) {
    event.stopPropagation();
    // Emit the employee to be removed to the parent component
    this.employeeRemoved.emit(employee);
    console.log('Remove employee:', employee.name);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getRoleSeverity(role: string): string {
    switch(role.toLowerCase()) {
      case 'senior developer':
      case 'lead developer': return 'success';
      case 'product manager': return 'info';
      case 'ui/ux designer': return 'warning';
      case 'junior developer': return 'secondary';
      default: return 'primary';
    }
  }



}