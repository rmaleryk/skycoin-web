import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import * as Bip39 from 'bip39';
import { MAT_DIALOG_DATA, MatSnackBarConfig, MatSnackBar } from '@angular/material';

import { WalletService } from '../../../../services/wallet.service';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss'],
})
export class CreateWalletComponent implements OnInit {
  form: FormGroup;
  seed: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<CreateWalletComponent>,
    private walletService: WalletService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
  }

  closePopup() {
    this.dialogRef.close();
  }

  createWallet() {
    try {
      this.walletService.create(this.form.value.label, this.form.value.seed);
      this.dialogRef.close();
    } catch (exception) {
      const config = new MatSnackBarConfig();
      config.duration = 5000;
      this.snackBar.open(exception.message, null, config);
    }
  }

  generateSeed() {
    this.form.controls.seed.setValue(Bip39.generateMnemonic());
  }

  private initForm() {
    this.form = this.formBuilder.group({
        label: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(2)
        ])),
        seed: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(2)
        ])),
        confirm_seed: new FormControl('',
            Validators.compose([
              this.data.create ? Validators.required : null,
              this.data.create ? Validators.minLength(2) : null,
            ]),
        ),
      },
      { validator: this.data.create ? this.seedMatchValidator.bind(this) : null }
    );

    if (this.data.create) {
      this.generateSeed();
    }
  }

  private seedMatchValidator(formGroup: FormGroup) {
    return formGroup.get('seed').value === formGroup.get('confirm_seed').value
      ? null : { mismatch: true };
  }
}
