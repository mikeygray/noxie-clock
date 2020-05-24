/**
 * THIS DOESN'T WORK
 * ...unless I bundle the country code files in with the companion/settings
 * or load each country as an import. All options are bad.
 **/
import { countrycodes } from './citycodes/countrycodes';

let cities = [];

function loadCities(countrycode) {
  try {
    let imported = require('./citycodes/city.' + countrycode.toLowerCase() + '.json');
    if (imported.cities && imported.cities.length > 0) {
      cities = imported.cities;
      console.log('Tried loading cities, first entry~ ' + JSON.stringify(cities[0]));
    } else {
      console.error('ERROR: nothing was loaded');
    }
  } catch (err) {
    console.error('ERROR: ' + err.message);
  }
}

function isCitySelected() {
  return props.settings.weatherSelection
    ? JSON.parse(props.settings.weatherSelection).values[0].value === 'city'
    : false;
}

function noxieSettings() {
  if (props.settings.countrySelection) {
    loadCities(JSON.parse(props.settings.countrySelection).code);
  }

  return (
    <Page>
      <Section
        title={
          <Text bold align="left">
            Noxie Settings
          </Text>
        }>
        <Toggle settingsKey="showSteps" label="Show Steps" />
        <Toggle settingsKey="showPulse" label="Show Pulse" />
        <Toggle settingsKey="showBattery" label="Show Battery" />
        <Toggle settingsKey="showAnimations" label="Show Animations" />
      </Section>
      <Section
        title={
          <Text bold align="left">
            Noxie Weather
          </Text>
        }
        description={
          <Text italic align="center">
            Changes Noxie's background to display the current weather
          </Text>
        }>
        <Select
          label={`Show Weather`}
          settingsKey="weatherSelection"
          options={[
            { name: 'No Weather', value: 'none' },
            { name: 'Use My GPS', value: 'gps' },
            { name: 'Use Specific City', value: 'city' },
          ]}
          onSelection={(selection) => {
            console.log('weatherSelection~ ' + JSON.stringify(selection));
            console.log('settings:\n' + JSON.stringify(props.settings, undefined, 2));
          }}
        />
        <Toggle
          settingsKey="weatherUnitCelcius"
          label={`Temprature Units: ${props.settings.weatherUnitCelcius === 'true' ? '°C' : '°F'}`}
        />
        <TextInput
          title="Choose Country"
          label="Country"
          settingsKey="countrySelection"
          placeholder="start typing country"
          action="✔"
          disabled={!isCitySelected()}
          onAutocomplete={(input) => {
            return countrycodes.filter((country) =>
              country.name.toLowerCase().includes(input.toLowerCase())
            );
          }}
          onChange={(selection) => {
            console.log('countrySelection~ ' + JSON.stringify(selection));
            console.log('settings:\n' + JSON.stringify(props.settings, undefined, 2));
            loadCities(selection.code);
          }}
        />
        <TextInput
          title="Choose City"
          label="City"
          settingsKey="citySelection"
          placeholder="start typing city"
          action="✔"
          disabled={!isCitySelected() && cities.length < 1}
          onAutocomplete={(input) => {
            if (input.length > 2) {
              return cities.filter((city) => city.name.toLowerCase().includes(input.toLowerCase()));
            } else return;
          }}
          onChange={(selection) => {
            console.log('countrySelection~ ' + JSON.stringify(selection));
            console.log('settings:\n' + JSON.stringify(props.settings, undefined, 2));
          }}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(noxieSettings);
