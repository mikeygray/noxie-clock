// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

export function getNiceDate(date) {
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let dateText =
    getWeekdayText(date.getDay()) + ' ' + day + getDaySuffixText(day) + ' ' + getMonthText(month);
  return dateText;
}

export function getBatteryFilename(batteryPct, charging) {
  let filename = 'battery-';
  if (batteryPct > 87.5) {
    filename += '100';
  } else if (batteryPct > 62.5) {
    filename += '75';
  } else if (batteryPct > 37.5) {
    filename += '50';
  } else if (batteryPct > 12.5) {
    filename += '25';
  } else {
    filename += '0';
  }
  if (charging) filename += '-charge';
  return filename + '.png';
}

function getWeekdayText(weekdayNum) {
  switch (weekdayNum) {
    case 0:
      return 'Sun';
    case 1:
      return 'Mon';
    case 2:
      return 'Tue';
    case 3:
      return 'Wed';
    case 4:
      return 'Thu';
    case 5:
      return 'Fri';
    case 6:
      return 'Sat';
  }
  return '';
}

function getDaySuffixText(dayNum) {
  if (dayNum > 3 && dayNum < 21) return 'th';
  switch (dayNum % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function getMonthText(monthNum) {
  switch (monthNum) {
    case 0:
      return 'Jan';
    case 1:
      return 'Feb';
    case 2:
      return 'Mar';
    case 3:
      return 'Apr';
    case 4:
      return 'May';
    case 5:
      return 'Jun';
    case 6:
      return 'Jul';
    case 7:
      return 'Aug';
    case 8:
      return 'Sep';
    case 9:
      return 'Oct';
    case 10:
      return 'Nov';
    case 11:
      return 'Dec';
  }
  return '';
}
