import { browser, by, element, ExpectedConditions } from 'protractor';

export class WalletsPage {
  navigateTo() {
    return browser.get('/wallets');
  }

  getHeaderText() {
    return element(by.css('.title')).getText();
  }

  showAddWallet() {
    const btnAdd = element(by.buttonText('Add Wallet'));
    return btnAdd.click().then(() => {
      return element(by.css('app-create-wallet')).isPresent();
    });
  }

  showLoadWallet() {
    const btnLoad = element(by.buttonText('Load Wallet'));
    return btnLoad.click().then(() => {
      return element(by.css('app-create-wallet')).isPresent();
    });
  }

  createWalletCheckValidationSeed() {
    const btnCreate = element(by.buttonText('Create'));

    this.fillWalletForm('Test wallet', 'test test2', 'skycoin-web-e2e-test-seed');
    return btnCreate.isEnabled();
  }

  loadWalletCheckValidationSeed() {
    const cancelAdd = element(by.buttonText('Cancel'));
    const btnLoadWallet = element(by.buttonText('Load Wallet'));
    const btnLoad = element(by.buttonText('Load'));

    return cancelAdd.click().then(() => {
      return btnLoadWallet.click().then(() => {
        return btnLoad.isEnabled();
      });
    });
  }

  createWalletCheckValidationLabel() {
    const btnCreate = element(by.buttonText('Create'));

    this.fillWalletForm('', 'skycoin-web-e2e-test-seed', 'skycoin-web-e2e-test-seed');
    return btnCreate.isEnabled();
  }

  loadWalletCheckValidationLabel() {
    const btnLoad = element(by.buttonText('Load'));

    this.fillWalletForm('', 'skycoin-web-e2e-test-seed');
    return btnLoad.isEnabled();
  }

  createExistingWallet() {
    const btnCreate = element(by.buttonText('Create'));
    this.fillWalletForm('Test create wallet', 'skycoin-web-e2e-test-seed', 'skycoin-web-e2e-test-seed');

    return btnCreate.click().then(() => {
      return !btnCreate.isPresent();
    });
  }

  createWallet() {
    const btnCreate = element(by.buttonText('Create'));
    this.fillWalletForm(
      'Test create wallet',
      'skycoin-web-e2e-test-create-wallet-seed',
      'skycoin-web-e2e-test-create-wallet-seed'
    );

    return btnCreate.isEnabled().then(status => {
      if (!status) {
        return false;
      }

      btnCreate.click();
      return this.getWalletAddress().then((address) => {
        return address === '2KLc8ha9uAzSLsytwsAKo8avjmVXyyvTH7e';
      });
    });
  }

  loadExistingWallet() {
    const btnLoad = element(by.buttonText('Load'));
    this.fillWalletForm('Test load wallet', 'skycoin-web-e2e-test-create-wallet-seed');

    return btnLoad.click().then(() => {
      return !btnLoad.isPresent();
    });
  }

  loadWallet() {
    const btnLoad = element(by.buttonText('Load'));
    this.fillWalletForm('Test load wallet', 'skycoin-web-e2e-test-load-wallet-seed');

    return btnLoad.isEnabled().then(status => {
      if (!status) {
        return false;
      }

      btnLoad.click();
      return this.getWalletAddress().then((address) => {
        return address === 'quS3czcXyeqSAhrza7df643P4yGS8PNPap';
      });
    });
  }

  expandWallet() {
    return element.all(by.css('.-wallet')).get(1).click().then(() => {
      return element(by.css('.-record')).isPresent();
    });
  }

  showQrDialog() {
    return element(by.css('.address-column img')).click().then(() => {
      return element(by.css('app-qr-code')).isPresent();
    });
  }

  checkQrDialogAddress() {
    return element(by.css('.-address-address')).getText().then((address: string) => {
      return address === '2KLc8ha9uAzSLsytwsAKo8avjmVXyyvTH7e';
    });
  }

  hideQrDialog() {
    return element(by.css('app-modal .-header img')).click().then(() => {
      return element(by.css('app-qr-code')).isPresent();
    });
  }

  addAddress() {
    return element(by.css('.-btn-plus')).click().then(() => {
      const lastRecord = element.all(by.css('.-record')).last();
      return lastRecord.element(by.css('.address-column')).getText().then((address) => {
        return address === 'rK1CMcqXjJ59H7XXs9xR3JZMejWs56FsmY';
      });
    });
  }

  hideEmptyAddress() {
    return element.all(by.css('.-btn-minus')).first().click().then(() => {
      const parentWalletElement = element.all(by.css('.-wallet-detail')).first();
      return parentWalletElement.all(by.css('.coins-column')).filter((address) => {
        return address.getText().then(value => {
          return value === '0';
        });
      }).count();
    });
  }

  showEmptyAddress() {
    return element.all(by.css('.-btn-plus')).get(1).click().then(() => {
      return element.all(by.css('.-record')).count().then(count => {
        return count > 0;
      });
    });
  }

  showChangeWalletName() {
    return element(by.css('.-btn-edit')).click().then(() => {
      return element(by.css('app-change-name')).isPresent();
    });
  }

