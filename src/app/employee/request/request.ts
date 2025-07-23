// request.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

import { ChipBasicDemo } from '../../components/chip/chip';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TextArea } from '../../components/text-box/text-box';
import { EmployeeList } from '../../components/employee-list/employee-list';
import { EmployeeTabs } from '../../components/scrollable-tabs/scrollable-tabs'; // Changed from ScrollableTabs

@Component({
  selector: 'app-request',
  standalone: true,
  styleUrls: ['./request.css'],
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    StepperModule,
    ChipBasicDemo,
    Sidebar,
    TextArea,
    EmployeeList,
    EmployeeTabs // Changed from ScrollableTabs
  ],
  templateUrl: './request.html',
  styles: [`
    .summary-container {
      gap: 20px;
      padding: 20px;
    }
    
    .summary-text, #userSummary {
    }
    
    .summary-text h4, #userSummary h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #333;
      font-weight: 600;
    }
    
  `]
})
export class Request {
  @ViewChild('requestTextBox') requestTextBox!: TextArea;
  @ViewChild('summaryTextBox') summaryTextBox!: TextArea;
  
  active = 0;
  inputValue = '';
  chips: string[] = [];
  requestContent = '';
  selectedEmployees: any[] = [];

  onRequestContentChange(content: string) {
    this.requestContent = content;
  }

  onEmployeeSelectionChange(employees: any[]) {
    this.selectedEmployees = [...employees];
    console.log('Selected employees updated:', this.selectedEmployees);
  }

  onEmployeeRemoved(employee: any) {
    // Remove the employee from selection when tab is closed
    this.selectedEmployees = this.selectedEmployees.filter(emp => emp.id !== employee.id);
    console.log('Employee removed:', employee.name);
  }

  // Method to handle step navigation and content sync
  goToNextStep(activateCallback: Function, stepIndex: number) {
    this.active = stepIndex;
    activateCallback(stepIndex);
    
    // If going to summary step, ensure content is synced
    if (stepIndex === 2 && this.summaryTextBox) {
      this.summaryTextBox.setContent(this.requestContent);
    }
  }

  canSubmit(): boolean {
    return this.requestContent.trim().length > 0 && this.selectedEmployees.length > 0;
  }

  onSubmit() {
    if (!this.canSubmit()) {
      alert('Please enter request content and select at least one employee.');
      return;
    }

    const submissionData = {
      requestContent: this.requestContent,
      selectedEmployees: this.selectedEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        salary: emp.price,
        country: emp.country.name
      })),
      timestamp: new Date()
    };
    
    console.log('Submitting request:', submissionData);
    
    // Show success message with details
    const employeeNames = this.selectedEmployees.map(emp => emp.name).join(', ');
    alert(`Request submitted successfully!\n\nRequest: ${this.requestContent}\nEmployees: ${employeeNames}`);
    
    // Reset form after submission
    this.resetForm();
  }

  private resetForm() {
    this.requestContent = '';
    this.selectedEmployees = [];
    this.active = 0;
  }

  addChip() {
    const v = this.inputValue.trim();
    if (v) {
      this.chips.push(v);
      this.inputValue = '';
    }
  }
}