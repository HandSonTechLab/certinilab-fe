import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {of} from 'rxjs';

import {RegistrazioneVenditaComponent} from './registrazione-vendita.component';
import {AnimaleDisponibile} from '../../model/ordine.model';

describe('RegistrazioneVenditaComponent', () => {
  let component: RegistrazioneVenditaComponent;
  let fixture: ComponentFixture<RegistrazioneVenditaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrazioneVenditaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {queryParamMap: of(convertToParamMap({}))},
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrazioneVenditaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // helper: registra un animale disponibile e lo seleziona sulla prima riga
  function selezionaAnimale(quantitaDisponibile: number): FormGroup {
    const localeId = 1;
    const animale: AnimaleDisponibile = {
      idLotto: 100,
      idAnimale: 200,
      dataDiNascita: '2025-01-01',
      codiceProvenienza: 'X1',
      fornitoreId: 9,
      descrizione: 'Gallina Rossa',
      prezzoUnitario: 2,
      quantita: quantitaDisponibile,
    };
    component.animaliPerLocale[localeId] = [animale];

    const group = component.dettagliAnimali.at(0) as FormGroup;
    group.get('localeId')?.setValue(localeId);
    group.get('animaleId')?.setValue(animale.idAnimale);
    component.onAnimaleChange(0);
    return group;
  }

  it('should store the available quantita on the row when an animal is selected', () => {
    const group = selezionaAnimale(10);
    expect(group.get('quantitaDisponibile')?.value).toBe(10);
  });

  it('should mark quantita invalid with a max error when it exceeds the available quantita', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(11);
    component.onValoriRigaChange(0);

    expect(quantitaCtrl?.valid).toBeFalse();
    expect(quantitaCtrl?.errors?.['max']).toBeTruthy();
    expect(quantitaCtrl?.errors?.['max'].max).toBe(10);
  });

  it('should keep quantita valid when it is within the available quantita', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(10);
    component.onValoriRigaChange(0);

    expect(quantitaCtrl?.valid).toBeTrue();
  });

  it('should mark quantita invalid with a min error when it is below 1', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(0);
    component.onValoriRigaChange(0);

    expect(quantitaCtrl?.valid).toBeFalse();
    expect(quantitaCtrl?.errors?.['min']).toBeTruthy();
  });

  describe('arrotondamento totali a 2 decimali', () => {
    it('should round the animal row total and the animals total to 2 decimals (PER_UNITA)', () => {
      const group = component.dettagliAnimali.at(0) as FormGroup;
      group.get('tipoVendita')?.setValue('PER_UNITA');
      group.get('quantita')?.setValue(3);
      group.get('prezzoUnitario')?.setValue(0.1); // 0.1 * 3 = 0.30000000000000004
      component.onValoriRigaChange(0);

      expect(group.get('totaleRiga')?.value).toBe(0.3);
      expect(component.totaleAnimali()).toBe(0.3);
    });

    it('should round the animal row total to 2 decimals (AL_KG)', () => {
      const group = component.dettagliAnimali.at(0) as FormGroup;
      group.get('tipoVendita')?.setValue('AL_KG');
      group.get('peso')?.setValue(1.111);
      group.get('prezzoUnitario')?.setValue(3); // 1.111 * 3 = 3.333 -> 3.33
      component.onValoriRigaChange(0);

      expect(group.get('totaleRiga')?.value).toBe(3.33);
      expect(component.totaleAnimali()).toBe(3.33);
    });

    it('should round the mangime row total and the mangime total to 2 decimals', () => {
      component.addRigaMangime();
      const group = component.mangimi.at(0) as FormGroup;
      group.get('prezzoAlKg')?.setValue(0.1);
      group.get('kg')?.setValue(3); // 0.1 * 3 = 0.30000000000000004
      component.onValoriMangimeChange(0);

      expect(group.get('totaleRiga')?.value).toBe(0.3);
      expect(component.totaleMangime()).toBe(0.3);
    });

    it('should round the scatola row total and the scatole total to 2 decimals', () => {
      component.addRigaScatola();
      const group = component.scatole.at(0) as FormGroup;
      group.get('prezzoUnitario')?.setValue(0.1);
      group.get('quantita')?.setValue(3); // 0.1 * 3 = 0.30000000000000004
      component.onValoriScatolaChange(0);

      expect(group.get('totaleRiga')?.value).toBe(0.3);
      expect(component.totaleScatole()).toBe(0.3);
    });

    it('should round the overall order total to 2 decimals', () => {
      // animali
      const animale = component.dettagliAnimali.at(0) as FormGroup;
      animale.get('tipoVendita')?.setValue('PER_UNITA');
      animale.get('quantita')?.setValue(3);
      animale.get('prezzoUnitario')?.setValue(0.1);
      component.onValoriRigaChange(0);

      // mangime
      component.addRigaMangime();
      const mangime = component.mangimi.at(0) as FormGroup;
      mangime.get('prezzoAlKg')?.setValue(0.1);
      mangime.get('kg')?.setValue(3);
      component.onValoriMangimeChange(0);

      // scatole
      component.addRigaScatola();
      const scatola = component.scatole.at(0) as FormGroup;
      scatola.get('prezzoUnitario')?.setValue(0.1);
      scatola.get('quantita')?.setValue(3);
      component.onValoriScatolaChange(0);

      // 0.3 + 0.3 + 0.3 = 0.8999999999999999 -> 0.9
      expect(component.totaleOrdine()).toBe(0.9);
    });
  });

  it('should re-evaluate the max validation against the newly selected animal', () => {
    const group = selezionaAnimale(10);
    const quantitaCtrl = group.get('quantita');

    quantitaCtrl?.setValue(8);
    component.onValoriRigaChange(0);
    expect(quantitaCtrl?.valid).toBeTrue();

    // l'utente cambia animale: ora ne sono disponibili solo 5
    const animale: AnimaleDisponibile = {
      idLotto: 101,
      idAnimale: 201,
      dataDiNascita: '2025-02-02',
      codiceProvenienza: 'X2',
      fornitoreId: 9,
      descrizione: 'Gallina Nera',
      prezzoUnitario: 2,
      quantita: 5,
    };
    component.animaliPerLocale[1].push(animale);
    group.get('animaleId')?.setValue(201);
    component.onAnimaleChange(0);

    expect(group.get('quantitaDisponibile')?.value).toBe(5);
    expect(quantitaCtrl?.valid).toBeFalse();
    expect(quantitaCtrl?.errors?.['max'].max).toBe(5);
  });
});
