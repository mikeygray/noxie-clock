import clock from 'clock';
import document from 'document';
import analytics from 'fitbit-google-analytics/app';
import * as fs from 'fs';
import * as messaging from 'messaging';
import { display } from 'display';
import { me as appbit } from 'appbit';
import { preferences, locale } from 'user-settings';
import { today, goals } from 'user-activity';
import { battery, charger } from 'power';
import { HeartRateSensor } from 'heart-rate';
import { BodyPresenceSensor } from 'body-presence';
import { zeroPad, getNiceDate, getBatteryFilename, getRndInt } from './utils';
import { noxieFrames, weatherFrames } from './constants';
import { keys } from './keys';

const DEBUG_OUTPUT = true;

/** analytics */
analytics.configure({
  tracking_id: keys.g_analytics,
  user_language: locale.language,
});

/** initial values */
let _pulse = -1;
let _onwrist = false;
let _noxieCounter = {
  tillNext: -1,
  animationDuration: 0,
};
clock.granularity = 'seconds';

/** element handles */
const elementBackground = document.getElementById('background');
const elementNoxie = document.getElementById('noxie');
const elementOverlay = document.getElementById('overlay');

const elementClockHours = document.getElementById('mainClockHours');
const elementClockColon = document.getElementById('mainClockColon');
const elementClockMinutes = document.getElementById('mainClockMinutes');
const elementClockAmPm = document.getElementById('mainClockAmPm');
const elementDate = document.getElementById('mainDate');
const elementTemp = document.getElementById('mainTemp');
const elementDateBackground = document.getElementById('dateBackground');

const elementStepsIcon = document.getElementById('steps_icon');
const elementStepsValue = document.getElementById('steps_value');
const elementPulseIcon = document.getElementById('pulse_icon');
const elementPulseValue = document.getElementById('pulse_value');
const elementBatteryIcon = document.getElementById('battery_icon');
const elementBatteryValue = document.getElementById('battery_value');

/** initial settings */
let _noxieSettings = {};
if (fs.existsSync('/private/data/noxie-settings.txt')) {
  _noxieSettings = fs.readFileSync('noxie-settings.txt', 'json');
} else {
  _noxieSettings = {
    showSteps: true,
    showPulse: true,
    showBattery: true,
    showAnimations: true,
    showWeather: false,
    weatherUnitsC: false,
    weatherTemp: -1, // impossible kelvin value
    weatherCode: '',
  };
}

/** settings messaging */
messaging.peerSocket.onmessage = function (evt) {
  updateNoxieSettings(evt.data.key, evt.data.value);
  logDebugSettings();
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
    case 'showWeather':
      updateBackground();
      updateTemp();
      break;
    case 'weatherUnitsC':
      updateTemp();
      break;
    case 'weatherTemp':
      updateTemp();
      break;
    case 'weatherCode':
      updateBackground();
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
    if (today.adjusted) {
      elementStepsIcon.href = 'icons-fitbit/steps.png';
      elementStepsValue.text = `${Math.floor(today.adjusted.steps / 1000)}k`;
    }
  } else {
    elementStepsIcon.href = 'icons-fitbit/steps-unknown.png';
    elementStepsValue.text = '';
  }
}

/** heart rate */
function updatePulse() {
  if (_onwrist && _pulse > 20 && _pulse < 300) {
    elementPulseIcon.href = 'icons-fitbit/heart.png';
    elementPulseValue.text = `${_pulse}`;
  } else {
    elementPulseIcon.href = 'icons-fitbit/heart-unknown.png';
    elementPulseValue.text = '';
  }
}

/** battery and charging */
function updateBattery() {
  if (battery && charger) {
    elementBatteryIcon.href = `icons-fitbit/${getBatteryFilename(
      battery.chargeLevel,
      charger.connected
    )}`;
    elementBatteryValue.text = `${Math.floor(battery.chargeLevel)}%`;
  } else {
    elementBatteryIcon.href = 'icons-fitbit/battery-unknown.png';
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

/** update settings */
function updateNoxieSettings(_key, _value) {
  _noxieSettings[_key] = _value;
  fs.writeFileSync('noxie-settings.txt', _noxieSettings, 'json');
}

/** update temp reading */
function updateTemp() {
  logDebugSettings;
  if (JSON.parse(_noxieSettings.showWeather) && _noxieSettings.weatherTemp > -1) {
    if (JSON.parse(_noxieSettings.weatherUnitsC)) {
      elementTemp.text = Math.round(_noxieSettings.weatherTemp - 273.15) + '°';
    } else {
      elementTemp.text = Math.round((_noxieSettings.weatherTemp * 9) / 5 - 459.67) + '°';
    }
  } else {
    elementTemp.text = '';
  }
}

/** update background/overlay */
function updateBackground() {
  let newBackgroundSet = false;
  elementDateBackground.style.display = _noxieSettings.showWeather ? 'inline' : 'none';
  if (JSON.parse(_noxieSettings.showWeather) && _noxieSettings.weatherCode.length > 0) {
    //TODO: Why can't I get Array.prototype.find() to work here?
    weatherFrames.forEach((setting) => {
      if (setting.code === _noxieSettings.weatherCode) {
        elementBackground.href = 'backgrounds/' + setting.code + '.png';
        if (setting.overlay) {
          elementOverlay.href = 'backgrounds/overlay/' + setting.code + '.png';
        } else {
          elementOverlay.href = 'backgrounds/overlay/0.png';
        }
        newBackgroundSet = true;
      }
    });
  }
  if (!newBackgroundSet) {
    elementBackground.href = 'backgrounds/0.png';
    elementOverlay.href = 'backgrounds/overlay/0.png';
  }
}

/** main loop */
clock.ontick = (evt) => {
  if (display.on) {
    updateClock(evt.date);
    if (JSON.parse(_noxieSettings.showPulse)) updatePulse();
    if (JSON.parse(_noxieSettings.showAnimations)) updateAnimations();
    if (evt.date.getSeconds() % 5 === 0) {
      if (JSON.parse(_noxieSettings.showSteps)) updateSteps();
      if (JSON.parse(_noxieSettings.showBattery)) updateBattery();
    }
    //logDebugInLoop(evt.date);
  }
};

/** debug */
function logDebug(message) {
  if (DEBUG_OUTPUT) console.log(message);
}

function logDebugInLoop(now) {
  if (DEBUG_OUTPUT)
    logDebug(
      `Time~ ${zeroPad(now.getHours())}:${zeroPad(now.getMinutes())}` +
        `:${zeroPad(now.getSeconds())} | Date~ ${getNiceDate(now)}` +
        ` | Steps/Goal~ ${today.adjusted.steps}/${goals.steps}` +
        ` | Battery~ ${Math.floor(battery.chargeLevel)}% | Charging~ ${charger.connected}` +
        ` | Pulse~ ${_pulse} | OnWrist~ ${_onwrist}`
    );
}

function logDebugSettings() {
  if (DEBUG_OUTPUT) logDebug('_noxieSettings ~ ' + JSON.stringify(_noxieSettings, undefined, 2));
}
