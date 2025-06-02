import { FieldAppSDK } from '@contentful/app-sdk';
import { Box, Paragraph, Text, Button } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [selected, setSelected] = useState<string | null>(sdk.field.getValue() || null);

  // Listen for external changes to the field value
  useEffect(() => {
    const detach = sdk.field.onValueChanged((value) => setSelected(value));
    return () => detach();
  }, [sdk.field]);

  // Load Font Awesome CSS (only once)
  useEffect(() => {
    const id = 'fa-cdn';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const openDialog = async () => {
    const result = await sdk.dialogs.openCurrentApp({
      width: 600,
      minHeight: 400,
      shouldCloseOnOverlayClick: true,
      parameters: { selected },
    });
    if (typeof result === 'string') {
      setSelected(result);
      sdk.field.setValue(result);
    }
  };

  return (
    <Box>
      <Paragraph>Select a Font Awesome icon for this field.</Paragraph>
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
          <Button variant="secondary" size="small" onClick={openDialog}>
            Choose Icon
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Field;
