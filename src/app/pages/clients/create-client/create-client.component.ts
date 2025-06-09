import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  styleUrl: './create-client.component.css'
})
export class CreateClientComponent {
  clienteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      cellulare: ['', Validators.required],
      dataNascita: [''],
      codiceFiscale: [''],
      indirizzo: ['', Validators.required],
      provincia: ['', Validators.required],
      comune: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.clienteForm.valid) {
      console.log('Dati cliente:', this.clienteForm.value);
      // Qui puoi chiamare un servizio per salvare il cliente
    } else {
      this.clienteForm.markAllAsTouched();
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.clienteForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

}
