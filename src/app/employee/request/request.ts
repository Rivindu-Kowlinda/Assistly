import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Sidebar } from '../../components/sidebar/sidebar';
import { TextArea } from '../../components/text-box/text-box';
import { EmployeeList } from '../../components/employee-list/employee-list';
import { EmployeeTabs } from '../../components/scrollable-tabs/scrollable-tabs';
import { RequestService } from '../../services/request.service';
import { NotificationService } from '../../services/notification.service';

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

  active = 1; 
  requestHeading = '';
  requestContent = '';
  selectedEmployees: any[] = [];
  userBalancePoints = 0;

  constructor(
    private requestService: RequestService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onRequestContentChange(content: string) {
    const bodyText = this.getTextContent(content);
    this.requestContent = bodyText.length > 0 ? content : '';
  }

  private getTextContent(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  onEmployeeSelectionChange(employees: any[]) {
    this.selectedEmployees = [...employees];
  }

  onBalanceUpdated(balance: number) {
    this.userBalancePoints = balance;
  }

  onEmployeeRemoved(employee: any) {
    this.selectedEmployees = this.selectedEmployees.filter(emp => emp.id !== employee.id);
  }

  canGoToStep2(): boolean {
    const hasHeading = this.requestHeading.trim().length > 0;
    const hasBody    = this.getTextContent(this.requestContent).length > 0;
    return hasHeading && hasBody;
  }

  canGoToStep3(): boolean {
    return this.selectedEmployees.length > 0 && this.canAffordCurrentSelection();
  }

  goToNextStep(activateCallback: Function, stepIndex: number) {
    if ((stepIndex === 2 && !this.canGoToStep2()) || (stepIndex === 3 && !this.canGoToStep3())) {
      return;
    }
    this.active = stepIndex;
    activateCallback(stepIndex);
    if (stepIndex === 3 && this.summaryTextBox) {
      const cleanContent = this.requestTextBox?.getContentForSubmission() || this.requestContent;
      this.summaryTextBox.setContent(cleanContent);
    }
  }

  goToPrevStep(deactivateCallback: Function) {
    if (this.active > 1) {
      this.active--;
      deactivateCallback();
    }
  }

  canSubmit(): boolean {
    const hasHeading = this.requestHeading.trim().length > 0;
    const hasBody    = this.getTextContent(this.requestContent).length > 0;
    return hasHeading && hasBody && this.selectedEmployees.length > 0 && this.canAffordCurrentSelection();
  }

  getSubmitButtonLabel(): string {
    if (!this.canSubmit()) {
      if (!this.requestHeading.trim() || !this.getTextContent(this.requestContent)) {
        return 'Complete Required Fields';
      }
      if (this.selectedEmployees.length === 0) {
        return 'No Employees Selected';
      }
      return 'Insufficient Points';
    }
    return 'Submit Request';
  }

  onSubmit() {
    if (!this.canSubmit()) {
      let errorMessage = 'Cannot submit request: ';
      if (!this.requestHeading.trim()) {
        errorMessage += 'Request heading is required. ';
      }
      if (!this.getTextContent(this.requestContent)) {
        errorMessage += 'Request content is required. ';
      }
      if (this.selectedEmployees.length === 0) {
        errorMessage += 'At least one employee must be selected. ';
      }
      if (!this.canAffordCurrentSelection()) {
        const maxCost = this.getMaxPotentialCost();
        const userPts = this.getUserBalance();
        errorMessage += `Insufficient points. Max potential cost: ${maxCost}, Available: ${userPts}. `;
      }
      this.notificationService.showNotification(errorMessage.trim(), 'error');
      return;
    }

    const formData = new FormData();
    
    const cleanContent = this.requestTextBox?.getContentForSubmission() || this.requestContent;
    
    const payload = {
      heading: this.requestHeading,
      description: cleanContent, 
      recipientIds: this.selectedEmployees.map(emp => emp.id),
      recipientUsernames: this.selectedEmployees.map(emp => emp.name),
      cost: this.selectedEmployees.reduce((sum, emp) => sum + (emp.price || 0), 0)
    };
    formData.append('data', JSON.stringify(payload));

    const images = this.requestTextBox?.getImages() || [];
    images.forEach((imageSrc, i) => {
      if (imageSrc.startsWith('data:image')) {
        const file = this.base64ToFile(imageSrc, `embedded-${i}.png`);
        formData.append('images', file);
      }
    });

    this.requestService.submitHelpRequest(formData).subscribe({
      next: () => {
        this.notificationService.showNotification('Request submitted successfully!', 'success');
        this.resetForm();
        this.router.navigate(['/employeeDashboard']);
      },
      error: err => {
        console.error('Submit failed:', err);
        this.notificationService.showNotification('Something went wrong during submission.', 'error');
      }
    });
  }

  getTotalCost(): number {
    return this.selectedEmployees.reduce((total, emp) => total + (emp.price || 0), 0);
  }

  getMaxPotentialCost(): number {
    return this.selectedEmployees.length > 0
      ? Math.max(...this.selectedEmployees.map(emp => emp.price || 0))
      : 0;
  }

  getMinPotentialCost(): number {
    return this.selectedEmployees.length > 0
      ? Math.min(...this.selectedEmployees.map(emp => emp.price || 0))
      : 0;
  }

  getUserBalance(): number {
    return this.userBalancePoints;
  }

  canAffordCurrentSelection(): boolean {
    return this.getMaxPotentialCost() <= this.getUserBalance();
  }

  private resetForm() {
    this.requestHeading = '';
    this.requestContent = '';
    this.selectedEmployees = [];
    this.userBalancePoints = 0;
    this.active = 1; 
  }

  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}