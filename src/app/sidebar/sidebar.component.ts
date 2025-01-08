import {Component, signal} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {MENU_ITEMS} from '../menu-items';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Menu items
  menuItems = MENU_ITEMS;
  isCollapsed = signal(false);
  selectedItem = signal(this.menuItems[0]);

  selectMenuItem(item: { name: string, icon: string, route: string }) {
    this.selectedItem.set(item);
  }
}
