import {TestBed} from '@angular/core/testing';

import {AnimaliService} from './animali.service';

describe('AnimaliService', () => {
  let service: AnimaliService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimaliService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
