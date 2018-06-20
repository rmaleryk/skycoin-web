import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() dialog: MatDialogRef<any>;
  @Input() headline: string;
  @Input() disableDismiss = false;
  @Input() loadingPercentage: number = null;

  closePopup() {
    if (!this.disableDismiss) {
      this.dialog.close();
    }
  }
}
