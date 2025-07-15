import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  isOpen = false;
  isMobile = false;

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
    // auto‐close on mobile after navigation
    if (this.isMobile) {
      this.isOpen = false;
    }
  }
}
