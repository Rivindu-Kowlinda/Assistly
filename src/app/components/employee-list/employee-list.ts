// employee-list.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableModule }       from 'primeng/table';
import { Tag }               from 'primeng/tag';
import { ButtonModule }      from 'primeng/button';
import { InputIcon }         from 'primeng/inputicon';
import { IconField }         from 'primeng/iconfield';
import { CommonModule }      from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule }   from 'primeng/inputtext';
// import { DropdownModule } from 'primeng/dropdown';  <-- removed
import { Slider }            from 'primeng/slider';
import { FormsModule }      from '@angular/forms';
import { ProgressBar }       from 'primeng/progressbar';

@Component({
  selector: 'employee-list',
  templateUrl: 'employee-list.html',
  standalone: true,
  imports: [
    TableModule, Tag, ButtonModule, IconField, InputIcon,
    CommonModule, MultiSelectModule, InputTextModule,
    /* DropdownModule removed */
    Slider, ProgressBar, FormsModule
  ],
  styles: [`
    :host ::ng-deep {
      .p-paginator {
        .p-paginator-current { margin-left: auto; }
      }

      .p-progressbar {
        height: .5rem;
        background-color: #D8DADC;
        .p-progressbar-value { background-color: #607D8B; }
      }

      .table-header { display: flex; justify-content: space-between; }

      .p-calendar .p-datepicker { min-width: 25rem;
        td { font-weight: 400; }
      }

      .p-datatable.p-datatable-customers {
        .p-datatable-header { padding:1rem; text-align:left; font-size:1.5rem; }
        .p-paginator { padding:1rem; }
        .p-datatable-thead > tr > th { text-align:left; }
        .p-datatable-tbody > tr > td { cursor:auto; }
        .p-dropdown-label:not(.p-placeholder) { text-transform:uppercase; }
      }

      .p-w-100 { width:100%; }

      /* Responsive */
      .p-datatable-customers .p-datatable-tbody > tr > td .p-column-title {
        display: none;
      }
    }

    @media screen and (max-width: 960px) {
      :host ::ng-deep {
        .p-datatable.p-datatable-customers {
          .p-datatable-thead > tr > th,
          .p-datatable-tfoot > tr > td { display: none !important; }

          .p-datatable-tbody > tr {
            border-bottom:1px solid var(--layer-2);
            > td {
              text-align:left; width:100%; display:flex; align-items:center; border:0 none;
              .p-column-title { min-width:30%; display:inline-block; font-weight:bold; }
              p-progressbar { width:100%; }
              &:last-child { border-bottom:1px solid var(--surface-d); }
            }
          }
        }
      }
    }
  `],
  template: `
<div class="card">
  <p-table
    #dt
    [value]="customers"
    [(selection)]="selectedCustomers"
    (onSelectionChange)="handleSelectionChange()"
    dataKey="id"
    [rowHover]="true"
    [rows]="10"
    [showCurrentPageReport]="true"
    [rowsPerPageOptions]="[10,25,50]"
    [loading]="loading"
    [paginator]="true"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    [filterDelay]="0"
    [globalFilterFields]="['name','country.name','representative.name','status']"
  >
    <!-- Caption with clear & search -->
    <ng-template #caption>
      <div class="flex justify-between">
        <p-button
          outlined="true"
          icon="pi pi-filter-slash"
          label="Clear"
          (click)="clear(dt)"
        ></p-button>
        <p-iconField iconPosition="left">
          <p-inputIcon><i class="pi pi-search"></i></p-inputIcon>
          <input
            pInputText
            type="text"
            [(ngModel)]="searchValue"
            (input)="dt.filterGlobal(searchValue, 'contains')"
            placeholder="Keyboard Search"
          />
        </p-iconField>
      </div>
    </ng-template>

    <!-- Header row -->
    <ng-template #header>
      <tr>
        <th style="width:4rem">
          <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
        </th>
        <th pSortableColumn="name" style="min-width:14rem">
          Name <p-sortIcon field="name"></p-sortIcon>
          <p-columnFilter
            type="text"
            field="name"
            display="menu"
            class="ml-auto"
          ></p-columnFilter>
        </th>
        <th pSortableColumn="country.name" style="min-width:14rem">
          Country <p-sortIcon field="country.name"></p-sortIcon>
          <p-columnFilter
            type="text"
            field="country.name"
            display="menu"
            class="ml-auto"
          ></p-columnFilter>
        </th>
        <th pSortableColumn="representative.name" style="min-width:14rem">
          Agent <p-sortIcon field="representative.name"></p-sortIcon>
          <p-columnFilter
            field="representative"
            matchMode="in"
            display="menu"
            [showMatchModes]="false"
            [showOperator]="false"
            [showAddButton]="false"
            class="ml-auto"
          >
            <ng-template #filter let-value let-filter="filterCallback">
              <p-multiselect
                [filter]="false"
                [ngModel]="value"
                (ngModelChange)="filter($event)"
                [options]="representatives"
                placeholder="Any"
                optionLabel="name"
                class="w-full"
              >
                <ng-template let-option #item>
                  <div class="flex items-center gap-2">
                    <img
                      [alt]="option.name"
                      src="https://primefaces.org/cdn/primeng/images/demo/avatar/{{ option.image }}"
                      style="width:32px"
                    />
                    <span>{{ option.name }}</span>
                  </div>
                </ng-template>
              </p-multiselect>
            </ng-template>
          </p-columnFilter>
        </th>
        <th pSortableColumn="date" style="min-width:14rem">
          Date <p-sortIcon field="date"></p-sortIcon>
          <p-columnFilter
            type="date"
            field="date"
            display="menu"
            class="ml-auto"
          ></p-columnFilter>
        </th>
        <th pSortableColumn="balance" style="min-width:14rem">
          Balance <p-sortIcon field="balance"></p-sortIcon>
          <p-columnFilter
            type="numeric"
            field="balance"
            display="menu"
            currency="USD"
            class="ml-auto"
          ></p-columnFilter>
        </th>

        <!-- Status column with native select filter -->
        <th pSortableColumn="status" style="min-width:14rem">
          Status <p-sortIcon field="status"></p-sortIcon>
          <p-columnFilter
            field="status"
            matchMode="equals"
            display="menu"
            class="ml-auto"
          >
            <ng-template #filter let-value let-filter="filterCallback">
              <select
                [value]="value"
                (change)="filter(($event.target as HTMLSelectElement).value)"
                class="p-inputtext w-full"
              >
                <option value="">Any</option>
                <option
                  *ngFor="let s of statuses"
                  [value]="s.value"
                >{{ s.label }}</option>
              </select>
            </ng-template>
          </p-columnFilter>
        </th>

        <th pSortableColumn="activity" style="min-width:14rem">
          Activity <p-sortIcon field="activity"></p-sortIcon>
          <p-columnFilter
            field="activity"
            matchMode="between"
            display="menu"
            [showMatchModes]="false"
            [showOperator]="false"
            [showAddButton]="false"
            class="ml-auto"
          >
            <ng-template #filter let-filter="filterCallback">
              <p-slider
                [(ngModel)]="activityValues"
                [range]="true"
                (onSlideEnd)="filter(activityValues)"
                class="m-4"
              ></p-slider>
              <div class="flex items-center justify-between px-2">
                <span>{{ activityValues[0] }}</span>
                <span>{{ activityValues[1] }}</span>
              </div>
            </ng-template>
          </p-columnFilter>
        </th>
        <th style="width:5rem"></th>
      </tr>
    </ng-template>

    <!-- Body rows -->
    <ng-template #body let-customer>
      <tr class="p-selectable-row">
        <td><p-tableCheckbox [value]="customer"></p-tableCheckbox></td>
        <td>{{ customer.name }}</td>
        <td>
          <div class="flex items-center gap-2">
            <img
              src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png"
              [class]="'flag flag-' + customer.country.code"
              style="width:20px"
            />
            <span class="ml-1 align-middle">{{ customer.country.name }}</span>
          </div>
        </td>
        <td>
          <div class="flex items-center gap-2">
            <img
              [alt]="customer.representative.name"
              src="https://primefaces.org/cdn/primeng/images/demo/avatar/{{customer.representative.image}}"
              width="32"
              style="vertical-align:middle"
            />
            <span class="ml-1 align-middle">{{ customer.representative.name }}</span>
          </div>
        </td>
        <td>{{ customer.date | date:'MM/dd/yyyy' }}</td>
        <td>{{ customer.balance | currency:'USD':'symbol' }}</td>
        <td><p-tag [value]="customer.status" [severity]="getSeverity(customer.status)"></p-tag></td>
        <td><p-progressBar [value]="customer.activity" [showValue]="false"></p-progressBar></td>
        <td style="text-align:center">
          <p-button rounded="true" icon="pi pi-cog"></p-button>
        </td>
      </tr>
    </ng-template>

    <!-- Empty message -->
    <ng-template #emptymessage>
      <tr><td colspan="8">No customers found.</td></tr>
    </ng-template>
  </p-table>
</div>
  `
})
export class EmployeeList implements OnInit {
  @Input() selection: any[] = [];
  @Output() selectionChange = new EventEmitter<any[]>();

