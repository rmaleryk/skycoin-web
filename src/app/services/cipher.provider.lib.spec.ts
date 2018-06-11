import { TestBed } from '@angular/core/testing';
import { readJSON } from 'karma-read-json';

import { CipherProvider } from './cipher.provider';
import { testCases } from '../utils/jasmine-utils';
import { environment } from '../../environments/environment';

declare var CipherExtras;

describe('CipherProvider Lib', () => {
  let cipherProvider: CipherProvider;
  const fixturesPath = 'e2e/test-fixtures/';
  const addressesFileName = 'many-addresses.json';
  const inputHashesFileName = 'input-hashes.json';

  const seedSignaturesFiles = [
    'seed-0000.json', 'seed-0001.json', 'seed-0002.json',
    'seed-0003.json', 'seed-0004.json', 'seed-0005.json',
    'seed-0006.json', 'seed-0007.json', 'seed-0008.json',
    'seed-0009.json', 'seed-0010.json'
  ];

  const quickModeSettings = { addressCount: 30, seedFilesCount: 2 };
  const extensiveModeSettings = { addressCount: 1000, seedFilesCount: 11 };
  const testSettings = environment.cipherTestMode === 'extensive' ? extensiveModeSettings : quickModeSettings;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [CipherProvider]
    });

    cipherProvider = TestBed.get(CipherProvider);
  });

  describe('generate address', () => {
    const addressFixtureFile = readJSON(fixturesPath + addressesFileName);
    const expectedAddresses = addressFixtureFile.keys.slice(0, testSettings.addressCount);
    let seed = convertAsciiToHexa(atob(addressFixtureFile.seed));
    let generatedAddress;

    testCases(expectedAddresses, (address: any) => {
      it('should generate many address correctly', done => {
        generatedAddress = cipherProvider.generateAddress(seed);
        seed = generatedAddress.next_seed;

        const convertedAddress = {
          address: generatedAddress.address,
          public: generatedAddress.public_key,
          secret: generatedAddress.secret_key
        };

        expect(convertedAddress).toEqual(address);
        done();
      });

      it('should pass the verification', done => {
        verifyAddress(generatedAddress);
        done();
      });
    });
  });

  describe('seed signatures', () => {
    const inputHashes = readJSON(fixturesPath + inputHashesFileName).hashes;

    testCases(seedSignaturesFiles.slice(0, testSettings.seedFilesCount), (fileName: string) => {
      describe(`should pass the verification for ${fileName}`, () => {
        let seedKeys;
        let actualAddresses;
        let testData: { signature: string, public_key: string, hash: string, secret_key: string, address: string }[] = [];

        beforeAll(() => {
          const signaturesFixtureFile = readJSON(fixturesPath + fileName);
          let seed = convertAsciiToHexa(atob(signaturesFixtureFile.seed));
          seedKeys = signaturesFixtureFile.keys;

          actualAddresses = seedKeys.map(() => {
            const generatedAddress = cipherProvider.generateAddress(seed);
            seed = generatedAddress.next_seed;

            return generatedAddress;
          });

          testData = getSeedTestData(inputHashes, seedKeys, actualAddresses);
        });

        it('should check number of signatures and hashes', done => {
          const result = seedKeys.some(key => key.signatures.length !== inputHashes.length);

          expect(result).toEqual(false);
          done();
        });

        it('should generate many address correctly', done => {
          actualAddresses.forEach((address, index) => {
            expect(address.address).toEqual(seedKeys[index].address);
            expect(address.public_key).toEqual(seedKeys[index].public);
            expect(address.secret_key).toEqual(seedKeys[index].secret);
          });

          done();
        });

        it('address should pass the verification', done => {
          verifyAddresses(actualAddresses);
          done();
        });

        it(`should verify signature correctly`, done => {
          testData.forEach(data => {
            const result = CipherExtras.VerifySignature(data.public_key, data.signature, data.hash);
              expect(result).toBeUndefined();
              done();
          });
        });

        it(`should check signature correctly`, done => {
          testData.forEach(data => {
            const result = CipherExtras.ChkSig(data.address, data.hash, data.signature);
              expect(result).toBeUndefined();
              done();
          });
        });

        it(`should verify signed hash correctly`, done => {
          testData.forEach(data => {
            const result = CipherExtras.VerifySignedHash(data.signature, data.hash);
              expect(result).toBeUndefined();
              done();
          });
        });

        it(`should generate public key correctly`, done => {
          testData.forEach(data => {
            const pubKey = CipherExtras.PubKeyFromSig(data.signature, data.hash);

            expect(pubKey).toBeTruthy();
            expect(pubKey === data.public_key).toBeTruthy();
            done();
          });
        });

        it(`sign hash should be created`, done => {
          testData.forEach(data => {
            const sig = CipherExtras.SignHash(data.hash, data.secret_key);
            expect(sig).toBeTruthy();
            done();
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

function getSeedTestData(inputHashes, seedKeys, actualAddresses) {
  const data = [];

  for (let seedIndex = 0; seedIndex < seedKeys.length; seedIndex++) {
    for (let hashIndex = 0; hashIndex < inputHashes.length; hashIndex++) {
      data.push({
        signature: seedKeys[seedIndex].signatures[hashIndex],
        public_key: actualAddresses[seedIndex].public_key,
        secret_key: actualAddresses[seedIndex].secret_key,
        address: actualAddresses[seedIndex].address,
        hash: inputHashes[hashIndex]
      });
    }
  }

  return data;
}

function verifyAddress(address) {
  const addressFromPubKey = CipherExtras.AddressFromPubKey(address.public_key);
  const addressFromSecKey = CipherExtras.AddressFromSecKey(address.secret_key);

  expect(addressFromPubKey && addressFromSecKey && addressFromPubKey === addressFromSecKey).toBe(true);

  expect(CipherExtras.VerifySeckey(address.secret_key)).toBe(1);
  expect(CipherExtras.VerifyPubkey(address.public_key)).toBe(1);
}

function verifyAddresses(addresses) {
  addresses.map(address => {
    verifyAddress(address);
  });
}
