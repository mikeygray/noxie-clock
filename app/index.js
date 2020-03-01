import clock from 'clock';
import document from 'document';
import * as messaging from 'messaging';
import { display } from 'display';
import { me as appbit } from 'appbit';
import { preferences } from 'user-settings';
import { today, goals } from 'user-activity';
import { battery, charger } from 'power';
import { HeartRateSensor } from 'heart-rate';
import { BodyPresenceSensor } from 'body-presence';
import { zeroPad, getNiceDate, getBatteryFilename } from './utils';

/** initial values */
let _pulse = -1;
let _onwrist = false;
clock.granularity = 'seconds';

/** element handles */
const elementClockHours = document.getElementById('mainClockHours');
const elementClockColon = document.getElementById('mainClockColon');
const elementClockMinutes = document.getElementById('mainClockMinutes');
const elementDate = document.getElementById('mainDate');
const elementStepsIcon = document.getElementById('steps_icon');
const elementPulseIcon = document.getElementById('pulse_icon');
const elementBatteryIcon = document.getElementById('battery_icon');
const elementStepsValue = document.getElementById('steps_value');
const elementPulseValue = document.getElementById('pulse_value');
const elementBatteryValue = document.getElementById('battery_value');

/** default settings */
let noxieSettings = {
  showSteps: true,
  showPulse: true,
  showBattery: true,
};

/** settings messaging */
messaging.peerSocket.onmessage = function(evt) {
  console.log('peerSocket Message Recieved: ' + JSON.stringify(evt));
  noxieSettings[evt.data.key] = evt.data.value;
  console.log('noxieSettings: ' + JSON.stringify(noxieSettings));
};

/** heart rate */
if (HeartRateSensor && appbit.permissions.granted('access_heart_rate')) {
  const _hrm = new HeartRateSensor();
  _hrm.addEventListener('reading', () => {
    _pulse = _hrm.heartRate;
  });
  display.addEventListener('change', () => {
    display.on ? _hrm.start() : _hrm.stop(); // Stop sensor on screen off to conserve battery
  });
  _hrm.start();
}

/** body presence */
if (BodyPresenceSensor) {
  const _bodyPresence = new BodyPresenceSensor();
  _bodyPresence.addEventListener('reading', () => {
    _onwrist = _bodyPresence.present;
  });
  display.addEventListener('change', () => {
    display.on ? _bodyPresence.start() : _bodyPresence.stop(); // Stop sensor on screen off to conserve battery
  });
  _bodyPresence.start();
}

/** time and date */
function updateClock(_now) {
  let _hours = _now.getHours();
  let _mins = zeroPad(_now.getMinutes());
  let _seconds = zeroPad(_now.getSeconds());
  if (preferences.clockDisplay === '12h') {
    _hours = _hours % 12 || 12;
  } else {
    _hours = zeroPad(_hours);
  }
  if (_seconds % 2 === 0) {
    elementClockColon.text = `:`;
  } else {
    elementClockColon.text = ` `;
  }
  elementClockHours.text = `${_hours}`;
  elementClockMinutes.text = `${_mins}`;
  elementDate.text = `${getNiceDate(_now)}`;
}

/** steps */
function updateSteps() {
  if (today && appbit.permissions.granted('access_activity')) {
    //if (goals) _stepsgoal = goals.steps;
    if (today.adjusted) {
      elementStepsIcon.href = 'icons/png/steps.png';
      elementStepsValue.text = `${Math.floor(today.adjusted.steps / 1000)}k`;
    }
  } else {
    elementStepsIcon.href = 'icons/png/steps-unknown.png';
    elementStepsValue.text = '';
  }
}

/** heart rate */
function updatePulse() {
  if (_onwrist && _pulse > 20 && _pulse < 400) {
    elementPulseIcon.href = 'icons/png/heart.png';
    elementPulseValue.text = `${_pulse}`;
  } else {
    elementPulseIcon.href = 'icons/png/heart-unknown.png';
    elementPulseValue.text = '';
  }
}

/** battery and charging */
function updateBattery() {
  if (battery && charger && _onwrist) {
    elementBatteryIcon.href = `icons/png/${getBatteryFilename(
      battery.chargeLevel,
      charger.connected
    )}`;
    elementBatteryValue.text = `${Math.floor(battery.chargeLevel)}%`;
  } else {
    elementBatteryIcon.href = 'icons/png/battery-unknown.png';
    elementBatteryValue.text = '';
  }
}

/** main loop */
clock.ontick = evt => {
  if (display.on) {
    let _seconds = evt.date.getSeconds();
    updateClock(evt.date);

    if (_seconds === 0) {
      updateBattery();
    }
    if (_seconds % 5 === 0) {
      updatePulse();
      //logDebug(evt.date);
    }
    if (_seconds % 15 === 0) {
      updateSteps();
    }
  }
};

/** debug */
function logDebug(now) {
  console.log(
    `Time~ ${zeroPad(now.date.getHours())}:${zeroPad(now.date.getMinutes())}` +
      `:${zeroPad(now.date.getSeconds())} | Date~ ${getNiceDate(_now)}` +
      ` | Steps/Goal~ ${today.adjusted.steps}/${goals.steps}` +
      ` | Battery~ ${Math.floor(battery.chargeLevel)}% | Charging~ ${charger.connected}` +
      ` | Pulse~ ${_pulse} | OnWrist~ ${_onwrist}`
  );
}