  customers: any[] = [];
  selectedCustomers: any[] = [];
  representatives: any[] = [];
  statuses: any[] = [];
  loading: boolean = true;
  activityValues: number[] = [0, 100];
  searchValue: string = '';

  ngOnInit() {
    this.customers = [
      { id:1, name:'John Doe',
        country:{name:'USA',code:'us'},
        representative:{name:'Amy Elsner',image:'amyelsner.png'},
        date:new Date('2024-01-10'),
        balance:23000,
        status:'qualified',
        activity:70
      },
      { id:2, name:'Jane Smith',
        country:{name:'Germany',code:'de'},
        representative:{name:'Ivan Magalhaes',image:'ivanmagalhaes.png'},
        date:new Date('2024-03-22'),
        balance:15000,
        status:'proposal',
        activity:45
      },
      { id:3, name:'Alice Johnson',
        country:{name:'Japan',code:'jp'},
        representative:{name:'Anna Fali',image:'annafali.png'},
        date:new Date('2024-06-15'),
        balance:8200,
        status:'new',
        activity:30
      }
    ];

    this.representatives = [
      { name:'Amy Elsner',     image:'amyelsner.png' },
      { name:'Anna Fali',      image:'annafali.png'  },
      { name:'Ivan Magalhaes', image:'ivanmagalhaes.png' },
      { name:'Onyama Limba',   image:'onyamalimba.png' },
      { name:'Stephen Shaw',   image:'stephenshaw.png' }
    ];

    this.statuses = [
      { label:'Unqualified', value:'unqualified' },
      { label:'Qualified',   value:'qualified'   },
      { label:'New',         value:'new'         },
      { label:'Negotiation', value:'negotiation' },
      { label:'Renewal',     value:'renewal'     },
      { label:'Proposal',    value:'proposal'    }
    ];

    this.loading = false;
  }

  getSeverity(status: string) {
    switch(status) {
      case 'unqualified': return 'danger';
      case 'qualified':   return 'success';
      case 'new':         return 'info';
      case 'negotiation': return 'warn';
      case 'renewal':     return null;
      default:            return '';
    }
  }

  handleSelectionChange(event: any) {
    // Emit the selection change event with the current selected customers
    this.selectionChange.emit(this.selectedCustomers);
  }

  clear(table: any) {
    table.clear();
    this.searchValue = '';
  }
}