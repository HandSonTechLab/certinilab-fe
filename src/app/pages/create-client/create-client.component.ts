import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import {ClientsService} from '../../services/clients.service';
import {ClientModel} from '../../model/client.model';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {CONSTANTS} from '../../shared/constants';

export interface ViewUser {
  userId: number;
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
  protected isViewMode: boolean = false;

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const viewUser = currNav?.extras.state as ViewUser
    if (viewUser) {
      this.isViewMode = true;
      const subscription = this.clientService.findClientById(viewUser.userId).subscribe({
        next: (response) => {
          this.initForm(response.body);
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

  initForm(clientModel: ClientModel | null): void {
    if (clientModel) {
      this.clienteForm = this.fb.group({
        nome: [{value: clientModel.nome, disabled: true}, Validators.required],
        cognome: [{value: clientModel.cognome, disabled: true}, Validators.required],
        cellulare: [{value: clientModel.cellulare, disabled: true}, Validators.required],
        dataNascita: [{value: clientModel.dataNascita, disabled: true}],
        codiceFiscale: [{value: clientModel.codiceFiscale, disabled: true}],
        codiceIdentificativoAsl: [{value: clientModel.codiceIdentificativoAsl, disabled: true}],
        indirizzo: [{value: clientModel.indirizzo, disabled: true}, Validators.required],
        provincia: [{value: clientModel.provincia,disabled: true}, Validators.required],
        comune: [{value: clientModel.comune,disabled: true}, Validators.required],
      });
    } else {
      this.initEmptyForm()
    }
  }

  ngOnInit() {
    this.initEmptyForm()
  }

  initEmptyForm() {
    this.clienteForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      cellulare: ['', Validators.required],
      dataNascita: [''],
      codiceFiscale: [''],
      codiceIdentificativoAsl: [''],
      indirizzo: ['', Validators.required],
      provincia: ['', Validators.required],
      comune: ['', Validators.required],
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
      const newClient: ClientModel =  {
        nome: this.clienteForm.get('nome')?.value,
        cognome: this.clienteForm.get('cognome')?.value,
        cellulare: this.clienteForm.get('cellulare')?.value,
        codiceFiscale: this.clienteForm.get('codiceFiscale')?.value == "" ? null : this.clienteForm.get('codiceFiscale')?.value,
        indirizzo: this.clienteForm.get('indirizzo')?.value,
        provincia: this.clienteForm.get('provincia')?.value,
        comune: this.clienteForm.get('comune')?.value,
        codiceIdentificativoAsl: this.clienteForm.get('codiceIdentificativoAsl')?.value == "" ? null : this.clienteForm.get('codiceIdentificativoAsl')?.value,
        dataNascita: this.clienteForm.get('dataNascita')?.value == "" ? null : this.clienteForm.get('dataNascita')?.value,
      };

      const subscription = this.clientService.createClient(newClient).subscribe({
        next: (response) => {
          console.debug('Response {}', response);
        },
        complete: () => {
          this.subscriptions.push(subscription);
          this.router.navigateByUrl('/clients', { state: { title: CONSTANTS.create_client_success} });
        }
      });

    } else {
      this.clienteForm.markAllAsTouched();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

}
