import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RegistrazioneVenditaComponent} from './registrazione-vendita.component';

describe('RegistrazioneVenditaComponent', () => {
  let component: RegistrazioneVenditaComponent;
  let fixture: ComponentFixture<RegistrazioneVenditaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrazioneVenditaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegistrazioneVenditaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
