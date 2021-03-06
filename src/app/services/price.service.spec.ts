import { TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { HttpModule, XHRBackend } from '@angular/http';

import { PriceService } from './price.service';
import { CoinService } from './coin.service';
import { MockCoinService } from '../utils/test-mocks';

describe('PriceService', () => {
  let priceService: PriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        PriceService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: CoinService, useClass: MockCoinService }
      ]
    });

    priceService = TestBed.get(PriceService);
  });

  it('should be created', () => {
    expect(priceService).toBeTruthy();
  });
});
