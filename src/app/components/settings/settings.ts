import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
export class Settings {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  roles = [
    { label: 'Senior', value: 'senior' },
    { label: 'Mid', value: 'mid' },
    { label: 'Junior', value: 'junior' }
  ];

  rolePoints = {
    senior: 5,
    mid: 3,
    junior: 2
  };

  selectedRole: string = 'senior';
  selectedRolePoints: number = 5;

  onRoleChange() {
    this.selectedRolePoints = this.rolePoints[this.selectedRole as keyof typeof this.rolePoints];
  }

  onPointsChange() {
    if (this.selectedRolePoints !== null && this.selectedRolePoints !== undefined) {
      this.rolePoints[this.selectedRole as keyof typeof this.rolePoints] = this.selectedRolePoints;
    }
  }

  saveSettings() {
    console.log('Settings saved:', this.rolePoints);
    this.visibleChange.emit(false);
  }
}