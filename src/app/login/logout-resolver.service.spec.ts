import { TestBed, inject } from '@angular/core/testing';

import { LogoutResolver } from './logout-resolver.service';

describe('LogoutResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogoutResolver]
    });
  });

  it('should be created', inject([LogoutResolver], (service: LogoutResolver) => {
    expect(service).toBeTruthy();
  }));
});
