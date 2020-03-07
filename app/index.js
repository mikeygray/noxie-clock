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
import { zeroPad, getNiceDate, getBatteryFilename, getRndInt } from './utils';
import { noxieFrames } from './constants';

/** initial values */
let _pulse = -1;
let _onwrist = false;
let _noxieCounter = {
  tillNext: -1,
  animationDuration: 0,
};
clock.granularity = 'seconds';

/** element handles */
const elementNoxie = document.getElementById('noxie');

const elementClockHours = document.getElementById('mainClockHours');
const elementClockColon = document.getElementById('mainClockColon');
const elementClockMinutes = document.getElementById('mainClockMinutes');
const elementClockAmPm = document.getElementById('mainClockAmPm');
const elementDate = document.getElementById('mainDate');

const elementStepsIcon = document.getElementById('steps_icon');
const elementStepsValue = document.getElementById('steps_value');
const elementPulseIcon = document.getElementById('pulse_icon');
const elementPulseValue = document.getElementById('pulse_value');
const elementBatteryIcon = document.getElementById('battery_icon');
const elementBatteryValue = document.getElementById('battery_value');

/** default settings */
let _noxieSettings = {
  showSteps: true,
  showPulse: true,
  showBattery: true,
  showAnimations: true,
};

/** settings messaging */
messaging.peerSocket.onmessage = function(evt) {
  _noxieSettings[evt.data.key] = evt.data.value;
  switch (evt.data.key) {
    case 'showSteps':
      elementStepsIcon.style.display = _noxieSettings.showSteps ? 'inline' : 'none';
      elementStepsValue.style.display = _noxieSettings.showSteps ? 'inline' : 'none';
      break;
    case 'showPulse':
      elementPulseIcon.style.display = _noxieSettings.showPulse ? 'inline' : 'none';
      elementPulseValue.style.display = _noxieSettings.showPulse ? 'inline' : 'none';
      break;
    case 'showBattery':
      elementBatteryIcon.style.display = _noxieSettings.showBattery ? 'inline' : 'none';
      elementBatteryValue.style.display = _noxieSettings.showBattery ? 'inline' : 'none';
      break;
    case 'showAnimations':
      elementNoxie.href = 'noxies/noxie-blank.png';
      _noxieCounter.tillNext = -1;
      _noxieCounter.animationDuration = 0;
      break;
  }
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
  let _seconds = _now.getSeconds();
  if (preferences.clockDisplay === '12h') {
    elementClockAmPm.text = _hours < 12 ? 'AM' : 'PM';
    _hours = _hours % 12 || 12;
  } else {
    elementClockAmPm.text = '';
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
  if (_onwrist && _pulse > 20 && _pulse < 300) {
    elementPulseIcon.href = 'icons/png/heart.png';
    elementPulseValue.text = `${_pulse}`;
  } else {
    elementPulseIcon.href = 'icons/png/heart-unknown.png';
    elementPulseValue.text = '';
  }
}

/** battery and charging */
function updateBattery() {
  if (battery && charger) {
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

/** noxie animations */
function updateAnimations() {
  if (_noxieCounter.tillNext > 0) {
    _noxieCounter.tillNext -= 1;
  } else if (_noxieCounter.tillNext === 0) {
    let _frame = noxieFrames[Math.floor(Math.random() * noxieFrames.length)];
    elementNoxie.href = 'noxies/noxie-' + _frame.name + '.png';
    _noxieCounter.animationDuration = _frame.duration;
    _noxieCounter.tillNext = -1;
  } else if (_noxieCounter.tillNext < 0) {
    if (_noxieCounter.animationDuration > 0) {
      _noxieCounter.animationDuration -= 1;
    } else {
      elementNoxie.href = 'noxies/noxie-blank.png';
      _noxieCounter.tillNext = getRndInt(3, 9);
    }
  }
}

/** main loop */
clock.ontick = evt => {
  if (display.on) {
    updateClock(evt.date);
    if (_noxieSettings.showPulse) updatePulse();
    if (_noxieSettings.showAnimations) updateAnimations();
    if (evt.date.getSeconds() % 5 === 0) {
      if (_noxieSettings.showSteps) updateSteps();
      if (_noxieSettings.showBattery) updateBattery();
      //logDebug(evt.date);
    }
  }
};

/** debug */
function logDebug(now) {
  console.log(
    `Time~ ${zeroPad(now.getHours())}:${zeroPad(now.getMinutes())}` +
      `:${zeroPad(now.getSeconds())} | Date~ ${getNiceDate(now)}` +
      ` | Steps/Goal~ ${today.adjusted.steps}/${goals.steps}` +
      ` | Battery~ ${Math.floor(battery.chargeLevel)}% | Charging~ ${charger.connected}` +
      ` | Pulse~ ${_pulse} | OnWrist~ ${_onwrist}`
  );
}
