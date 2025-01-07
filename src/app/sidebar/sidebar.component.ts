import {Component, signal} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MENU_ITEMS} from '../menu-items';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgClass,
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

  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  selectMenuItem(item: { name: string, icon: string, route: string }) {
    this.selectedItem.set(item);
  }
}
