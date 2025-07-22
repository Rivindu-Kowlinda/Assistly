import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Settings } from '../settings/settings'; // 👈 Update this path to your actual settings component

@Component({
  selector: 'admin-sidebar',
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css'],
  standalone: true,
  imports: [DrawerModule, ButtonModule, CommonModule, Settings] // 👈 Added Settings component
})
export class AdminSidebar implements OnInit {
  isOpen = false;
  isMobile = false;
  settingsDrawerVisible = false;

  constructor(public router: Router) {}

  ngOnInit() {
    this.updateView();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateView();
  }

  private updateView() {
    this.isMobile = window.innerWidth <= 768;
    this.isOpen = !this.isMobile;
  }

  toggleNavbar() {
    this.isOpen = !this.isOpen;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  openSettingsDrawer() {
    this.settingsDrawerVisible = true;
    if (this.isMobile) {
      this.isOpen = false;
    }
  }
}
