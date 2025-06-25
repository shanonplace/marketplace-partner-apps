import { ConfigAppSDK } from '@contentful/app-sdk';
import { Flex, Form, Heading, Paragraph, FormControl, TextInput, Note, Card, List, Box } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { css } from 'emotion';
import { useCallback, useEffect, useState } from 'react';
import { getIconLibraryExamples } from '../utils/iconLibraries';

export interface AppInstallationParameters {
  iconFontCssUrl?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [isValid, setIsValid] = useState(false);
  const sdk = useSDK<ConfigAppSDK>();

  // Get icon library examples
  const iconLibraryExamples = getIconLibraryExamples();

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
        <Heading>CSS Icon Font Viewer Configuration</Heading>
        <Paragraph>
          This app supports only <strong>Font Awesome</strong> (using any valid CSS URL, including custom kits or CDN links) and <strong>Phosphor Icons</strong>{' '}
          (latest web font). Please provide the CSS URL for one of these libraries below.
        </Paragraph>

        {!isValid && (
          <Note variant="warning" title="Required Configuration">
            You must provide a CSS Icon Font URL to install this app. Only Font Awesome and Phosphor Icons are supported.
          </Note>
        )}

        <FormControl isRequired isInvalid={!isValid && parameters.iconFontCssUrl !== undefined}>
          <FormControl.Label>Icon Font CSS URL</FormControl.Label>
          <TextInput
            value={parameters.iconFontCssUrl || ''}
            onChange={handleIconFontUrlChange}
            placeholder="https://kit.fontawesome.com/YOUR_KIT_ID.css or https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            type="url"
            name="iconFontCssUrl"
            width="full"
            isRequired={true}
          />
          <FormControl.HelpText>
            Enter the URL to your Font Awesome CSS (kit or CDN) or Phosphor Icons web font CSS file. Other icon libraries are not supported.
          </FormControl.HelpText>
          {!isValid && parameters.iconFontCssUrl !== undefined && (
            <FormControl.ValidationMessage>This field is required for the app to function.</FormControl.ValidationMessage>
          )}
        </FormControl>

        <Card marginTop="spacingL">
          <Heading as="h3" marginBottom="spacingM">
            Supported Icon Libraries
          </Heading>
          <Paragraph marginBottom="spacingM">You can use one of the following CSS URLs:</Paragraph>
          {iconLibraryExamples.map((library) => (
            <Box key={library.name} marginBottom="spacingM" padding="spacingM" style={{ border: '1px solid #e5e5e5', borderRadius: '4px' }}>
              <Heading as="h4" marginBottom="spacingXs">
                {library.name}
              </Heading>
              <Paragraph marginBottom="spacingS" fontSize="fontSizeS" fontColor="gray600">
                {library.description}
              </Paragraph>
              <List>
                {library.urls.map((url, index) => (
                  <List.Item key={index}>
                    <Box
                      as="button"
                      type="button"
                      onClick={() => {
                        setParameters((prev) => ({ ...prev, iconFontCssUrl: url }));
                        setIsValid(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '13px',
                      }}>
                      {url}
                    </Box>
                  </List.Item>
                ))}
              </List>
            </Box>
          ))}
        </Card>

        <Note variant="primary" title="Supported Libraries" style={{ marginTop: 'var(--f36-spacing-l)' }}>
          This app only supports:
          <List style={{ marginTop: 'var(--f36-spacing-s)' }}>
            <List.Item>Font Awesome (any valid CSS URL, including custom kits or CDN links)</List.Item>
            <List.Item>Phosphor Icons (latest web font)</List.Item>
          </List>
        </Note>
      </Form>
    </Flex>
  );
};

export default ConfigScreen;
