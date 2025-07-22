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
import { ScrollableTabs } from '../../components/scrollable-tabs/scrollable-tabs';

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
    ScrollableTabs
  ],
  template: `
    <app-sidebar></app-sidebar>
    <div class="main-wrapper">
      <p-stepper [value]="active">
        <!-- Step I -->
        <p-step-item [value]="0">
          <p-step>Enter Request</p-step>
          <p-step-panel>
            <ng-template #content let-activateCallback="activateCallback">
              <div class="flex flex-column h-12rem">
                <div
                  class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium"
                >
                  <textBox 
                    #requestTextBox
                    (contentChange)="onRequestContentChange($event)"
                    [value]="requestContent"
                  ></textBox>
                </div>
              </div>
              <div class="flex py-4">
                <p-button 
                  label="Next" 
                  (onClick)="goToNextStep(activateCallback, 1)"
                ></p-button>
              </div>
            </ng-template>
          </p-step-panel>
        </p-step-item>

        <!-- Step II -->
        <p-step-item [value]="1">
          <p-step>Select User</p-step>
          <p-step-panel>
            <ng-template #content let-activateCallback="activateCallback" let-deactivateCallback="deactivateCallback">
              <div class="flex flex-column h-12rem">
                <div
                  class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium"
                >
                  <employee-list (selectionChange)="onEmployeeSelectionChange($event)"></employee-list>
                </div>
              </div>
              <div class="flex py-4 gap-2">
                <p-button
                  label="Back"
                  severity="secondary"
                  (onClick)="deactivateCallback()"
                ></p-button>
                <p-button 
                  label="Next" 
                  (onClick)="goToNextStep(activateCallback, 2)"
                ></p-button>
              </div>
            </ng-template>
          </p-step-panel>
        </p-step-item>

        <!-- Step III -->
        <p-step-item [value]="2">
          <p-step>Summary</p-step>
          <p-step-panel>
            <ng-template #content let-deactivateCallback="deactivateCallback">
              <div class="flex flex-column h-12rem">
                <div
                  class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium"
                >
                  <div class="summary-container flex w-full">
                    <div class="summary-text flex-1">
                      <h4>Request Content:</h4>
                      <textBox 
                        #summaryTextBox 
                        [disabled]="true"
                        [value]="requestContent"
                      ></textBox>
                    </div>
                    <div id="userSummary" class="flex-1">
                      <h4>Selected Users:</h4>
                      <scrollable-tabs></scrollable-tabs>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex py-4 gap-2">
                <p-button 
                  label="Back" 
                  severity="secondary"
                  (onClick)="deactivateCallback()"
                ></p-button>
                <p-button 
                  label="Submit"
                  (onClick)="onSubmit()"
                ></p-button>
              </div>
            </ng-template>
          </p-step-panel>
        </p-step-item>
      </p-stepper>
    </div>
  `,
  styles: [`
    .summary-container {
      gap: 20px;
      padding: 20px;
      height: 100%;
    }
    
    .summary-text, #userSummary {
      min-height: 300px;
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
    this.selectedEmployees = employees;
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

  onSubmit() {
    const submissionData = {
      requestContent: this.requestContent,
      selectedEmployees: this.selectedEmployees,
      timestamp: new Date()
    };
    
    console.log('Submitting request:', submissionData);
    // Add your submission logic here
    alert('Request submitted successfully!');
  }

  addChip() {
    const v = this.inputValue.trim();
    if (v) {
      this.chips.push(v);
      this.inputValue = '';
    }
  }
}