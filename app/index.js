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
import { zeroPad, getNiceDate } from './utils';

/** element handles */
const mainClockHours = document.getElementById('mainClockHours');
const mainClockColon = document.getElementById('mainClockColon');
const mainClockMinutes = document.getElementById('mainClockMinutes');
const mainDate = document.getElementById('mainDate');

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

/** initial values */
let _steps = -1;
let _stepsgoal = -1;
let _stepstxt = '';
let _pulse = -1;
let _onwrist = -1;
clock.granularity = 'seconds';

/** main loop */
clock.ontick = evt => {
  let _now = evt.date;
  let _hours = _now.getHours();
  let _seconds = zeroPad(_now.getSeconds());
  let _mins = zeroPad(_now.getMinutes());
  let _batterypct = Math.floor(battery.chargeLevel);
  let _charging = charger.connected;

  /** steps */
  if (today && appbit.permissions.granted('access_activity')) {
    if (today.adjusted) _steps = today.adjusted.steps;
    if (goals) _stepsgoal = goals.steps;
    _stepstxt = '' + Math.floor(_steps / 1000) + 'k';
  }

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
      _bodyPresence.present ? (_onwrist = 1) : (_onwrist = 0);
    });
    display.addEventListener('change', () => {
      display.on ? _bodyPresence.start() : _bodyPresence.stop(); // Stop sensor on screen off to conserve battery
    });
    _bodyPresence.start();
  }

  /** time and date */
  if (preferences.clockDisplay === '12h') {
    _hours = _hours % 12 || 12;
  } else {
    _hours = zeroPad(_hours);
  }
  if (_seconds % 2 === 0) {
    mainClockColon.text = `:`;
  } else {
    mainClockColon.text = ` `;
  }
  mainClockHours.text = `${_hours}`;
  mainClockMinutes.text = `${_mins}`;
  mainDate.text = `${getNiceDate(_now)}`;

  /** DEBUG */
  console.log(
    'Time~ ' +
      _hours +
      ':' +
      _mins +
      ' | Date~ ' +
      getNiceDate(_now) +
      ' | Steps/Goal~ ' +
      _steps +
      '/' +
      _stepsgoal +
      ' - Text~ ' +
      _stepstxt +
      ' | Battery~ ' +
      _batterypct +
      '% - Charging~ ' +
      _charging +
      ' | Pulse~ ' +
      _pulse +
      ' - OnWrist~ ' +
      _onwrist
  );
};