  changeWalletName() {
    const name = element.all(by.css('.-wallet .-label')).get(1);
    const label = element(by.css('[formcontrolname="label"]'));
    const btn = element(by.buttonText('Rename'));

    return label.clear().then(() => {
      return label.sendKeys('New Wallet Name').then(() => {
        return btn.click().then(() => {
          return name.getText().then(value => {
            return value === 'New Wallet Name';
          });
        });
      });
    });
  }

  canUnlock() {
     return this.unlockFirstWallet().then(result => {
       if (result) {
          return element.all(by.css('.-wallet .-encryption img')).first().getAttribute('src').then(source => {
            return source.includes('unlock-grey.png');
          });
        } else {
          return false;
        }
      });
  }

  unlockFirstWallet(): any {
    return element.all(by.css('.-encryption img')).first().click().then(() => {
      const seed = element(by.css('[formcontrolname="seed"]'));
      const btnUnlock = element(by.buttonText('Unlock'));
      return seed.sendKeys('skycoin-web-e2e-test-seed').then(() => {
        return btnUnlock.click().then(() => {
          return true;
        });
      });
    });
  }

  showAddAddress() {
    return element.all(by.css('.-wallet')).get(1).click().then(() => {
      return element(by.css('.btn-add-address')).isPresent();
    });
  }

  showShowUnlockWallet() {
    return element(by.css('.btn-add-address')).click().then(() => {
      return element(by.css('app-unlock-wallet')).isPresent();
    });
  }

  unlockWallet() {
    const seed = element(by.css('[formcontrolname="seed"]'));
    seed.clear();
    seed.sendKeys('skycoin-web-e2e-test-create-wallet-seed');

    return element(by.buttonText('Unlock')).click().then(() => {
      return (element(by.css('app-unlock-wallet')).isPresent()).then((result) => {
        return !result;
      });
    });
  }

  checkThirdAddress() {
    const lastRecord = element.all(by.css('.-record')).last();
    return lastRecord.element(by.css('.address-column')).getText().then((address) => {
      return address === '23eAv3QZ5tXs5Aa9sqsQHwwnptiyV48eaXu';
    });
  }

  showPriceInformation() {
    browser.wait(ExpectedConditions.presenceOf(element(by.css('.balance p.dollars'))), 5000);
    return element(by.css('.balance p.dollars')).getText().then(text => {
      return this._checkHeaderPriceFormat(text);
    });
  }

  _checkHeaderPriceFormat(price: string) {
    const reg = /^\$[0-9]+.[0-9]{2}\s\(\$[0-9]+.[0-9]{2}\)$/;
    return price.match(reg) ?  true :  false;
  }

  openDeleteWalletDialog() {
    return element.all(by.css('.btn-delete-wallet')).first().click().then(() => {
      return element(by.css('app-confirmation')).isPresent();
    });
  }

  cancelDeleteConfirmation() {
    let walletCount = 0;
    element.all(by.css('.-wallet')).count().then((count) => walletCount = count);

    return element(by.buttonText('No')).click().then(() => {
      return element.all(by.css('.-wallet')).count().then((count) => {
        return count === walletCount;
      });
    });
  }

  applyDeleteConfirmation() {
    const walletName = 'New Wallet Name';
    let isWalletExistBefore;

    this.isWalletExist(walletName).then((status) => {
      isWalletExistBefore = status;
    });

    return element(by.css('.-disclaimer-check-text')).click().then(() => {
      return element(by.buttonText('Yes')).click().then(() => {
        return element.all(by.css('.-wallet')).count().then((count) => {
          return this.isWalletExist(walletName).then((isWalletExistAfter) => {
            return isWalletExistBefore && !isWalletExistAfter;
          });
        });
      });
    });
  }

  isWalletExist(name: string) {
    return browser.executeScript(`return window.localStorage.getItem('wallets');`)
      .then((result: string) => {
        const wallets = JSON.parse(result);
        return !!wallets.find(wallet => wallet.label === name);
      });
  }

  fillWalletForm(labelText: string, seedText: string, confirmSeedText = null) {
    const label = element(by.css('[formcontrolname="label"]'));
    const seed = element(by.css('[formcontrolname="seed"]'));
    const confirm = element(by.css('[formcontrolname="confirm_seed"]'));

    return label.clear().then(() => {
      return label.sendKeys(labelText).then(() => {
        return seed.clear().then(() => {
          return seed.sendKeys(seedText).then(() => {
            if (confirmSeedText) {
              return confirm.clear().then(() => {
                return confirm.sendKeys(confirmSeedText);
              });
            }
          });
        });
      });
    });
  }

  getWalletAddress() {
    const walletElement = element.all(by.css('.-wallet')).last();

    return walletElement.click().then(() => {
      const recordElement = element.all(by.css('.-wallet-detail')).last().element(by.css('.-record'));
      return recordElement.isPresent().then((status) => {
        if (status) {
          const address = recordElement.element(by.css('.address-column')).getText();
          walletElement.click();
          return address;
        }
      });
    });
  }
}
