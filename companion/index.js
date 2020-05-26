import * as messaging from 'messaging';
import { me } from 'companion';
import { geolocation } from 'geolocation';
import { settingsStorage } from 'settings';
import { keys } from './keys';

const WEATHER_CALL_INTERVAL_MS = 144e5; // 4 hours in milliseconds

/** setting key names and defaults */
const settingNamesDefaults = [
  { name: 'showSteps', default: true },
  { name: 'showPulse', default: true },
  { name: 'showBattery', default: true },
  { name: 'showAnimations', default: true },
  { name: 'showWeather', default: false },
  { name: 'weatherUnitsC', default: false },
  { name: 'weatherTemp', default: -1 }, // temp in kelvin and can't be -ve
  { name: 'weatherCode', default: '' },
];

/** message a single value to clockface */
function sendValue(key, val) {
  //console.log('sendValue | key ~ ' + JSON.stringify(key) + ' | val ~ ' + JSON.stringify(val));
  function sendSettingData(data) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN)
      messaging.peerSocket.send(data);
  }
  if (key && val) {
    sendSettingData({
      key: key,
      value: val,
    });
  }
}

/** timeout then page for GPS coords */
function getGeolocationIn(timeoutMs) {
  //console.log('Geolocation timeoutMs ~ ' + timeoutMs);
  setTimeout(function () {
    geolocation.getCurrentPosition(getWeatherAndMessage, geolocationError, {
      timeout: 60 * 1000, // timeout call in a minute
    });
  }, timeoutMs);
}

/** take GPS coords, fetch weather data, message to clockface */
function getWeatherAndMessage(position) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${keys.openweather}`;
  //console.log('getWeatherAndMessage | lat ~ ' + position.coords.latitude + ' | long ~ ' + position.coords.longitude + ' | url ~ ' + url);
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((responseBody) => {
      //console.log('OWM response body ~\n' + JSON.stringify(responseBody, undefined, 2));
      const temp = responseBody.main.temp;
      const icon = String(responseBody.weather[0].icon); // value might start with zero
      settingsStorage.setItem('weatherTemp', temp);
      settingsStorage.setItem('weatherCode', icon);
      sendValue('weatherTemp', temp);
      sendValue('weatherCode', icon);
      getGeolocationIn(WEATHER_CALL_INTERVAL_MS);
    })
    .catch((error) => {
      console.error('ERROR: problem getting/parsing weather data ~ ' + error.message);
      getGeolocationIn(30 * 60 * 1000); // try again in 30 mins
    });
}

/** GPS failed, try again later */
function geolocationError(error) {
  console.error('ERROR: problem getting GPS ~ ' + error.message);
  getGeolocationIn(10 * 60 * 1000); // try again in 10 mins
}

/** if any settings are undefined set to default */
settingNamesDefaults.forEach((setting) => {
  if (typeof settingsStorage.getItem(setting.name) === 'undefined')
    settingsStorage.setItem(setting.name, setting.default);
});

/** when messaging established, send all settings */
messaging.peerSocket.onopen = function () {
  settingNamesDefaults.forEach((setting) => {
    sendValue(setting.name, settingsStorage.getItem(setting.name));
  });
};

/** when setting changes, send it */
settingsStorage.onchange = function (evt) {
  //console.log('settingsStorage.onchange ~ ' + JSON.stringify(evt));
  if (evt.key === 'showWeather' && JSON.parse(evt.newValue)) getGeolocationIn(0);
  sendValue(evt.key, evt.newValue);
};

/** start initial GPS call, if enabled */
if (
  geolocation &&
  me.permissions.granted('access_location') &&
  JSON.parse(settingsStorage.getItem('showWeather'))
) {
  getGeolocationIn(0);
}
