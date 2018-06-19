import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/startWith';

import { ApiService } from './api.service';
import { WalletService } from './wallet.service';
import { ConnectionError } from '../enums/connection-error.enum';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BlockchainService {
  private progressSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get progress() {
    return this.progressSubject.asObservable();
  }

  constructor (
    private apiService: ApiService,
    private walletService: WalletService,
    private ngZone: NgZone
  ) {
    this.loadBlockchainBlocks();
  }

  lastBlock(): Observable<any> {
    return this.apiService.get('last_blocks', { num: 1 })
      .map(response => response.blocks[0]);
  }

  coinSupply(): Observable<any> {
    return this.apiService.get('coinSupply');
  }

  private loadBlockchainBlocks() {
    let isLoaded = false;

    this.checkConnectionState().subscribe(
      () => {
        this.ngZone.runOutsideAngular(() => {
          IntervalObservable
          .create(90000)
          .startWith(1)
          .flatMap(() => this.getBlockchainProgress())
          .takeWhile((response: any) => !response.current || !isLoaded)
          .subscribe(
            response => {
              this.ngZone.run(() => {
                this.progressSubject.next(response);

                if (response.current === response.highest) {
                  isLoaded = true;
                  this.completeLoading();
                }
              });
            },
            () => {
              throw ConnectionError.UNAVAILABLE_BACKEND;
            }
          );
        });
      },
      (error: any) => this.onLoadBlockchainError(
        !!ConnectionError[error]
        ? error
        : ConnectionError.UNAVAILABLE_BACKEND
      )
    );
  }

  private getBlockchainProgress() {
    return this.apiService.get('blockchain/progress');
  }

  private completeLoading() {
    this.walletService.loadBalances();
  }

  private onLoadBlockchainError(error: ConnectionError) {
    this.progressSubject.next({ isError: true, error: error });
  }

  private checkConnectionState(): Observable<ConnectionError> {
    return this.apiService.get('network/connections')
      .map(response => {
        if (response.connections.length === 0) {
          throw ConnectionError.NO_ACTIVE_CONNECTIONS;
        }

        return null;
      });
  }
}
