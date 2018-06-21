import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { PendingTransactionsComponent } from './pending-transactions.component';
import { WalletService } from '../../../../services/wallet.service';
import { NavBarService } from '../../../../services/nav-bar.service';
import { Wallet } from '../../../../app.datatypes';
import { BaseCoin } from '../../../../coins/basecoin';
import { CoinService } from '../../../../services/coin.service';

class MockWalletService {
  get all(): Observable<Wallet[]> {
    return Observable.of([]);
  }

  getAllPendingTransactions() {
    return Observable.of([]);
  }

  getTransactionDetails() {
    return Observable.of({});
  }
}

class MockNavBarService {
  activeComponent = new BehaviorSubject({});

  showSwitch(leftText: any, rightText: any) {}

  hideSwitch() {}
}

class MockCoinService {
  currentCoin = new BehaviorSubject<BaseCoin>(null);
}

@Pipe({name: 'translate'})
class MockTranslatePipe implements PipeTransform {
  transform() {
    return 'translated value';
  }
}

@Pipe({name: 'dateTime'})
class MockDateTimePipe implements PipeTransform {
  transform() {
    return 'transformed value';
  }
}

describe('PendingTransactionsComponent', () => {
  let component: PendingTransactionsComponent;
  let fixture: ComponentFixture<PendingTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PendingTransactionsComponent,
        MockDateTimePipe,
        MockTranslatePipe
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: WalletService, useClass: MockWalletService },
        { provide: NavBarService, useClass: MockNavBarService },
        { provide: CoinService, useClass: MockCoinService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
