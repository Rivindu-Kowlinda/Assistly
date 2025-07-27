import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

import { ChipBasicDemo } from '../../components/chip/chip';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TextArea } from '../../components/text-box/text-box';
import { EmployeeList } from '../../components/employee-list/employee-list';
import { EmployeeTabs } from '../../components/scrollable-tabs/scrollable-tabs';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-request',
  standalone: true,
  templateUrl: './request.html',
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
    EmployeeTabs
  ]
})
export class Request {
  constructor(private requestService: RequestService) {}

  @ViewChild('requestTextBox') requestTextBox!: TextArea;
  @ViewChild('summaryTextBox') summaryTextBox!: TextArea;

  active = 0;
  requestHeading = '';
  requestContent = '';
  selectedEmployees: any[] = [];

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
    const payload = {
      heading: this.requestHeading,
      description: this.requestContent,
      recipientIds: this.selectedEmployees.map(emp => emp.id)
    };
    formData.append('data', JSON.stringify(payload));

    const container = this.requestTextBox?.getNativeElement() || document;
    const imageElements: HTMLImageElement[] = Array.from(container.querySelectorAll('img'));

    for (let i = 0; i < imageElements.length; i++) {
      const base64 = imageElements[i].src;
      if (base64.startsWith('data:image')) {
        const file = this.base64ToFile(base64, `embedded-${i}.png`);
        formData.append('images', file);
      }
    }

    this.requestService.submitHelpRequest(formData).subscribe({
      next: () => {
        alert('Request submitted successfully!');
        this.resetForm();
      },
      error: (err) => {
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
