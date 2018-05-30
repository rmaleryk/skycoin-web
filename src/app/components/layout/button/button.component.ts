import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatTooltip } from '@angular/material';

@Component({
  selector: 'app-button',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss'],
})

export class ButtonComponent {
  @Input() disabled: any;
  @Input() emit = false;
  @Output() action = new EventEmitter();
  @ViewChild('tooltip') tooltip: MatTooltip;

  error: string;
  state: number;
  mouseOver = false;

  onClick() {
    if (!this.disabled || this.emit) {
      this.error = '';
      this.action.emit();
    }
  }

  setLoading() {
    this.state = 0;
  }

  setSuccess() {
    this.state = 1;
    setTimeout(() => this.state = null, 3000);
  }

  setError(error: any) {
    this.state = 2;
    
    if(error == null) {
      return;
    }

    this.error = typeof error === 'string' ? error : error['_body'];

    setTimeout(() => {
      if (this.mouseOver) {
        this.tooltip.show(50);
      }
    }, 0);
  }

  setDisabled() {
    this.disabled = true;
  }

  resetState() {
    this.state = null;
    this.error = '';
  }
}
