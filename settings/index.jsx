function noxieSettings(props) {
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
        <Toggle settingsKey="showAnimations" label="Show Noxie Animations" />
      </Section>
      <Section
        title={
          <Text bold align="left">
            Noxie Weather
          </Text>
        }
        description={
          <Text italic align="center">
            When enabled Noxie's background will change to display the current weather based on your
            GPS location
          </Text>
        }>
        <Toggle settingsKey="showWeather" label="Show Weather" />
        <Toggle
          settingsKey="weatherUnitsC"
          label={`Temprature Units: ${props.settings.weatherUnitsC === 'true' ? '°C' : '°F'}`}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(noxieSettings);
