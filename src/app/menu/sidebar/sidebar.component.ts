import {Component, signal} from '@angular/core';
import {MENU_ITEMS} from '../../menu-items';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    NgClass,
    RouterOutlet,
    NgForOf,
    RouterLinkActive,
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

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  logout() {
    // Logica di logout: cancella token, chiama servizio, reindirizza, ecc.
    console.log('Logout eseguito');
    // Esempio: localStorage.clear();
    // this.router.navigate(['/login']);
  }
}
