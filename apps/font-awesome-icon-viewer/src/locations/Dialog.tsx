import { Box, TextInput, Grid, GridItem, Paragraph } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useEffect, useMemo, useState } from 'react';
import iconsMeta from '../assets/icons.json';

// Build all icon class names for all styles
const STYLES = ['solid', 'regular', 'brands'];
const STYLE_PREFIX = {
  solid: 'fa-solid',
  regular: 'fa-regular',
  brands: 'fa-brands',
};
const ALL_ICONS = Object.entries(iconsMeta).flatMap(([iconName, meta]: [string, any]) =>
  STYLES.filter((style) => meta.styles.includes(style)).map((style) => `${STYLE_PREFIX[style]} fa-${iconName}`)
);

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [search, setSearch] = useState('');
  const selected = sdk.parameters?.selected || null;

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

  const filteredIcons = useMemo(() => {
    if (!search) return ALL_ICONS;
    return ALL_ICONS.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const handleSelect = (icon: string) => {
    sdk.close(icon);
  };

  return (
    <Box padding="spacingL">
      <Paragraph>Select a Font Awesome icon:</Paragraph>
      <Box marginBottom="spacingM">
        <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..." autoFocus />
      </Box>
      <Grid columns="repeat(auto-fill, minmax(180px, 1fr))" gap="spacingS">
        {filteredIcons.map((icon) => (
          <GridItem key={icon}>
            <Box
              as="button"
              type="button"
              title={icon}
              style={{
                border: icon === selected ? '2px solid #2563eb' : '1px solid #ccc',
                borderRadius: 6,
                padding: 8,
                background: 'white',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              aria-label={icon}
              onClick={() => handleSelect(icon)}>
              <i className={icon} style={{ fontSize: 24, marginBottom: 4 }} />
              <span style={{ fontSize: 10, color: '#666', wordBreak: 'break-all', textAlign: 'center' }}>{icon}</span>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default Dialog;
