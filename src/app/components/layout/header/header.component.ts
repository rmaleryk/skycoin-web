import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { PriceService } from '../../../services/price.service';
import { WalletService } from '../../../services/wallet.service';
import { BlockchainService } from '../../../services/blockchain.service';
import { ConnectionError } from '../../../enums/connection-error.enum';
import { TotalBalance } from '../../../app.datatypes';
import { CoinService } from '../../../services/coin.service';
import { BaseCoin } from '../../../coins/basecoin';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() headline: string;

  coins = 0;
  hours: number;
  balance: string;
  hasPendingTxs: boolean;
  connectionError: ConnectionError = null;
  connectionErrorsList = ConnectionError;
  percentage: number;
  querying = true;
  current: number;
  highest: number;
  currentCoin: BaseCoin;

  private isBlockchainLoading = true;
  private isBalanceLoaded = false;
  private price: number;
  private priceSubscription: ISubscription;
  private walletSubscription: ISubscription;
  private blockchainSubscription: ISubscription;
  private coinSubscription: ISubscription;

  get loading() {
    return this.isBlockchainLoading || !this.balance || !this.isBalanceLoaded;
  }

  constructor(
    private priceService: PriceService,
    private walletService: WalletService,
    private blockchainService: BlockchainService,
    private coinService: CoinService
  ) {}

  ngOnInit() {
    this.coinSubscription = this.coinService.currentCoin
      .subscribe((coin: BaseCoin) => {
        this.reloadBlockchain();
        this.reloadBalance();
        this.currentCoin = coin;
      });

    this.blockchainSubscription = this.blockchainService.progress
      .filter(response => !!response)
      .subscribe(response => this.updateBlockchainProgress(response));

    this.priceSubscription = this.priceService.price
      .subscribe(price => {
        this.price = price;
        this.calculateBalance();
      });

    this.walletSubscription = this.walletService.totalBalance
      .subscribe((balance: TotalBalance) => {
        if (balance) {
          this.coins = balance.coins;
          this.hours = balance.hours;

          this.calculateBalance();
          this.isBalanceLoaded = true;
        }
      });

    this.walletService.hasPendingTransactions
      .subscribe(hasPendingTxs => this.hasPendingTxs = hasPendingTxs);
  }

  onCoinChanged(coin: BaseCoin) {
    this.coinService.changeCoin(coin);
  }

  ngOnDestroy() {
    this.priceSubscription.unsubscribe();
    this.walletSubscription.unsubscribe();
    this.blockchainSubscription.unsubscribe();
    this.coinSubscription.unsubscribe();
  }

  private reloadBalance() {
    this.coins = 0;
    this.price = null;
    this.balance = null;
    this.isBalanceLoaded = false;

    this.walletService.loadBalances();
  }

  private reloadBlockchain() {
    this.isBlockchainLoading = true;
    this.percentage = null;
    this.current = null;
    this.highest = null;

    this.blockchainService.loadBlockchainBlocks();
  }

  private updateBlockchainProgress(response) {
    if (response.isError) {
      this.setConnectionError(response.error);
      return;
    }

    this.connectionError = null;
    this.isBlockchainLoading = response.highest !== response.current;
    this.querying = !this.isBlockchainLoading;

    if (this.isBlockchainLoading) {
      this.highest = response.highest;
      this.current = response.current;
    }

    this.percentage = response.current && response.highest ? (response.current / response.highest) : 0;
  }

  private calculateBalance() {
    if (this.price) {
      const balance = Math.round(this.coins * this.price * 100) / 100;
      this.balance = '$' + balance.toFixed(2) + ' ($' + (Math.round(this.price * 100) / 100) + ')';
    }
  }

  private setConnectionError(error: ConnectionError) {
    if (!this.connectionError) {
      this.connectionError = error;
    }
  }
}
