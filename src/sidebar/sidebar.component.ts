import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = false;

  // Menu items
  menuItems = [
    { name: 'Clienti', icon: 'bi bi-people'},
    { name: 'Fornitori', icon: 'bi bi-truck'},
    { name: 'Vendita al banco', icon: 'bi bi-shop'},
    { name: 'Report', icon: 'bi bi-clipboard2-data'}
  ];

  selectedItem = this.menuItems[0];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectMenuItem(item: any) {
    this.selectedItem = item;
  }
}
