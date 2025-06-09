import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersGroupComponent } from './suppliers-group.component';

describe('SuppliersComponent', () => {
  let component: SuppliersGroupComponent;
  let fixture: ComponentFixture<SuppliersGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
