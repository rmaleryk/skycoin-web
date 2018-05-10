import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PriceService } from '../../../services/price.service';
import { WalletService } from '../../../services/wallet.service';
import { BlockchainService } from '../../../services/blockchain.service';
import { AppService } from '../../../services/app.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string;

  private current: number;
  private highest: number;
  private percentage: number;
  private querying = true;
  private coins: number;
  private hours: number;
  private price: number;
  private priceSubscription: Subscription;
  private walletSubscription: Subscription;
  private blockchainSubscription: Subscription;

  get balance() {
    if (this.price === null) {
      return 'loading..';
    }
    const balance = Math.round(this.coins * this.price * 100) / 100;
    return '$' + balance.toFixed(2) + ' ($' + (Math.round(this.price * 100) / 100) + ')';
  }

  get loading() {
    return !this.current || !this.highest || this.current !== this.highest;
  }

  constructor(
    private appService: AppService,
    private priceService: PriceService,
    private walletService: WalletService,
    private blockchainService: BlockchainService
  ) {}

  ngOnInit() {
    this.priceSubscription = this.priceService.price.subscribe(price => this.price = price);
    this.walletSubscription = this.walletService.wallets.subscribe(wallets => {
      this.coins = wallets.map(wallet => wallet.balance >= 0 ? wallet.balance : 0).reduce((a , b) => a + b, 0);
      this.hours = wallets.map(wallet => wallet.hours >= 0 ? wallet.hours : 0).reduce((a , b) => a + b, 0);
    });

    this.blockchainSubscription = this.blockchainService.progress
      .filter(response => !!response)
      .subscribe(response => {
        this.querying = false;
        this.highest = response.highest;
        this.current = response.current;
        this.percentage = this.current && this.highest ? (this.current / this.highest) : 0;
      });
  }

  ngOnDestroy() {
    this.priceSubscription.unsubscribe();
    this.walletSubscription.unsubscribe();
    this.blockchainSubscription.unsubscribe();
  }
}
