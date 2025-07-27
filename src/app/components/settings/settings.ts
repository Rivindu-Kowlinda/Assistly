import { Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RolePrice } from '../../services/employee.service';
import { RolePriceService } from '../../services/role-price.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
  standalone: true,
  imports: [
    DrawerModule,
    ButtonModule,
    SelectButtonModule,
    InputNumberModule,
    FormsModule,
    CommonModule
  ]
})
export class Settings implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  roles = [
    { label: 'Senior', value: 'SENIOR' },
    { label: 'Mid', value: 'MID' },
    { label: 'Junior', value: 'JUNIOR' }
  ];

  rolePoints: { [role: string]: { id: string; cost: number } } = {
    SENIOR: { id: '', cost: 0 },
    MID: { id: '', cost: 0 },
    JUNIOR: { id: '', cost: 0 }
  };

  selectedRole: string = 'SENIOR';
  selectedRolePoints: number = 0;

  constructor(private priceService: RolePriceService) {}

  ngOnInit(): void {
    this.loadPrices();
  }

  loadPrices() {
    this.priceService.getPrices().subscribe({
      next: (data) => {
        for (let item of data) {
          const role = item.role.toUpperCase();
          this.rolePoints[role] = { id: item.id, cost: item.cost };
        }
        this.onRoleChange(); // refresh display
      },
      error: (err) => {
        console.error('Failed to load role prices:', err);
      }
    });
  }

  onRoleChange() {
    this.selectedRolePoints = this.rolePoints[this.selectedRole].cost;
  }

  onPointsChange() {
    if (this.selectedRolePoints !== null && this.selectedRolePoints !== undefined) {
      this.rolePoints[this.selectedRole].cost = this.selectedRolePoints;
    }
  }

  saveSettings() {
    const payload: RolePrice[] = Object.keys(this.rolePoints).map(role => ({
      id: this.rolePoints[role].id,
      role,
      cost: this.rolePoints[role].cost
    }));

    this.priceService.updatePrices(payload).subscribe({
      next: () => {
        console.log('Prices updated successfully:', payload);
        this.visibleChange.emit(false);
      },
      error: (err) => {
        console.error('Failed to update role prices:', err);
      }
    });
  }
}
