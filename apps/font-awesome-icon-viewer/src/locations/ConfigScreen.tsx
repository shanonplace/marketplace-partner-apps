import { ConfigAppSDK } from '@contentful/app-sdk';
import { Flex, Form, Heading, Paragraph, FormControl, TextInput, Note } from '@contentful/f36-components';
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
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '800px' })}>
      <Form>
        <Heading>Icon Font Configuration</Heading>
        <Paragraph>Configure the CSS file URL for your icon font.</Paragraph>

        {!isValid && (
          <Note variant="warning" title="Required Configuration">
            You must provide an Icon Font CSS URL to install this app.
          </Note>
        )}

        <FormControl isRequired isInvalid={!isValid && parameters.iconFontCssUrl !== undefined}>
          <FormControl.Label>Icon Font CSS URL</FormControl.Label>
          <TextInput
            value={parameters.iconFontCssUrl || ''}
            onChange={handleIconFontUrlChange}
            placeholder="https://ds.iop.ohio.gov/fontawesome/css/all.css"
            type="url"
            name="iconFontCssUrl"
            width="full"
            required
          />
          <FormControl.HelpText>
            Enter the URL to the CSS file that contains your icon font definitions. Example: https://ds.iop.ohio.gov/fontawesome/css/all.css
          </FormControl.HelpText>
          {!isValid && parameters.iconFontCssUrl !== undefined && (
            <FormControl.ValidationMessage>This field is required for the app to function.</FormControl.ValidationMessage>
          )}
        </FormControl>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
