import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

export enum DoubleButtonActive {RightButton, LeftButton}

@Component({
  selector: 'app-double-button',
  templateUrl: './double-button.component.html',
  styleUrls: ['./double-button.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class DoubleButtonComponent implements OnInit {
  @Input() rightButtonText: any;
  @Input() leftButtonText: any;
  @Input() activeButton: DoubleButtonActive;
  @Input() className = '';
  @Output() onStateChange = new EventEmitter();
  rightActive = false;

  ngOnInit() {
    this.initState();
  }

  initState() {
    if (this.activeButton) {
      if (this.activeButton === DoubleButtonActive.LeftButton) {
        this.rightActive = false;
      } else {
        this.rightActive = true;
      }
    }
  }

  onRightClick() {
    if (!this.rightActive) {
      this.onStateChange.emit(DoubleButtonActive.RightButton);
      this.rightActive = true;
    }
  }

  onLeftClick() {
    if (this.rightActive) {
      this.onStateChange.emit(DoubleButtonActive.LeftButton);
      this.rightActive = false;
    }
  }
}
