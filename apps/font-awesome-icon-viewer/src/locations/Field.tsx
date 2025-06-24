import { FieldAppSDK } from '@contentful/app-sdk';
import { Box, Paragraph, Text, Button, Note } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [selected, setSelected] = useState<string | null>(sdk.field.getValue() || null);
  const [cssLoaded, setCssLoaded] = useState(false);
  const [cssError, setCssError] = useState<string | null>(null);

  // Get the icon font CSS URL from installation parameters
  // Let's make sure we're accessing it correctly by logging for debugging
  const iconFontCssUrl = sdk.parameters.installation?.iconFontCssUrl;

  useEffect(() => {
    console.log('Installation parameters:', sdk.parameters.installation);
    console.log('Icon Font CSS URL:', iconFontCssUrl);
  }, [sdk.parameters.installation, iconFontCssUrl]);

  // Listen for external changes to the field value
  useEffect(() => {
    const detach = sdk.field.onValueChanged((value) => setSelected(value));
    return () => detach();
  }, [sdk.field]);

  // Load icon font CSS from the configured URL
  useEffect(() => {
    // If iconFontCssUrl is not provided, show an error
    if (!iconFontCssUrl) {
      setCssError('No icon font CSS URL configured. Please configure the app installation.');
      return;
    }

    const id = 'icon-font-css';
    let link = document.getElementById(id) as HTMLLinkElement;

    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Update href if different from current
    if (link.href !== iconFontCssUrl) {
      setCssLoaded(false);
      setCssError(null);

      link.href = iconFontCssUrl;

      // Handle loading events
      link.onload = () => {
        console.log('Icon font CSS loaded successfully');
        setCssLoaded(true);
      };

      link.onerror = () => {
        console.error('Failed to load icon font CSS');
        setCssError(`Failed to load icon font from: ${iconFontCssUrl}`);
      };
    } else {
      // CSS is already loaded
      setCssLoaded(true);
    }

    return () => {
      // We don't remove the link on unmount since it might be used by other instances
    };
  }, [iconFontCssUrl]);

  const openDialog = async () => {
    if (!iconFontCssUrl) {
      sdk.notifier.error('No icon font CSS URL configured. Please configure the app installation.');
      return;
    }

    // Make sure we're passing the CSS URL to the dialog
    console.log('Opening dialog with iconFontCssUrl:', iconFontCssUrl);

    const result = await sdk.dialogs.openCurrentApp({
      width: 600,
      minHeight: 400,
      shouldCloseOnOverlayClick: true,
      parameters: {
        selected,
        iconFontCssUrl,
      },
    });
    if (typeof result === 'string') {
      setSelected(result);
      sdk.field.setValue(result);
    }
  };

  return (
    <Box>
      <Paragraph>Select an icon for this field.</Paragraph>
      {cssError && (
        <Note variant="negative" title="Error loading icon font">
          {cssError}
        </Note>
      )}
      <Box marginBottom="spacingM">
        <Text fontWeight="fontWeightDemiBold">Current selection:</Text>
        <Box
          as="span"
          marginLeft="spacingS"
          padding="spacingM"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 48,
            minWidth: 48,
            border: '1px solid #eee',
            borderRadius: 6,
            background: '#fafbfc',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          {selected ? (
            <i className={selected} style={{ fontSize: 24 }} aria-label={selected} title={selected} />
          ) : (
            <Text as="span" fontColor="gray500">
              None
            </Text>
          )}
        </Box>
        <Box marginTop="spacingM">
          <Button variant="secondary" size="small" onClick={openDialog} isDisabled={!iconFontCssUrl || (!cssLoaded && !cssError)}>
            {!iconFontCssUrl ? 'App not configured' : !cssLoaded && !cssError ? 'Loading icons...' : 'Choose Icon'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Field;
