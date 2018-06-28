import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/startWith';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ApiService } from './api.service';
import { WalletService } from './wallet.service';
import { ConnectionError } from '../enums/connection-error.enum';

@Injectable()
export class BlockchainService {
  private progressSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isLoaded = false;
  private intervalSubscription: Subscription;

  get progress() {
    return this.progressSubject.asObservable();
  }

  constructor (
    private apiService: ApiService,
    private walletService: WalletService,
    private ngZone: NgZone
  ) {
  }

  lastBlock(): Observable<any> {
    return this.apiService.get('last_blocks', { num: 1 })
      .map(response => response.blocks[0]);
  }

  coinSupply(): Observable<any> {
    return this.apiService.get('coinSupply');
  }

  loadBlockchainBlocks() {
    if (!!this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }

    this.isLoaded = false;
    this.checkConnectionState()
      .filter(status => !!status)
      .subscribe(() => {
          this.ngZone.runOutsideAngular(() => {
            this.intervalSubscription = IntervalObservable
              .create(90000)
              .startWith(1)
              .flatMap(() => this.getBlockchainProgress())
              .takeWhile((response: any) => !response.current || !this.isLoaded)
              .subscribe(
                (response: any) => this.onBlockchainProgress(response),
                () => this.onLoadBlockchainError()
              );
          });
        },
        () => this.onLoadBlockchainError()
      );
  }

  private getBlockchainProgress() {
    return this.apiService.get('blockchain/progress');
  }

  private onBlockchainProgress(response: any) {
    this.ngZone.run(() => {
      this.progressSubject.next(response);

      if (response.current === response.highest) {
        this.completeLoading();
      }
    });
  }

  private completeLoading() {
    this.isLoaded = true;
    this.walletService.loadBalances();
  }

  private onLoadBlockchainError(error: ConnectionError = ConnectionError.UNAVAILABLE_BACKEND) {
    this.ngZone.run(() => {
      this.progressSubject.next({ isError: true, error: error });
    });
  }

  private checkConnectionState(): Observable<any> {
    return this.apiService.get('network/connections')
      .map((status: any) => {
        if (!status.connections || status.connections.length === 0) {
          this.onLoadBlockchainError(ConnectionError.NO_ACTIVE_CONNECTIONS);
          return null;
        }

        return status;
      });
  }
}
