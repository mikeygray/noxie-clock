/** NodeJS script to put city codes in associated country files */

var fs = require('fs');
var cityList = require('./city.full.list.js');

let output = {};
let countryCodes = [];

cityList.forEach((city) => {
  const country = city.country;
  if (country.toLowerCase() === 'us') {
    if (!countryCodes.includes(country)) {
      countryCodes.push(country);
    }
    if (!output[country]) {
      output[country] = [];
    }
    output[country].push({
      id: city.id,
      name: city.name + ', ' + city.state,
    });
  }
});

for (const [key, value] of Object.entries(output)) {
  const fileName = 'city.' + key.toLowerCase() + '.json';
  fs.writeFile(fileName, JSON.stringify(value), function (err) {
    if (err) console.error(err.message);
    console.log(fileName + ' - saved!');
  });
}

fs.writeFile('countrycodes.json', JSON.stringify(countryCodes), function (err) {
  if (err) console.error(err.message);
  console.log('countrycodes.json' + ' - saved!');
});
