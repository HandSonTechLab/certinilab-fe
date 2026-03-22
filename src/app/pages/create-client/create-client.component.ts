import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import {ClientsService} from '../../services/clients.service';
import {ClientModel} from '../../model/client.model';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CONSTANTS} from '../../shared/constants';
import {UpdateClientModel} from '../../model/update-client.model';

export interface UserDetail {
  userId?: number;
  activeMode?: string;
}

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  styleUrl: './create-client.component.css'
})
export class CreateClientComponent implements OnInit, OnDestroy {

  protected clienteForm: FormGroup = new FormGroup({})
  private clientService = inject(ClientsService);
  private subscriptions: Subscription[] = [];
  private fb: FormBuilder = new FormBuilder();
  protected userDetail: UserDetail = {};

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const userDetailTemp = currNav?.extras.state as UserDetail
    this.userDetail = userDetailTemp;
    if (userDetailTemp && userDetailTemp.userId && userDetailTemp.activeMode) {
      const subscription = this.clientService.findClientById(userDetailTemp.userId).subscribe({
        next: (response) => {
          this.initForm(response.body, this.userDetail.activeMode == 'view');
        },
        error: (error) => {
          this.subscriptions.push(subscription);
        },
        complete: () => {
          this.subscriptions.push(subscription);
        }
      })
    }
  }

  ngOnInit() {
    this.initForm(null, this.userDetail ? this.userDetail.activeMode == 'view' : false);
  }

  initForm(clientModel: ClientModel | null, disable: boolean): void {
    this.clienteForm = this.fb.group({
      nome: [{value: clientModel ? clientModel.nome : '', disabled: disable}, Validators.required],
      cognome: [{value: clientModel ? clientModel.cognome : '', disabled: disable}, Validators.required],
      cellulare: [{value: clientModel ? clientModel.cellulare : '', disabled: disable}, Validators.required],
      dataNascita: [{value: clientModel ? clientModel.dataNascita : '', disabled: disable}],
      codiceFiscale: [{value: clientModel ? clientModel.codiceFiscale : '', disabled: disable}],
      codiceIdentificativoAsl: [{value: clientModel ? clientModel.codiceIdentificativoAsl : '', disabled: disable}],
      email: [{value: clientModel ? clientModel.email : '', disabled: disable}],
      indirizzo: [{value: clientModel ? clientModel.indirizzo : '', disabled: disable}, Validators.required],
      provincia: [{value: clientModel ? clientModel.provincia : '', disabled: disable}, Validators.required],
      comune: [{value: clientModel ? clientModel.comune : '', disabled: disable}, Validators.required],
    });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach(subscription => {
      console.log('I am unsubscribing subscription');
      subscription.unsubscribe()
    });
  }

  onSubmit() {
    if (this.clienteForm.valid) {

      if (this.userDetail && this.userDetail.activeMode == 'create') {
        this.createClient();
      } else if (this.userDetail && this.userDetail.activeMode == 'update') {
        this.updateClient();
      }
    } else {
      this.clienteForm.markAllAsTouched();
    }
  }

  private updateClient() {
    const clientToBeUpdated: UpdateClientModel = {
      id: this.userDetail.userId!!,
      nome: this.clienteForm.get('nome')?.value,
      cognome: this.clienteForm.get('cognome')?.value,
      cellulare: this.clienteForm.get('cellulare')?.value,
      codiceFiscale: this.clienteForm.get('codiceFiscale')?.value == "" ? null : this.clienteForm.get('codiceFiscale')?.value,
      indirizzo: this.clienteForm.get('indirizzo')?.value,
      provincia: this.clienteForm.get('provincia')?.value,
      comune: this.clienteForm.get('comune')?.value,
      codiceIdentificativoAsl: this.clienteForm.get('codiceIdentificativoAsl')?.value == "" ? null : this.clienteForm.get('codiceIdentificativoAsl')?.value,
      email: this.clienteForm.get('email')?.value == "" ? null : this.clienteForm.get('email')?.value,
      dataNascita: this.clienteForm.get('dataNascita')?.value == "" ? null : this.clienteForm.get('dataNascita')?.value,
    }

    const subscription = this.clientService.updateClient(clientToBeUpdated).subscribe({
      next: (response) => {
        console.debug('Response {}', response.body);
      },
      complete: () => {
        this.subscriptions.push(subscription);
        this.router.navigateByUrl('/clienti', {state: {title: CONSTANTS.update_client_success}});
      }
    });
  }

  private createClient() {
    const newClient: ClientModel = {
      id: null,
      nome: this.clienteForm.get('nome')?.value,
      cognome: this.clienteForm.get('cognome')?.value,
      cellulare: this.clienteForm.get('cellulare')?.value,
      codiceFiscale: this.clienteForm.get('codiceFiscale')?.value == "" ? null : this.clienteForm.get('codiceFiscale')?.value,
      indirizzo: this.clienteForm.get('indirizzo')?.value,
      provincia: this.clienteForm.get('provincia')?.value,
      comune: this.clienteForm.get('comune')?.value,
      codiceIdentificativoAsl: this.clienteForm.get('codiceIdentificativoAsl')?.value == "" ? null : this.clienteForm.get('codiceIdentificativoAsl')?.value,
      email: this.clienteForm.get('email')?.value == "" ? null : this.clienteForm.get('email')?.value,
      dataNascita: this.clienteForm.get('dataNascita')?.value == "" ? null : this.clienteForm.get('dataNascita')?.value,
    };

    const subscription = this.clientService.createClient(newClient).subscribe({
      next: (response) => {
        console.debug('Response {}', response.body);
      },
      complete: () => {
        this.subscriptions.push(subscription);
        this.router.navigateByUrl('/clienti', {state: {title: CONSTANTS.create_client_success}});
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  onCancel(): void {
    this.router.navigate(['/clienti']);
  }

}
