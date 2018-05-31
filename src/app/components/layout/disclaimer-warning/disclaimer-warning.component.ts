import { OnInit, Component } from '@angular/core';

import { FeatureService } from '../../../services/feature.service';
import { featuresConfig } from '../../../constants/featuresConfig.const';

@Component({
  selector: 'app-disclaimer-warning',
  templateUrl: './disclaimer-warning.component.html',
  styleUrls: ['./disclaimer-warning.component.scss'],
})
export class DisclaimerWarningComponent implements OnInit {
  featureToggleData: any = {};

  constructor(
    private featureService: FeatureService
  ) {
  }

  ngOnInit() {
    this.getFeatureToggleData();
  }

  hideDisclaimerWarning() {
    this.featureService.setFeatureToggleData(featuresConfig.disclaimerWarning, false);
    this.getFeatureToggleData();
  }

  getFeatureToggleData() {
    this.featureToggleData = this.featureService.getFeatureToggleData(featuresConfig.disclaimerWarning);
  }
}
