import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatMenuModule, MatIconModule, MatTooltipModule } from '@angular/material';

import { TopBarComponent } from './top-bar.component';
import { WalletService } from '../../../../services/wallet.service';
import { CoinService } from '../../../../services/coin.service';
import { MockTranslatePipe, MockWalletService, MockCoinService } from '../../../../utils/test-mocks';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopBarComponent, MockTranslatePipe ],
      imports: [
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        RouterTestingModule
      ],
      providers: [
        { provide: WalletService, useClass: MockWalletService },
        { provide: CoinService, useClass: MockCoinService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
