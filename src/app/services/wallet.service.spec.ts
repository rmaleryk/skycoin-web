import { TestBed, fakeAsync } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TranslateService } from '@ngx-translate/core';

import { WalletService } from './wallet.service';
import { ApiService } from './api.service';
import { CipherProvider } from './cipher.provider';
import { Wallet, Address, NormalTransaction, TransactionOutput, TransactionInput, Output, Balance, GetOutputsRequestOutput } from '../app.datatypes';

describe('WalletService', () => {
  let store = {};
  let walletService: WalletService;
  let spyApiService:  jasmine.SpyObj<ApiService>;
  let spyTranslateService: jasmine.SpyObj<TranslateService>;
  let spyCipherProvider: jasmine.SpyObj<CipherProvider>;

  beforeEach(() => {
    spyOn(localStorage, 'setItem').and.callFake((key, value) => store[key] = value);
    spyOn(localStorage, 'getItem').and.callFake((key) => store[key]);

    TestBed.configureTestingModule({
      providers: [
        WalletService,
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', {
            'getOutputs': Observable.of([]),
            'postTransaction': Observable.of(''),
            'get': Observable.of([])
          })
        },
        {
          provide: CipherProvider,
          useValue: jasmine.createSpyObj('CipherProvider', ['generateAddress', 'prepareTransaction'])
        },
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj('TranslateService', ['instant'])
        }
      ]
    });

    walletService = TestBed.get(WalletService);
    spyApiService = TestBed.get(ApiService);
    spyCipherProvider = TestBed.get(CipherProvider);
    spyTranslateService = TestBed.get(TranslateService);
  });

  afterEach(() => {
    store = {};
  });

  it('should be created', () => {
    expect(walletService).toBeTruthy();
  });

  describe('addAddress', () => {
    it('should be rejected for the null wallet seed', () => {
      const wallet = createWallet();
      wallet.seed = null;
      wallet.addresses[0].next_seed = null;
      spyTranslateService.instant.and.returnValue('trying to generate address without seed!');

      expect(() => walletService.addAddress(wallet))
        .toThrowError('trying to generate address without seed!');
    });

    it('updateWallet should be called', () => {
      const wallet = createWallet();
      const expectedWallet = createWallet();
      const newAddress = createAddress('new address');
      expectedWallet.addresses.push(newAddress);

      spyCipherProvider.generateAddress.and.returnValue(Observable.of({ ...newAddress }));
      spyOn(walletService, 'updateWallet');

      spyApiService.get.and.callFake(() => {
        return Observable.of(createBalance());
      });

      walletService.addAddress(wallet)
        .subscribe(() => {
          expect(walletService.updateWallet).toHaveBeenCalledWith(expectedWallet);
        });
    });
  });

  describe('create', () => {
    it('should create wallet', () => {
      const walletLabel = 'wallet label';
      const walletSeed = 'wallet seed';
      const walletAddress = createAddress();
      const expectedWallet = {
        label: walletLabel,
        seed: walletSeed,
        balance: 0,
        hours: 0,
        addresses: [walletAddress]
      };

      spyCipherProvider.generateAddress.and.returnValue(Observable.of({ ...walletAddress }));

      spyApiService.get.and.callFake((param) => {
        if (param === 'balance') {
          return Observable.of(createBalance());
        }
        if (param === 'pendingTxs') {
          return Observable.of([]);
        }
      });

      walletService.create(walletLabel, walletSeed)
        .subscribe(() => {
          walletService.wallets.subscribe((wallets) => {
            expect(wallets[0]).toEqual(expectedWallet);
          });
        });
    });
  });

  describe('delete', () => {
    it('should delete wallet', () => {
      const walletToDelete = createWallet();
      walletService.wallets = new BehaviorSubject([walletToDelete]);
      spyApiService.get.and.callFake((param) => Observable.of(createBalance()));

      walletService.delete(walletToDelete);

      walletService.wallets.subscribe((wallets) => {
        expect(wallets.length).toEqual(0);
      });
    });
  });

  describe('updateWallet', () => {
    it('existing wallet should be updated', fakeAsync(() => {
      const wallet = createWallet('updated label');
      walletService.wallets = new BehaviorSubject([ createWallet() ]);

      walletService.updateWallet(wallet);

      walletService.wallets.subscribe((wallets) => {
        expect(wallets.includes(wallet)).toBeTruthy();
      });
    }));

    it('trying to update the wallet with unknown address', () => {
      walletService.wallets = new BehaviorSubject([ createWallet() ]);

      const updatedWallet = createWallet();
      updatedWallet.addresses[0].address = 'non-exist address';

      spyTranslateService.instant.and.returnValue('trying to update the wallet with unknown address!');

      expect(() => walletService.updateWallet(updatedWallet))
        .toThrowError('trying to update the wallet with unknown address!');
    });
  });

  describe('unlockWallet', () => {
    it('wallet should be updated', fakeAsync(() => {
      walletService.wallets = new BehaviorSubject([ createWallet() ]);
      const inputWallet: Wallet = createWallet('wallet', 'no seed');
      const correctSeed = 'seed';

      spyCipherProvider.generateAddress.and.returnValue(Observable.of(createAddress()));
      walletService.unlockWallet(inputWallet, correctSeed);

      walletService.wallets.subscribe((wallets) => {
        expect(wallets[0].seed).toEqual(correctSeed);
      });
    }));

    it('should be rejected for the wrong seed', fakeAsync(() => {
      const wallet: Wallet = createWallet();
      const wrongSeedAddress: Address = createAddress('wrong address');

      spyCipherProvider.generateAddress.and.returnValue(Observable.of(wrongSeedAddress));
      spyTranslateService.instant.and.returnValue('Wrong seed');

      walletService.unlockWallet(wallet, 'wrong seed')
        .subscribe(
          () => fail('should be rejected'),
          (error) => expect(error.message).toBe('Wrong seed')
        );
    }));
  });

  describe('retrieveAddressTransactions', () => {
    it('should be returned obs with transactions array', fakeAsync(() => {
      const apiResponse = createAddressTransactions('owner address', 'destination address');
      const expectedTransaction = createTransaction([], 'owner address', 'destination address');

      spyApiService.get.and.returnValue( Observable.of([apiResponse]) );

      walletService.retrieveAddressTransactions( createAddress() )
        .subscribe((transactions: NormalTransaction[]) => {
          expect(transactions).toEqual([expectedTransaction]);
        });
    }));
  });

  describe('transactions', () => {
    it('should be returned outgoing transaction', fakeAsync(() => {
      const ownerAddress: Address = createAddress('owner address');
      spyOnProperty(walletService, 'addresses', 'get').and.returnValue( Observable.of([ownerAddress]) );

      const destinationAddress = 'destination address';
      const apiResponse = createAddressTransactions(ownerAddress.address, destinationAddress, 13);
      spyApiService.get.and.returnValue( Observable.of([apiResponse]) );

      const expectedTransaction: NormalTransaction = createTransaction([destinationAddress], ownerAddress.address, destinationAddress, 13, -13);

      walletService.transactions()
        .subscribe((transactions: any[]) => {
          expect(transactions).toEqual([expectedTransaction]);
        });
    }));

    it('should be returned incoming transaction', fakeAsync(() => {
      const destinationAddress: Address = createAddress('destination address');
      spyOnProperty(walletService, 'addresses', 'get').and.returnValue( Observable.of([destinationAddress]) );

      const ownerAddress = 'owner address';
      const apiResponse = createAddressTransactions(ownerAddress, destinationAddress.address, 13);
      spyApiService.get.and.returnValue( Observable.of([apiResponse]) );

      const expectedTransaction: NormalTransaction = createTransaction([destinationAddress.address], ownerAddress, destinationAddress.address, 13, 13);

      walletService.transactions()
        .subscribe((transactions: any[]) => {
          expect(transactions).toEqual([expectedTransaction]);
        });
    }));
  });

  describe('createTransaction', () => {
    it('should be returned the correct observable for the two outputs', fakeAsync(() => {
      const address = 'address';
      const amount = 21;

      const addresses = [
        createAddress('address1', 'secretKey1'),
        createAddress('address2', 'secretKey2')
      ];

      const wallet: Wallet = Object.assign(createWallet(), { addresses: addresses });

      const outputs: Output[] = [
        createOutput('address1', 'hash1', 5, 10),
        createOutput('address2', 'hash2', 10, 20),
        createOutput('address1', 'hash1', 20, 50),
        createOutput('address2', 'hash2', 50, 0)
      ];

      const expectedTxInputs: TransactionInput[] = [
        { hash: 'hash1', secret: 'secretKey1', address: 'address1', calculated_hours: 50, coins: 20 },
        { hash: 'hash2', secret: 'secretKey2', address: 'address2', calculated_hours: 20, coins: 10 }
      ];

      const expectedTxOutputs: TransactionOutput[] = [
        {
          address: wallet.addresses[0].address,
          coins: 9,
          hours: 18
        },
        {
          address: address,
          coins: 21,
          hours: 17
        }
      ];

      spyApiService.getOutputs.and.returnValue(Observable.of(outputs));
      spyCipherProvider.prepareTransaction.and.returnValue('preparedTransaction');

      walletService.createTransaction(wallet, address, amount)
        .subscribe((result: any) => {
          expect(result).toEqual({
            inputs: expectedTxInputs,
            outputs: expectedTxOutputs,
            hoursSent: 17,
            hoursBurned: 35,
            encoded: 'preparedTransaction'
          });
        });
    }));

    it('should be returned the correct observable for the one output', fakeAsync(() => {
      const address = 'address';
      const amount = 1;

      const addresses = [
        createAddress('address1', 'secretKey1')
      ];

      const wallet: Wallet = Object.assign(createWallet(), { addresses: addresses });

      const outputs: Output[] = [
        createOutput('address1', 'hash1', 1, 10)
      ];

      const expectedTxInputs: TransactionInput[] = [
        { hash: 'hash1', secret: 'secretKey1', address: 'address1', calculated_hours: 10, coins: 1 }
      ];

      const expectedTxOutputs: TransactionOutput[] = [
        {
          address: address,
          coins: 1,
          hours: 5
        }
      ];

      spyApiService.getOutputs.and.returnValue(Observable.of(outputs));
      spyCipherProvider.prepareTransaction.and.returnValue('preparedTransaction');

      walletService.createTransaction(wallet, address, amount)
        .subscribe((result: any) => {
          expect(result).toEqual({
            inputs: expectedTxInputs,
            outputs: expectedTxOutputs,
            hoursSent: 5,
            hoursBurned: 5,
            encoded: 'preparedTransaction'
          });
        });
    }));

    it('should be rejected for not enough Sky Hours', () => {
      const address = 'address';
      const amount = 2;

      const addresses = [
        createAddress('address1', 'secretKey1'),
        createAddress('address2', 'secretKey2')
      ];

      const wallet: Wallet = Object.assign(createWallet(), { addresses: addresses });

      const outputs: Output[] = [
        createOutput('address1', 'hash1', 1, 24),
        createOutput('address2', 'hash2', 1, 0)
      ];

      spyApiService.getOutputs.and.returnValue(Observable.of(outputs));
      spyTranslateService.instant.and.returnValue('Not enough available SKY Hours to perform transaction!');

      walletService.createTransaction(wallet, address, amount)
        .subscribe(
          () => fail('should be rejected'),
          (error) => expect(error.message).toBe('Not enough available SKY Hours to perform transaction!')
        );
    });
  });

  describe('outputs', () => {
    it('should be returned outputs', fakeAsync(() => {
      const walletAddress1 = 'address 1';
      const walletAddress2 = 'address 2';
      const wallet: Wallet = Object.assign(createWallet(), { addresses: [ createAddress(walletAddress1), createAddress(walletAddress2) ] });

      spyOnProperty(walletService, 'all', 'get').and.returnValue( Observable.of([wallet]) );

      const outputAddress = 'output address';
      const apiResponse = {
        head_outputs: [{
          address: outputAddress
        }]
      };
      spyApiService.get.and.returnValue( Observable.of(apiResponse) );

      const expectedOutputs = [{
        address: outputAddress
      }];

      walletService.outputs()
        .subscribe((outputs: any[]) => {
          expect(outputs).toEqual(expectedOutputs);
        });
      expect(spyApiService.get).toHaveBeenCalledWith('outputs', { addrs: `${walletAddress1},${walletAddress2}` });
    }));
  });

  describe('outputsWithWallets', () => {
    it('should be returned outputs by wallet', fakeAsync(() => {
      const walletAddress1 = 'address 1';
      const walletAddress2 = 'address 2';
      const wallet1: Wallet = Object.assign(createWallet(), { addresses: [ createAddress(walletAddress1), createAddress(walletAddress2) ] });
      const walletAddress3 = 'address 3';
      const wallet2: Wallet = Object.assign(createWallet(), { addresses: [ createAddress(walletAddress3) ] });

      spyOnProperty(walletService, 'all', 'get').and.returnValue( Observable.of([wallet1, wallet2]) );

      const output1 = createRequestOutput('hash3', walletAddress3, '33', 3 );
      const output2 = createRequestOutput('hash2', walletAddress2, '22', 2 );
      const output3 = createRequestOutput('hash1', walletAddress1, '11', 1 );

      spyOn(walletService, 'outputs').and.returnValue( Observable.of([ output1, output2, output3 ]) );

      const expectedWallet1 = Object.assign(createWallet(), { addresses: [ createAddress(walletAddress1), createAddress(walletAddress2) ] });
      const expectedWallet2 = Object.assign(createWallet(), { addresses: [ createAddress(walletAddress3) ] });

      expectedWallet1.addresses[0].outputs = [ output3 ];
      expectedWallet1.addresses[1].outputs = [ output2 ];
      expectedWallet2.addresses[0].outputs = [ output1 ];

      const expectedOutputs = [ expectedWallet1, expectedWallet2 ];

      walletService.outputsWithWallets()
        .subscribe((walletOutputs: any[]) => {
          expect(walletOutputs).toEqual(expectedOutputs);
        });
    }));
  });

  describe('sum', () => {
    it('should be correct sum of the wallets, positive balances', fakeAsync(() => {
      const wallets: Wallet[] = [
        createWallet('label1', 'seed1', 100),
        createWallet('label2', 'seed2', 200),
        createWallet('label3', 'seed3', -200)
      ];
      spyOnProperty(walletService, 'all', 'get').and.returnValue( Observable.of(wallets) );

      walletService.sum()
        .subscribe(sum => expect(sum).toBe(300));
    }));
  });

  describe('getAllPendingTransactions', () => {
    it('should be called with a correct parameter', fakeAsync(() => {
      walletService.getAllPendingTransactions();
      expect(spyApiService.get).toHaveBeenCalledWith('pendingTxs');
    }));
  });
});

