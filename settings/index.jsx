function noxieSettings(props) {
  return (
    <Page>
         <Select
            label="Theme"
            settingsKey="theme"
            options={[
               {
                 name: "Green",
                 value: {
                   background: "#002200",
                   foreground: "#00ff00"
                 }
               },
               {
                 name: "Red",
                 value: {
                   background: "#220000",
                   foreground: "#ff0000"
                 }
               }]
            }
          />
    </Page>
  );
}

registerSettingsPage(noxieSettings);
