import { TestBed } from '@angular/core/testing';
import { readJSON } from 'karma-read-json';

import { testCases } from './../utils/jasmine-utils';
import { CipherProvider } from './cipher.provider';

declare var CipherExtras;

describe('CipherProvider Lib', () => {
  let cipherProvider: CipherProvider;

  const addressesFilePath = 'e2e/test-fixtures/many-addresses.json';
  const inputHashesFilePath = 'e2e/test-fixtures/input-hashes.json';

  const seedSignaturesPath = 'e2e/test-fixtures/';
  const seedSignaturesFiles = [
    'seed-0000.json', 'seed-0001.json', 'seed-0002.json',
    'seed-0003.json', 'seed-0004.json', 'seed-0005.json',
    'seed-0006.json', 'seed-0007.json', 'seed-0008.json',
    'seed-0009.json', 'seed-0010.json'
  ];

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [CipherProvider]
    });

    cipherProvider = TestBed.get(CipherProvider);
  });

  describe('generate address', () => {
    let actualAddresses = [];
    let expectedAddresses = [];

    beforeAll(() => {
      const addressFixtureFile = readJSON(addressesFilePath);
      expectedAddresses = addressFixtureFile.keys;

      let seed = convertAsciiToHexa(atob(addressFixtureFile.seed));

      actualAddresses = expectedAddresses.map(address => {
        const generatedAddress = cipherProvider.generateAddress(seed);
        seed = generatedAddress.next_seed;

        return generatedAddress;
      });
    });

    it('should generate many address correctly', () => {
      const convertedAddresses = actualAddresses.map(address => {
        return {
          address: address.address,
          public: address.public_key,
          secret: address.secret_key
        };
      });

      expect(convertedAddresses).toEqual(expectedAddresses);
    });

    it('should pass the verification', () => {
      actualAddresses.map(address => {
        const addressFromPubKey = CipherExtras.AddressFromPubKey(address.public_key);
        const addressFromSecKey = CipherExtras.AddressFromSecKey(address.secret_key);

        expect(addressFromPubKey && addressFromSecKey && addressFromPubKey === addressFromSecKey).toBe(true);

        expect(CipherExtras.VerifySeckey(address.secret_key)).toBe(1);
        expect(CipherExtras.VerifyPubkey(address.public_key)).toBe(1);
      });
    });
  });

  fdescribe('seed signatures', () => {
    let inputHashes = [];

    beforeAll(() => {
      inputHashes = readJSON(inputHashesFilePath).hashes;
    });

    testCases(seedSignaturesFiles, (fileName: string) => {
      describe(`should pass the verification for ${fileName}`, () => {
        let seedDataArray;
        let actualAddresses;

        beforeAll(() => {
          const signaturesFixtureFile = readJSON(seedSignaturesPath + fileName);
          let seed = convertAsciiToHexa(atob(signaturesFixtureFile.seed));
          seedDataArray = signaturesFixtureFile.keys;

          actualAddresses = seedDataArray.map(() => {
            const generatedAddress = cipherProvider.generateAddress(seed);
            seed = generatedAddress.next_seed;

            return generatedAddress;
          });
        });

        it(`should verify signature correctly`, done => {
          seedDataArray.map((seedData: any, index: number) => {
            inputHashes.map((hash: string, hashIndex: number) => {
              const signature = seedData.signatures[hashIndex];
              const result = CipherExtras.VerifySignature(actualAddresses[index].public_key, signature, hash);

              expect(result).toBeUndefined();
              done();
            });
          });
        });

        it(`should check signature correctly`, done => {
          seedDataArray.map((seedData: any, index: number) => {
            inputHashes.map((hash: string, hashIndex: number) => {
              const signature = seedData.signatures[hashIndex];
              const result = CipherExtras.ChkSig(actualAddresses[index].address, hash, signature);

              expect(result).toBeUndefined();
              done();
            });
          });
        });

        it(`should verify signed hash correctly`, done => {
          seedDataArray.map((seedData: any, index: number) => {
            inputHashes.map((hash: string, hashIndex: number) => {
              const signature = seedData.signatures[hashIndex];
              const result = CipherExtras.VerifySignedHash(signature, hash);

              expect(result).toBeUndefined();
              done();
            });
          });
        });

        it(`should generate public key correctly`, done => {
          seedDataArray.map((seedData: any, index: number) => {
            inputHashes.map((hash: string, hashIndex: number) => {
              const signature = seedData.signatures[hashIndex];
              const pubKey = CipherExtras.PubKeyFromSig(signature, hash);

              expect(pubKey === actualAddresses[index].public_key).toBeTruthy();
              done();
            });
          });
        });

        it(`sign hash should be created`, done => {
          seedDataArray.map((seedData: any, index: number) => {
            inputHashes.map((hash: string, hashIndex: number) => {
              const sig = CipherExtras.SignHash(hash, actualAddresses[index].secret_key);
              expect(sig).toBeTruthy();
              done();
            });
          });
        });
      });
    });
  });
});

function convertAsciiToHexa(str): string {
  const arr1: string[] = [];
  for (let n = 0, l = str.length; n < l; n ++) {
    const hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex !== '0' ? hex : '00');
  }
  return arr1.join('');
}
