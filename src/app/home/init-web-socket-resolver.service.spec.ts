import { TestBed, inject } from '@angular/core/testing';

import { InitWebSocketResolver } from './init-web-socket-resolver.service';

describe('InitWebSocketResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InitWebSocketResolver]
    });
  });

  it('should be created', inject([InitWebSocketResolver], (service: InitWebSocketResolver) => {
    expect(service).toBeTruthy();
  }));
});
