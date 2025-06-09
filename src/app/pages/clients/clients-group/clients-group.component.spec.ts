import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsGroupComponent } from './clients-group.component';

describe('ClientsComponent', () => {
  let component: ClientsGroupComponent;
  let fixture: ComponentFixture<ClientsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
