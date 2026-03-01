import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AnimaliService} from '../../services/animali.service';
import {LocaliService} from '../../services/locali.service';
import {LottiService} from '../../services/lotti.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Animale} from '../../model/animale.model';
import {Fornitore} from '../../model/fornitore.model';
import {Locale} from '../../model/locale.model';
import {SupplierService} from '../../services/supplier.service';
import {LottoRequest} from '../../model/lotto-request.model';
import {CONSTANTS} from '../../shared/constants';

@Component({
  selector: 'app-gestione-lotti',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestione-lotti.component.html',
  styleUrl: './gestione-lotti.component.css'
})
export class GestioneLottiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private animaliService = inject(AnimaliService);
  private localiService = inject(LocaliService);
  private lottiService = inject(LottiService);
  private fornitoriService = inject(SupplierService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form!: FormGroup;
  animali: Animale[] | null = [];
  fornitori: Fornitore[] | null = [];
  locali: Locale[] | null = [];

  isSubmitting = false;
  formSubmitted = false;
  lottoId: number | null = null;
  title = 'Nuovo Lotto';

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      animaleId: [null, Validators.required],
      localeId: [null, Validators.required],
      fornitoreId: [null, Validators.required],
      dataDiNascita: [null, Validators.required],
      quantitaIniziale: [null, [Validators.required, Validators.min(1)]],
      quantitaCorrente: [null, [Validators.required, Validators.min(0)]],
      numeroMorti: [null, Validators.min(0)],
      prezzoUnitario: [null] // opzionale
    });
  }

  private loadDropdownData(): void {
    this.animaliService.getAnimali().subscribe({
      next: (res) => (this.animali = res.body),
      error: () => (this.animali = [])
    });


    this.fornitoriService.recuperaFornitoriPerDropdown().subscribe({
      next: (res) => (this.fornitori = res.body),
      error: () => (this.fornitori = [])
    });

    this.localiService.getLocali().subscribe({
      next: (res) => (this.locali = res.body),
      error: () => (this.locali = [])
    });
  }


  private checkEditMode(): void {
    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.lottoId = +idParam;
        this.title = 'Modifica Lotto';
        this.loadLotto(this.lottoId);
      }
    });
  }

  private loadLotto(id: number): void {
    this.lottiService.getById(id).subscribe({
      next: (lotto) => {
        this.form.patchValue({
          animaleId: lotto.body?.animaleId,
          localeId: lotto.body?.localeId,
          fornitoreId: lotto.body?.fornitoreId,
          dataDiNascita: lotto.body?.dataDiNascita,
          quantitaIniziale: lotto.body?.quantitaIniziale,
          quantitaCorrente: lotto.body?.quantitaCorrente,
          numeroMorti: lotto.body?.numeroMorti,
          prezzoUnitario: lotto.body?.prezzoUnitario ?? null
        });
      },
      error: () => {
        this.router.navigate(['/lotti'], {
          state: {error: 'Lotto non trovato'}
        });
      }
    });
  }

  // helper per template: errore se campo invalido + (formSubmitted o touched)
  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    if (!control) return false;
    return control.invalid && (control.touched || this.formSubmitted);
  }

  onBlurField(fieldName: string): void {
    const control = this.form.get(fieldName);
    control?.markAsTouched();
  }

  onQuantitaInizialeChanged(): void {
    if (!this.lottoId) {
      const value = this.form.get('quantitaIniziale')?.value;
      if (value != null && this.form.get('quantitaCorrente')?.pristine) {
        this.form.get('quantitaCorrente')?.setValue(value);
      }
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.form.value;
    const payload: LottoRequest = {
      animaleId: formValue.animaleId,
      localeId: formValue.localeId,
      fornitoreId: formValue.fornitoreId,
      dataDiNascita: formValue.dataDiNascita, // input type="date" -> yyyy-MM-dd
      quantitaIniziale: formValue.quantitaIniziale,
      quantitaCorrente: formValue.quantitaCorrente,
      numeroMorti: formValue.numeroMorti,
      prezzoUnitario:
        formValue.prezzoUnitario !== null && formValue.prezzoUnitario !== ''
          ? Number(formValue.prezzoUnitario)
          : null
    };

    const request$ = this.lottoId
      ? this.lottiService.update(this.lottoId, payload)
      : this.lottiService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/lotti', {state: {title: this.lottoId ? CONSTANTS.update_lotto_request_success : CONSTANTS.create_lotto_request_success_message}}]);
      },
      error: () => {
        this.isSubmitting = false;
        this.router.navigate(['/lotti'], {
          state: {error: 'Errore nel salvataggio del lotto'}
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/lotti']);
  }
}
