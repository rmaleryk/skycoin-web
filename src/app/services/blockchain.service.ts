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
  private isLoaded = false;

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
    this.checkConnectionState().subscribe(
      () => {
        this.ngZone.runOutsideAngular(() => {
          IntervalObservable
          .create(90000)
          .startWith(1)
          .flatMap(() => this.getBlockchainProgress())
          .takeWhile((response: any) => !response.current || !this.isLoaded)
          .subscribe(
            response => this.onBlockchainProgress(response),
            () => { throw new Error(ConnectionError.UNAVAILABLE_BACKEND); }
          );
        });
      },
      (error: Error) => this.onLoadBlockchainError(error)
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

  private onLoadBlockchainError(error: Error) {
    const connectionError = ConnectionError[error.message] || ConnectionError.UNAVAILABLE_BACKEND;
    this.progressSubject.next({ isError: true, error: connectionError });
  }

  private checkConnectionState(): Observable<ConnectionError> {
    return this.apiService.get('network/connections')
      .map(response => {
        if (response.connections.length === 0) {
          throw new Error(ConnectionError.NO_ACTIVE_CONNECTIONS);
        }

        return null;
      });
  }
}
