import {TestBed} from '@angular/core/testing';

import {LocaliService} from './locali.service';

describe('LocaliService', () => {
  let service: LocaliService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocaliService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
