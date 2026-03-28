import {Component, inject} from '@angular/core';
import {LoginService} from '../../services/login/login.service';

@Component({
  selector: 'app-logout-success',
  imports: [],
  templateUrl: './logout-success.component.html',
  styleUrl: './logout-success.component.css'
})
export class LogoutSuccessComponent {
  private loginService = inject(LoginService);

  login() {
    this.loginService.login();
  }
}
