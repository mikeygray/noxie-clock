import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { battery } from "power";
console.log(Math.floor(battery.chargeLevel) + "%");

// Update the clock every minute
clock.granularity = "seconds";

// Get a handle on the <text> element
const mainClockHours = document.getElementById("mainClockHours");
const mainClockColon = document.getElementById("mainClockColon");
const mainClockMinutes = document.getElementById("mainClockMinutes");
const mainDate = document.getElementById("mainDate");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let seconds = util.zeroPad(today.getSeconds());
  let mins = util.zeroPad(today.getMinutes());
  
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  
  mainClockHours.text = `${hours}`
  
  if(seconds % 2 === 0) {
    mainClockColon.text = `:`;
  }
  else {
    mainClockColon.text = ` `;
  }
  
  mainClockMinutes.text = `${mins}`
  
  mainDate.text = `${util.getNiceDate(today)}`
  
}
