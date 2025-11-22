import {TestBed} from '@angular/core/testing';

import {MagazzinoService} from './magazzino.service';

describe('MagazzinoService', () => {
  let service: MagazzinoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MagazzinoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
