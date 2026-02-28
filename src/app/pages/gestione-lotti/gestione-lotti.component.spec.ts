import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GestioneLottiComponent} from './gestione-lotti.component';

describe('GestioneLottiComponent', () => {
  let component: GestioneLottiComponent;
  let fixture: ComponentFixture<GestioneLottiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneLottiComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GestioneLottiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
