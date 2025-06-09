import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MENU_ITEMS} from '../../menu-items';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    NgForOf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  protected readonly menuItems = MENU_ITEMS;
  protected selectedItem = signal(this.menuItems[0]);
  selectMenuItem(item: { name: string, icon: string, route: string }) {
    this.selectedItem.set(item);
  }
}
