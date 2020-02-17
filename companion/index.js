import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { me as companion } from "companion";

// Location Monitoring and Updating
if (
  companion.permissions.granted("access_location") ||
  companion.permissions.granted("run_background")
) {
  console.error("GPS Position Moitoring Allowed");
  companion.monitorSignificantLocationChanges = true;
  companion.addEventListener("significantlocationchange", locationChangeUpdate);
  if (companion.launchReasons.locationChanged) {
    locationChangeUpdate(companion.launchReasons.locationChanged.position);
  }  
}

// When Companion Settings are changed, message FitBit with changes
settingsStorage.onchange = function(evt) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // TODO: Update with new settings
    if (evt.key === "theme") {
      let data = JSON.parse(evt.newValue);
      messaging.peerSocket.send(data["values"][0].value);
    }
  }
}

function locationChangeUpdate(position) {
  // Need to Update Weather Here
  console.log(`Significant location change: ${JSON.stringify(position)}`);
}
