// src/app/components/request/request.ts
import { Component, ViewChild } from '@angular/core';
import { FormsModule }          from '@angular/forms';
import { InputTextModule }      from 'primeng/inputtext';
import { ButtonModule }         from 'primeng/button';
import { StepperModule }        from 'primeng/stepper';

import { Sidebar }              from '../../components/sidebar/sidebar';
import { TextArea }             from '../../components/text-box/text-box';
import { EmployeeList }         from '../../components/employee-list/employee-list';
import { EmployeeTabs }         from '../../components/scrollable-tabs/scrollable-tabs';
import { RequestService }       from '../../services/request.service';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [
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

  active = 0;
  requestHeading = '';
  requestContent = '';
  selectedEmployees: any[] = [];

  constructor(private requestService: RequestService) {}

  onRequestContentChange(content: string) {
    this.requestContent = content;
  }

  onEmployeeSelectionChange(employees: any[]) {
    this.selectedEmployees = [...employees];
  }

  onEmployeeRemoved(employee: any) {
    this.selectedEmployees = this.selectedEmployees.filter(emp => emp.id !== employee.id);
  }

  canGoToStep2(): boolean {
    return this.requestHeading.trim().length > 0 && this.requestContent.trim().length > 0;
  }

  goToNextStep(activateCallback: Function, stepIndex: number) {
    if (stepIndex === 1 && !this.canGoToStep2()) return;
    if (stepIndex === 2 && this.selectedEmployees.length === 0) return;

    this.active = stepIndex;
    activateCallback(stepIndex);

    if (stepIndex === 2 && this.summaryTextBox) {
      this.summaryTextBox.setContent(this.requestContent);
    }
  }

  canSubmit(): boolean {
    return (
      this.requestHeading.trim().length > 0 &&
      this.requestContent.trim().length > 0 &&
      this.selectedEmployees.length > 0
    );
  }

  onSubmit() {
    if (!this.canSubmit()) {
      alert('Please enter request heading, content, and select at least one employee.');
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

  private resetForm() {
    this.requestHeading = '';
    this.requestContent = '';
    this.selectedEmployees = [];
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