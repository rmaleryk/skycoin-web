import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as Bip39 from 'bip39';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

import { WalletService } from '../../../../services/wallet.service';
import { DoubleButtonActive } from '../../../layout/double-button/double-button.component';
import { OnboardingDisclaimerComponent } from './onboarding-disclaimer/onboarding-disclaimer.component';
import { OnboardingSafeguardComponent } from './onboarding-safeguard/onboarding-safeguard.component';

@Component({
  selector: 'app-onboarding-create-wallet',
  templateUrl: './onboarding-create-wallet.component.html',
  styleUrls: ['./onboarding-create-wallet.component.scss'],
})
export class OnboardingCreateWalletComponent implements OnInit {
  showNewForm = true;
  form: FormGroup;
  doubleButtonActive = DoubleButtonActive.LeftButton;
  haveWallets = false;

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
    this.existWallets();
  }

  existWallets() {
    this.walletService.all.subscribe(wallets => {
      if (wallets.length === 0) {
        this.haveWallets = false;
        this.showDisclaimer();
      }else {
        this.haveWallets = true;
      }
    });
  }

  initForm() {
    this.form = this.formBuilder.group({
        label: new FormControl('', Validators.compose([
          Validators.required, Validators.minLength(2),
        ])),
        seed: new FormControl('', Validators.compose([
          Validators.required, Validators.minLength(2),
        ])),
        confirm_seed: new FormControl('',
          this.showNewForm ?
            Validators.compose([
              Validators.required,
              Validators.minLength(2),
            ])
            : Validators.compose([]),
        ),
      },
      this.showNewForm ? { validator: this.seedMatchValidator.bind(this) } : {},
      );

    if (this.showNewForm) {
      this.generateSeed();
    }
  }

  changeForm(newState) {
    newState === DoubleButtonActive.RightButton ? this.showNewForm = false : this.showNewForm = true;
    this.initForm();
  }

  showDisclaimer() {
    const config = new MatDialogConfig();
    config.width = '450px';
    config.disableClose = true;
    setTimeout(() => {
      this.dialog.open(OnboardingDisclaimerComponent, config);
    }, 0);
  }

  showSafe() {
    const config = new MatDialogConfig();
    config.width = '450px';
    config.disableClose = true;
    this.dialog.open(OnboardingSafeguardComponent, config).afterClosed().subscribe(result => {
      if (result) {
        this.skip();
      }
    });
  }

  createWallet() {
    try {
      this.walletService.create(this.form.value.label, this.form.value.seed);
      this.showSafe();
    } catch (exception) {
      const config = new MatSnackBarConfig();
      config.duration = 5000;
      this.snackBar.open(exception.message, null, config);
    }
  }

  loadWallet() {
    try {
      this.walletService.create(this.form.value.label, this.form.value.seed);
      this.skip();
    } catch (exception) {
      const config = new MatSnackBarConfig();
      config.duration = 5000;
      this.snackBar.open(exception.message, null, config);
    }
  }

  skip() {
    this.router.navigate(['/wallets']);
  }

  generateSeed() {
    this.form.controls.seed.setValue(Bip39.generateMnemonic());
  }

  private seedMatchValidator(g: FormGroup) {
      return g.get('seed').value === g.get('confirm_seed').value
        ? null : { mismatch: true };
  }
}