function createWallet(label: string = 'label', seed: string = 'seed', balance: number = 0): Wallet {
  return {
    label: label,
    seed: seed,
    balance: balance,
    hours: 0,
    addresses: [
      createAddress()
    ]
  };
}

function createAddress(address: string = 'address', secretKey: string = 'secret key', publicKey: string = 'public key', nextSeed: string = 'next seed'): Address {
  return {
    address: address,
    secret_key: secretKey,
    public_key: publicKey,
    next_seed: nextSeed,
    balance: 0,
    hours: 0,
    outputs: []
  };
}

function createAddressTransactions(ownerAddress: string, destinationAddress: string, coins: number = 0) {
  return {
    status: {
      block_seq: 1,
      confirmed: true
    },
    timestamp: 0,
    txid: 'txid',
    inputs: [{
      owner: ownerAddress
    }],
    outputs: [{
      dst: destinationAddress,
      coins: coins
    }]
  };
}

function createTransaction(addresses: string[], ownerAddress: string, destinationAddress: string, coins: number = 0, balance: number = 0): NormalTransaction {
  return {
    addresses: addresses,
    balance: balance,
    block: 1,
    confirmed: true,
    inputs: [{
      owner: ownerAddress
    }],
    outputs: [{
      dst: destinationAddress,
      coins: coins
    }],
    timestamp: 0,
    txid: 'txid'
  };
}

function createOutput(address: string, hash: string, coins = 10, calculated_hours = 100): Output {
  return {
    address: address,
    coins: coins,
    hash: hash,
    calculated_hours: calculated_hours
  };
}

function createRequestOutput(hash: string, address: string, coins = '10', calculated_hours = 100): GetOutputsRequestOutput {
  return {
    hash: hash,
    src_tx: 'src_tx: string',
    address: address,
    coins: coins,
    calculated_hours: calculated_hours
  };
}

function createBalance(coins = 0, hours = 0): Balance {
  return {
    confirmed: {
      coins: coins,
      hours: hours
    },
    predicted: {
      coins: coins,
      hours: hours
    },
    addresses: {
      'address': {
        confirmed: {
          coins: coins,
          hours: hours
        },
        predicted: {
          coins: coins,
          hours: hours
        }
      }
    }
  };
}
