import {TestBed} from '@angular/core/testing';

import {Modello4Service} from './modello4.service';

describe('Modello4Service', () => {
  let service: Modello4Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Modello4Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
