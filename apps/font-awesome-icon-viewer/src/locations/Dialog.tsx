import { Box, TextInput, Grid, GridItem, Paragraph, Note, Spinner } from '@contentful/f36-components';
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

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [search, setSearch] = useState('');
  const selected = sdk.parameters?.invocation?.selected || null;

  // Access the icon font CSS URL correctly from the installation parameters
  // The screenshot shows it's in sdk.parameters.installation.iconFontCssUrl
  const iconFontCssUrl = sdk.parameters.installation?.iconFontCssUrl;

  // New state for icon classes extracted from CSS
  const [iconClasses, setIconClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dialog parameters:', sdk.parameters);
    console.log('Icon Font CSS URL in dialog:', iconFontCssUrl);
  }, [sdk.parameters, iconFontCssUrl]);

  // Load the icon font CSS
  useEffect(() => {
    if (!iconFontCssUrl) {
      setError('No icon font CSS URL configured. Please configure the app installation.');
      setLoading(false);
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

    link.href = iconFontCssUrl;

    // For Font Awesome, we can use the metadata
    // For other icon fonts, we need to extract class names from the CSS
    const isFontAwesome = iconFontCssUrl.includes('fontawesome') || iconFontCssUrl.includes('font-awesome');

    if (isFontAwesome) {
      // Use the iconsMeta data for Font Awesome
      const allIcons = Object.entries(iconsMeta).flatMap(([iconName, meta]: [string, any]) =>
        STYLES.filter((style) => meta.styles.includes(style)).map((style) => `${STYLE_PREFIX[style]} fa-${iconName}`)
      );
      setIconClasses(allIcons);
      setLoading(false);
    } else {
      // For other icon fonts, fetch the CSS and extract class names
      setLoading(true);
      fetch(iconFontCssUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch CSS: ${response.statusText}`);
          }
          return response.text();
        })
        .then((css) => {
          // Extract icon class names using regex
          // This pattern looks for class names in :before or :after pseudo-elements
          // Adjust regex as needed for different icon fonts
          const classRegex = /\.([a-zA-Z0-9-_]+):before\s*{|\.([a-zA-Z0-9-_]+):after\s*{/g;
          const classes = new Set<string>();
          let match;

          while ((match = classRegex.exec(css)) !== null) {
            const className = match[1] || match[2];
            if (className && !className.includes('font-face')) {
              classes.add(className);
            }
          }

          setIconClasses(Array.from(classes));
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error('Error loading icon font CSS:', err);
          setError(`Error loading icon font: ${err.message}`);
          setLoading(false);
        });
    }
  }, [iconFontCssUrl]);

  const filteredIcons = useMemo(() => {
    if (!search) return iconClasses;
    return iconClasses.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search, iconClasses]);

  const handleSelect = (icon: string) => {
    sdk.close(icon);
  };

  return (
    <Box padding="spacingL">
      <Paragraph>Select an icon:</Paragraph>
      {!iconFontCssUrl ? (
        <Note variant="negative">No icon font CSS URL configured. Please configure the app installation.</Note>
      ) : (
        <>
          <Box marginBottom="spacingM">
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..." autoFocus />
          </Box>

          {loading && (
            <Box textAlign="center" padding="spacingL">
              <Spinner />
              <Paragraph>Loading icons from {iconFontCssUrl}</Paragraph>
            </Box>
          )}

          {error && (
            <Note variant="negative" title="Error loading icons">
              {error}
            </Note>
          )}

          {!loading && !error && (
            <Grid columns="repeat(auto-fill, minmax(90px, 1fr))" gap="spacingS" rowGap="spacingM">
              {filteredIcons.map((icon) => (
                <GridItem key={icon}>
                  <Box
                    as="button"
                    type="button"
                    title={icon}
                    style={{
                      border: icon === selected ? '2px solid #2563eb' : '1px solid #ccc',
                      borderRadius: 6,
                      padding: 12,
                      background: 'white',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label={icon}
                    onClick={() => handleSelect(icon)}>
                    <i className={icon} style={{ fontSize: 40 }} />
                  </Box>
                </GridItem>
              ))}
            </Grid>
          )}

          {!loading && !error && filteredIcons.length === 0 && <Paragraph>No icons found matching "{search}".</Paragraph>}
        </>
      )}
    </Box>
  );
};

export default Dialog;
