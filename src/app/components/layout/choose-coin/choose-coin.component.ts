import { Component, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CoinService } from '../../../services/coin.service';
import { BaseCoin } from '../../../coins/basecoin';

@Component({
  selector: 'app-choose-coin',
  templateUrl: 'choose-coin.component.html',
  styleUrls: ['choose-coin.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ChooseCoinComponent),
    multi: true
  }]
})
export class ChooseCoinComponent implements OnInit, ControlValueAccessor {
  coins: BaseCoin[];
  selectedCoin: BaseCoin;

  constructor(
    private coinService: CoinService
  ) {
  }

  ngOnInit() {
    this.coins = this.coinService.coins;
  }

  onCoinChanged(coin: BaseCoin) {
    this.selectedCoin = coin;
    this.onChangeCallback(this.selectedCoin);
  }

  writeValue(obj: any) {
    this.selectedCoin = obj;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
  }

  private onChangeCallback: any = () => {};
}
