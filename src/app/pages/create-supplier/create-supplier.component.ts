import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SupplierService} from '../../services/supplier.service';
import {Router} from '@angular/router';
import {SupplierModel} from '../../model/supplier.model';
import {CONSTANTS} from '../../shared/constants';
import {NgClass} from '@angular/common';

export interface SupplierDetail {
  id?: number;
  activeMode?: string;
}


@Component({
  selector: 'app-create-supplier',
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './create-supplier.component.html',
  styleUrl: './create-supplier.component.css'
})
export class CreateSupplierComponent implements OnInit, OnDestroy {
  protected supplierForm: FormGroup = new FormGroup({})
  private supplierService = inject(SupplierService);
  private subscriptions: Subscription[] = [];
  private fb: FormBuilder = new FormBuilder();
  protected supplierDetail: SupplierDetail = {};

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const supplierDetailTemp = currNav?.extras.state as SupplierDetail;
    this.supplierDetail = supplierDetailTemp;
    if (supplierDetailTemp && supplierDetailTemp.id && supplierDetailTemp.activeMode) {
      const subscription = this.supplierService.findSupplierById(supplierDetailTemp.id).subscribe({
        next: (response) => {
          this.initForm(response.body, this.supplierDetail.activeMode == 'view');
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
    this.initForm(null, this.supplierDetail ? this.supplierDetail.activeMode == 'view' : false);
  }

  initForm(supplierModel: SupplierModel | null, disable: boolean): void {
    this.supplierForm = this.fb.group({
      codiceProvenienza: [{
        value: supplierModel ? supplierModel.codiceProvenienza : '',
        disabled: disable
      }, Validators.required],
      partitaIva: [{value: supplierModel ? supplierModel.partitaIva : '', disabled: disable}, Validators.required],
      telefono: [{value: supplierModel ? supplierModel.telefono : '', disabled: disable}],
      indirizzo: [{value: supplierModel ? supplierModel.indirizzo : '', disabled: disable}],
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
    if (this.supplierForm.valid) {

      if (this.supplierDetail && this.supplierDetail.activeMode == 'create') {
        this.createSupplier();
      } else if (this.supplierDetail && this.supplierDetail.activeMode == 'update') {
        this.updateSupplier();
      }
    } else {
      this.supplierForm.markAllAsTouched();
    }
  }

  private updateSupplier() {
    const supplierModel: SupplierModel = {
      id: this.supplierDetail.id,
      codiceProvenienza: this.supplierForm.get('codiceProvenienza')?.value,
      partitaIva: this.supplierForm.get('partitaIva')?.value,
      telefono: this.supplierForm.get('telefono')?.value == "" ? null : this.supplierForm.get('telefono')?.value,
      indirizzo: this.supplierForm.get('indirizzo')?.value == "" ? null : this.supplierForm.get('indirizzo')?.value,
    }

    const subscription = this.supplierService.updateSupplier(supplierModel).subscribe({
      next: (response) => {
        console.debug('Response {}', response.body);
      },
      complete: () => {
        this.subscriptions.push(subscription);
        this.router.navigateByUrl('/suppliers', {state: {title: CONSTANTS.update_supplier_success}});
      }
    });
  }

  private createSupplier() {
    const supplierModel: SupplierModel = {
      codiceProvenienza: this.supplierForm.get('codiceProvenienza')?.value,
      partitaIva: this.supplierForm.get('partitaIva')?.value,
      telefono: this.supplierForm.get('telefono')?.value == "" ? null : this.supplierForm.get('telefono')?.value,
      indirizzo: this.supplierForm.get('indirizzo')?.value == "" ? null : this.supplierForm.get('indirizzo')?.value,
    };

    const subscription = this.supplierService.createSupplier(supplierModel).subscribe({
      next: (response) => {
        console.debug('Response {}', response.body);
      },
      complete: () => {
        this.subscriptions.push(subscription);
        this.router.navigateByUrl('/suppliers', {state: {title: CONSTANTS.create_supplier_success}});
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.supplierForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
