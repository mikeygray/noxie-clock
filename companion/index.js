import 'fitbit-google-analytics/companion';
import { settingsStorage } from 'settings';
import * as messaging from 'messaging';
import { me as companion } from 'companion';

// if setting toggles are undefined set to true as default
if (!settingsStorage.getItem('showSteps')) settingsStorage.setItem('showSteps', true);
if (!settingsStorage.getItem('showPulse')) settingsStorage.setItem('showPulse', true);
if (!settingsStorage.getItem('showBattery')) settingsStorage.setItem('showBattery', true);
if (!settingsStorage.getItem('showAnimations')) settingsStorage.setItem('showAnimations', true);

// send starting values
messaging.peerSocket.onopen = function () {
  sendValue('showSteps', settingsStorage.getItem('showSteps'));
  sendValue('showPulse', settingsStorage.getItem('showPulse'));
  sendValue('showBattery', settingsStorage.getItem('showBattery'));
  sendValue('showAnimations', settingsStorage.getItem('showAnimations'));
};

// settings have been changed
settingsStorage.onchange = function (evt) {
  sendValue(evt.key, evt.newValue);
};

function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val),
    });
  }
}

function sendSettingData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN)
    messaging.peerSocket.send(data);
}
