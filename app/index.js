//import * as fs from "fs";
import clock from "clock";
import document from "document";
//import * as messaging from "messaging";
import { me as appbit } from "appbit";
import { preferences } from "user-settings";
import { today, goals } from "user-activity";
//import { geolocation } from "geolocation";
import { battery, charger } from "power";
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { zeroPad, getNiceDate } from "./utils";
/*
const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";
*/
// Get a handle on the index.gui elements
const mainClockHours = document.getElementById("mainClockHours");
const mainClockColon = document.getElementById("mainClockColon");
const mainClockMinutes = document.getElementById("mainClockMinutes");
const mainDate = document.getElementById("mainDate");


// Update the clock every second
clock.granularity = "seconds";

/*
if (appbit.permissions.granted("access_activity")) {
   console.log("today object: " + JSON.stringify(today));
   console.log("Steps Today:" + today.adjusted.steps + " / " + goals.adjusted.steps);
}
console.log("Battery: " + Math.floor(battery.chargeLevel) + "%");
console.log("Charger: " + (charger.connected ? "Is" : "Is not") + " connected");
*/

// Update elements every 'tick' with the current time
clock.ontick = (evt) => {
  let _now = evt.date;
  let _hours = _now.getHours();
  let _seconds = zeroPad(_now.getSeconds());
  let _mins = zeroPad(_now.getMinutes());
  
  let _steps = -1;
  let _stepsgoal = -1;
  let _stepstxt = "";
  
  let _pulse = -1;
  let _onwrist = -1;
  
  let _batterypct = Math.floor(battery.chargeLevel);
  let _charging = charger.connected;

  if (appbit.permissions.granted("access_activity") && today ) {
    if(today.adjusted) _steps = today.adjusted.steps;
    if(goals) _stepsgoal = goals.steps;
    _stepstxt = "" + Math.floor(_steps/1000) + "k"
  }
  
  if(appbit.permissions.granted("access_heart_rate") && HeartRateSensor) {
     const _hrm = new HeartRateSensor({ frequency: 1 });
     _hrm.addEventListener("reading", () => {
        _pulse = _hrm.heartRate;
     });
     _hrm.start();
  }
  
  if (BodyPresenceSensor) {
    const _bodyPresence = new BodyPresenceSensor();
    _bodyPresence.addEventListener("reading", () => {
      _bodyPresence.present ? _onwrist = 1 : _onwrist = 0;
    });
  _bodyPresence.start();
  }
  
  if (preferences.clockDisplay === "12h") {
    // 12h format
    _hours = _hours % 12 || 12;
  } else {
    // 24h format
    _hours = zeroPad(_hours);
  }
  if(_seconds % 2 === 0) {
    mainClockColon.text = `:`;
  }
  else {
    mainClockColon.text = ` `;
  }
  
  mainClockHours.text = `${_hours}`;
  mainClockMinutes.text = `${_mins}`;
  mainDate.text = `${getNiceDate(_now)}`;
  
  console.log("Time~ " + _hours + ":" + _mins + " | Date~ " + getNiceDate(_now) 
              + " | Steps/Goal~ " + _steps + "/" + _stepsgoal + " - Text~ " + _stepstxt 
              + " | Battery~ " + _batterypct + "% - Charging~ " + _charging
              + " | Pulse~ " + _pulse + " - OnWrist~ " + _onwrist);
  
}

/***********************************/
/** Settings and Geolocation - WIP */
/***********************************/

/*
let settings = loadSettings();

applyTheme(settings.background, settings.foreground);

geolocation.getCurrentPosition(locationSuccess, locationError, {
  timeout: 60 * 1000
});

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  console.log("Message Recieved: " + JSON.stringify(evt.data));
  applyTheme(evt.data.background, evt.data.foreground);
}

// Register for the unload event
appbit.onunload = saveSettings;


function locationSuccess(position) {
  console.log(
    "Latitude: " + position.coords.latitude,
    "Longitude: " + position.coords.longitude
  );
}

function locationError(error) {
  console.log("Error: " + error.code, "Message: " + error.message);
}

function loadSettings() {
  try {
    let fileSyncData = fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    console.log("Setting Loaded: " + JSON.stringify(fileSyncData));
    return fileSyncData;
  } catch (ex) {
    // Defaults
    return {
      background: "#000000",
      foreground: "#FFFFFF"
    }
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

// Apply theme colors to elements
function applyTheme(background, foreground) {
  let items = document.getElementsByClassName("background");
  items.forEach(function(item) {
    item.style.fill = background;
  });
  //let items = document.getElementsByClassName("foreground");
  //items.forEach(function(item) {
  //  item.style.fill = foreground;
  //});
  settings.background = background;
  settings.foreground = foreground;
}
*/