import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SupplierService} from '../../services/supplier.service';
import {Router} from '@angular/router';
import {SupplierModel} from '../../model/supplier.model';

export interface SupplierDetail {
  codiceProvenienza?: string;
  activeMode?: string;
}


@Component({
  selector: 'app-create-supplier',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-supplier.component.html',
  styleUrl: './create-supplier.component.css'
})
export class CreateSupplierComponent {
  protected supplierForm: FormGroup = new FormGroup({})
  private supplierService = inject(SupplierService);
  private subscriptions: Subscription[] = [];
  private fb: FormBuilder = new FormBuilder();
  protected supplierDetail: SupplierDetail = {};

  constructor(private router: Router) {
    const currNav = this.router.getCurrentNavigation();
    const supplierDetailTemp = currNav?.extras.state as SupplierDetail
    if (supplierDetailTemp && supplierDetailTemp.codiceProvenienza && supplierDetailTemp.activeMode) {
      this.supplierDetail = supplierDetailTemp;
      const subscription = this.supplierService.findSupplierById(supplierDetailTemp.codiceProvenienza).subscribe({
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
}
