import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MENU_ITEMS} from '../menu-items';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isCollapsed = false;

  // Menu items
  menuItems = MENU_ITEMS;

  selectedItem = this.menuItems[0];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectMenuItem(item: any) {
    this.selectedItem = item;
  }
}
