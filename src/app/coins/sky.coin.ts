import { BaseCoin } from './base.coin';
import { SKYCOIN_ID } from '../constants/coins-id';

export class SkyCoin extends BaseCoin {
  constructor() {
    super({
      id: SKYCOIN_ID,
      nodeUrl: '/v1/api/',
      nodeVersion: '1.0',
      coinName: 'SkyCoin',
      coinSymbol: 'SKY',
      hoursName: 'SkyHours'
    });
  }
}
