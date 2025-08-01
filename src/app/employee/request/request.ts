// src/app/components/request/request.ts
import { Component, ViewChild } from '@angular/core';
import { FormsModule }          from '@angular/forms';
import { InputTextModule }      from 'primeng/inputtext';
import { ButtonModule }         from 'primeng/button';
import { StepperModule }        from 'primeng/stepper';
import { CommonModule }         from '@angular/common';

import { Sidebar }              from '../../components/sidebar/sidebar';
import { TextArea }             from '../../components/text-box/text-box';
import { EmployeeList }         from '../../components/employee-list/employee-list';
import { EmployeeTabs }         from '../../components/scrollable-tabs/scrollable-tabs';
import { RequestService }       from '../../services/request.service';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    StepperModule,
    Sidebar,
    TextArea,
    EmployeeList,
    EmployeeTabs
  ],
  templateUrl: './request.html',
  styleUrls: ['./request.css']
})
export class Request {
  @ViewChild('requestTextBox') requestTextBox!: TextArea;
  @ViewChild('summaryTextBox') summaryTextBox!: TextArea;
  @ViewChild('employeeListRef') employeeList!: EmployeeList;

  active = 0;
  requestHeading = '';
  requestContent = '';
  selectedEmployees: any[] = [];
  userBalancePoints = 0; // Add this property to store the balance

  constructor(private requestService: RequestService) {}

  onRequestContentChange(content: string) {
    this.requestContent = content;
  }

  onEmployeeSelectionChange(employees: any[]) {
    this.selectedEmployees = [...employees];
  }

  // Add this method to receive balance updates from employee list
  onBalanceUpdated(balance: number) {
    this.userBalancePoints = balance;
  }

  onEmployeeRemoved(employee: any) {
    this.selectedEmployees = this.selectedEmployees.filter(emp => emp.id !== employee.id);
  }

  canGoToStep2(): boolean {
    return this.requestHeading.trim().length > 0 && this.requestContent.trim().length > 0;
  }

  canGoToStep3(): boolean {
    // Check if any employees are selected
    if (this.selectedEmployees.length === 0) {
      return false;
    }

    // Check if current selection is affordable
    if (!this.canAffordCurrentSelection()) {
      return false;
    }

    return true;
  }

  goToNextStep(activateCallback: Function, stepIndex: number) {
    if (stepIndex === 1 && !this.canGoToStep2()) return;
    if (stepIndex === 2 && !this.canGoToStep3()) return;

    this.active = stepIndex;
    activateCallback(stepIndex);

    if (stepIndex === 2 && this.summaryTextBox) {
      this.summaryTextBox.setContent(this.requestContent);
    }
  }

  canSubmit(): boolean {
    const hasValidContent = this.requestHeading.trim().length > 0 && 
                           this.requestContent.trim().length > 0;
    const hasSelectedEmployees = this.selectedEmployees.length > 0;
    const canAffordSelection = this.canAffordCurrentSelection();

    return hasValidContent && hasSelectedEmployees && canAffordSelection;
  }

  getSubmitButtonLabel(): string {
    if (!this.canSubmit()) {
      if (this.selectedEmployees.length === 0) {
        return 'No Employees Selected';
      }
      if (!this.canAffordCurrentSelection()) {
        return 'Insufficient Points';
      }
      return 'Complete Required Fields';
    }
    return 'Submit Request';
  }

  onSubmit() {
    if (!this.canSubmit()) {
      let errorMessage = 'Cannot submit request: ';
      
      if (this.requestHeading.trim().length === 0) {
        errorMessage += 'Request heading is required. ';
      }
      if (this.requestContent.trim().length === 0) {
        errorMessage += 'Request content is required. ';
      }
      if (this.selectedEmployees.length === 0) {
        errorMessage += 'At least one employee must be selected. ';
      }
      if (!this.canAffordCurrentSelection()) {
        const maxCost = this.getMaxPotentialCost();
        const userPoints = this.getUserBalance();
        errorMessage += `Insufficient points. Maximum potential cost: ${maxCost}, Available: ${userPoints}. `;
      }
      
      alert(errorMessage.trim());
      return;
    }

    const formData = new FormData();

    // Build payload: IDs + usernames + cost
    const payload = {
      heading: this.requestHeading,
      description: this.requestContent,
      recipientIds: this.selectedEmployees.map(emp => emp.id),
      recipientUsernames: this.selectedEmployees.map(emp => emp.name),
      cost: this.selectedEmployees.reduce((total, emp) => total + (emp.price || 0), 0)
    };
    formData.append('data', JSON.stringify(payload));

    // Extract any embedded images from the rich‑text box
    const container = this.requestTextBox?.getNativeElement() || document;
    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    images.forEach((img, i) => {
      const src = img.src;
      if (src.startsWith('data:image')) {
        const file = this.base64ToFile(src, `embedded-${i}.png`);
        formData.append('images', file);
      }
    });

    // Send the multipart/form-data POST
    this.requestService.submitHelpRequest(formData).subscribe({
      next: () => {
        alert('Request submitted successfully!');
        this.resetForm();
      },
      error: err => {
        console.error('Submit failed:', err);
        alert('Something went wrong during submission.');
      }
    });
  }

  getTotalCost(): number {
    return this.selectedEmployees.reduce((total, emp) => total + (emp.price || 0), 0);
  }

  // Get the cost of the most expensive selected employee (worst case scenario)
  getMaxPotentialCost(): number {
    if (this.selectedEmployees.length === 0) return 0;
    return Math.max(...this.selectedEmployees.map(emp => emp.price || 0));
  }

  // Get the cost of the cheapest selected employee (best case scenario)
  getMinPotentialCost(): number {
    if (this.selectedEmployees.length === 0) return 0;
    return Math.min(...this.selectedEmployees.map(emp => emp.price || 0));
  }

  getUserBalance(): number {
    // Use the stored balance instead of trying to access the ViewChild
    return this.userBalancePoints;
  }

  canAffordCurrentSelection(): boolean {
    // User should be able to afford at least the most expensive employee
    // This ensures they can pay whoever accepts the request
    return this.getMaxPotentialCost() <= this.getUserBalance();
  }

  private resetForm() {
    this.requestHeading = '';
    this.requestContent = '';
    this.selectedEmployees = [];
    this.userBalancePoints = 0;
    this.active = 0;
  }

  private base64ToFile(base64: string, filename: string): File {
    const arr   = base64.split(',');
    const mime  = arr[0].match(/:(.*?);/)![1];
    const bstr  = atob(arr[1]);
    let   n     = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}