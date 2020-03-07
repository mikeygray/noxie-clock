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
      </Section>
      <Section
        title={
          <Text bold align="left">
            Noxie Animation
          </Text>
        }>
        <Toggle settingsKey="showAnimations" label="Show Animations" />
      </Section>
    </Page>
  );
}

registerSettingsPage(noxieSettings);
