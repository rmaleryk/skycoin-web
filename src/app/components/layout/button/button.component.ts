import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: 'button.component.html',
  styleUrls: ['button.component.scss'],
})

export class ButtonComponent {
  @Input() disabled: any;
  @Input() emit = false;
  @Output() action = new EventEmitter();

  error: string;
  state: number;

  onClick() {
    if (!this.disabled || this.emit) {
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
    this.error = error['_body'];
    this.state = 2;
  }

  setDisabled() {
    this.disabled = true;
  }

  resetState() {
    this.state = null;
    this.error = '';
  }
}
