import { TestBed } from '@angular/core/testing';

import { CustomHeaderInterceptor } from './custom-header.interceptor';

describe('CustomHeaderInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CustomHeaderInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: CustomHeaderInterceptor = TestBed.inject(CustomHeaderInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
