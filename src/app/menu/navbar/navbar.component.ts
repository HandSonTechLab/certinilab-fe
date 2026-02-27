import {Component, OnInit, signal} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {MENU_ITEMS} from '../../menu-items';
import {NgForOf} from '@angular/common';
import {filter} from 'rxjs/operators';
import {FormsModule} from '@angular/forms';
import {LoginService} from '../../services/login/login.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    NgForOf,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, private loginService: LoginService) {
  }
  protected readonly menuItems = MENU_ITEMS;
  protected selectedItem = signal(this.menuItems[2]);

  ngOnInit() {
    // Aggiorna stato all'avvio e ad ogni navigazione
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const activeRoute = event.urlAfterRedirects.substring(1);
        let menuItem = this.menuItems[2];
        this.menuItems.forEach(item => {
          if (activeRoute.includes(item.route)) {
            menuItem = item;
          }
        })
        this.selectedItem.set(menuItem);
      });
  }

  logout() {
    this.loginService.logout();
  }
}
