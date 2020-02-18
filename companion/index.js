import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me as companion } from "companion";

// Settings have been changed
settingsStorage.onchange = function(evt) {
  sendValue(evt.key, evt.newValue);
}

// Settings were changed while the companion was not running
if (companion.launchReasons.settingsChanged) {
  sendValue("showSteps", settingsStorage.getItem("showSteps"));
  sendValue("showPulse", settingsStorage.getItem("showPulse"));
  sendValue("showBattery", settingsStorage.getItem("showBattery"));
}

function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key: key,
      value: JSON.parse(val)
    });
  }
}

function sendSettingData(data) {
  // If we have a MessageSocket, send the data to the device
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log("ERROR: Couldn't send setting data - No peerSocket connection");
  }
}