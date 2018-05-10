import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

import { ConnectionModel } from '../models/connection.model';

@Injectable()
export class AppService {

  private error: number;

  constructor(
    private apiService: ApiService
  ) {
    this.monitorConnections();
  }

  private monitorConnections() {
    IntervalObservable
      .create(1500)
      .flatMap(() => this.retrieveConnections())
      .subscribe(
        connections => this.setConnectionError(connections),
        error => this.error = 2
      );
  }

  private retrieveConnections(): Observable<ConnectionModel[]> {
    return this.apiService.get('network/connections');
  }

  private setConnectionError(response: any) {
    if (response.connections.length === 0) {
      this.error = 1;
    }
    if (response.connections.length > 0 && this.error === 1) {
      this.error = null;
    }
  }
}
