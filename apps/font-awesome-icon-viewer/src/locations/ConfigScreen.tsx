import { ConfigAppSDK } from '@contentful/app-sdk';
import { Flex, Form, Heading, Paragraph, FormControl, TextInput, Note, List } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { css } from 'emotion';
import { useCallback, useEffect, useState } from 'react';

export interface AppInstallationParameters {
  iconFontCssUrl?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [isValid, setIsValid] = useState(false);
  const sdk = useSDK<ConfigAppSDK>();

  const onConfigure = useCallback(async () => {
    // Log what we're saving for debugging
    console.log('Saving installation parameters:', parameters);

    // Validate that iconFontCssUrl is provided
    if (!parameters.iconFontCssUrl) {
      sdk.notifier.error('Icon Font CSS URL is required');
      return false;
    }

    // Get current state
    const currentState = await sdk.app.getCurrentState();

    return {
      // Parameters to be persisted as the app configuration.
      parameters,
      // In case you don't want to submit any update to app
      // locations, you can just pass the currentState as is
      targetState: currentState,
    };
  }, [parameters, sdk]);

  useEffect(() => {
    // Validate parameters whenever they change
    setIsValid(!!parameters.iconFontCssUrl);

    // Register configure callback
    sdk.app.onConfigure(() => onConfigure());
  }, [parameters, sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
        setIsValid(!!currentParameters.iconFontCssUrl);
      }

      // Set the app as ready
      sdk.app.setReady();
    })();
  }, [sdk]);

  const handleIconFontUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setParameters((prev) => ({
      ...prev,
      iconFontCssUrl: url,
    }));
    setIsValid(!!url);
  };

  return (
    <Flex flexDirection="column" className="f36-margin--l">
      <Form>
        <FormControl isRequired isInvalid={!isValid && parameters.iconFontCssUrl !== undefined}>
          <FormControl.Label>Font Awesome CSS URL</FormControl.Label>
          <TextInput
            value={parameters.iconFontCssUrl || ''}
            onChange={handleIconFontUrlChange}
            placeholder="e.g., https://use.fontawesome.com/releases/v6.4.0/css/all.css"
            type="url"
            name="iconFontCssUrl"
            width="full"
            isRequired={true}
          />
          <FormControl.HelpText>Provide a Font Awesome CSS URL (free, pro, or custom kit)</FormControl.HelpText>
          {!isValid && parameters.iconFontCssUrl !== undefined && (
            <FormControl.ValidationMessage>This field is required for the app to function.</FormControl.ValidationMessage>
          )}
        </FormControl>

        <Heading as="h4" marginBottom="spacingXs">
          About this App
        </Heading>
        <Paragraph marginBottom="spacingM">
          This app helps you easily add Font Awesome icons to your content entries by providing a visual icon picker.
        </Paragraph>

        <Note variant="primary" title="Font Awesome Support">
          <Paragraph marginBottom="spacingS">This app supports Font Awesome icons from any valid CSS URL, including:</Paragraph>
          <List>
            <List.Item>Font Awesome Free CDN (e.g., https://use.fontawesome.com/releases/v6.4.0/css/all.css)</List.Item>
            <List.Item>Font Awesome Pro with your custom kit URL (e.g., https://kit.fontawesome.com/YOUR_KIT_ID.css)</List.Item>
            <List.Item>Self-hosted Font Awesome CSS files</List.Item>
          </List>
        </Note>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
