function noxieSettings(props) {
  return (
    <Page>
      <Section
        title={
          <Text bold align="center">
            Noxie Settings
          </Text>
        }>
        <Toggle settingsKey="showSteps" label="Show Steps" />
        <Toggle settingsKey="showPulse" label="Show Pulse" />
        <Toggle settingsKey="showBattery" label="Show Battery" />
      </Section>
    </Page>
  );
}

registerSettingsPage(noxieSettings);
