import { Box, TextInput, Grid, GridItem, Paragraph, Note, Spinner } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useEffect, useMemo, useState } from 'react';
import { extractFontAwesomeIconsFromCSS, cleanIconNameForDisplay } from '../utils/iconLibraries';

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [search, setSearch] = useState('');
  const invocation = sdk.parameters?.invocation;
  const selected = typeof invocation === 'object' && invocation !== null && 'selected' in invocation ? (invocation as any).selected : null;

  // Access the Font Awesome CSS URL from installation parameters
  const fontAwesomeCssUrl = sdk.parameters.installation?.iconFontCssUrl;

  // State for icon management
  const [iconClasses, setIconClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dialog parameters:', sdk.parameters);
    console.log('Font Awesome CSS URL in dialog:', fontAwesomeCssUrl);
  }, [sdk.parameters, fontAwesomeCssUrl]);

  // Load the Font Awesome CSS and extract icons
  useEffect(() => {
    if (!fontAwesomeCssUrl) {
      setError('No Font Awesome CSS URL configured. Please configure the app installation.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('Loading Font Awesome CSS...');

    // First, load the CSS and wait for it to be ready
    const id = 'font-awesome-css';
    let link = document.getElementById(id) as HTMLLinkElement;

    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Function to extract icons after CSS is loaded
    const extractIcons = () => {
      fetch(fontAwesomeCssUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch CSS: ${response.statusText}`);
          }
          return response.text();
        })
        .then((css) => {
          const extractedClasses = extractFontAwesomeIconsFromCSS(css);
          if (extractedClasses.length === 0) {
            throw new Error('No Font Awesome icon classes found. Please check that the CSS URL is correct.');
          }

          console.log(`Found ${extractedClasses.length} Font Awesome icons`);
          setIconClasses(extractedClasses);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error('Error loading Font Awesome CSS:', err);
          setError(`Error loading Font Awesome CSS: ${err.message}`);
          setLoading(false);
        });
    };

    // Wait for CSS to load, then extract icons
    if (link.href !== fontAwesomeCssUrl) {
      link.onload = () => {
        // Give a small delay to ensure CSS is fully processed
        setTimeout(extractIcons, 100);
      };
      link.onerror = () => {
        setError('Failed to load Font Awesome CSS. Please check the URL and try again.');
        setLoading(false);
      };
      link.href = fontAwesomeCssUrl;
    } else {
      // CSS already loaded
      extractIcons();
    }
  }, [fontAwesomeCssUrl]);

  const filteredIcons = useMemo(() => {
    if (!search) return iconClasses;
    return iconClasses.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search, iconClasses]);

  const handleSelect = (icon: string) => {
    sdk.close(icon);
  };

  // Overlay and modal styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(30, 41, 59, 0.45)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  };

  const modalStyle: React.CSSProperties = {
    minWidth: 600,
    minHeight: 400,
    background: 'white',
    borderRadius: 18,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    padding: '40px 32px 32px 32px',
    position: 'relative',
    zIndex: 10000,
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1.5px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  };

  return (
    <div style={overlayStyle}>
      <Box style={modalStyle}>
        <Paragraph style={{ marginBottom: 24, fontWeight: 600, fontSize: 20, letterSpacing: 0.1 }}>Select an icon from Font Awesome:</Paragraph>
        {!fontAwesomeCssUrl ? (
          <Note variant="negative">No Font Awesome CSS URL configured. Please configure the app installation.</Note>
        ) : (
          <>
            <Box marginBottom="spacingL">
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons..."
                autoFocus
                style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f8fafc' }}
              />
            </Box>

            {loading && (
              <Box textAlign="center" padding="spacingL">
                <Spinner />
                <Paragraph>Loading icons from Font Awesome...</Paragraph>
              </Box>
            )}

            {error && (
              <Note variant="negative" title="Error loading icons">
                {error}
              </Note>
            )}

            {!loading && !error && (
              <>
                <Note variant="primary" title="Using Font Awesome" style={{ marginBottom: 'var(--f36-spacing-m)' }}>
                  Found {iconClasses.length} icons from Font Awesome
                </Note>
                <Grid columns="repeat(auto-fill, minmax(90px, 1fr))" style={{ gap: '14px', rowGap: '18px', padding: '8px 0' }}>
                  {filteredIcons.map((icon) => (
                    <GridItem key={icon}>
                      <Box
                        as="button"
                        type="button"
                        title={icon}
                        style={{
                          border: icon === selected ? '2.5px solid #2563eb' : '1.5px solid #e5e7eb',
                          borderRadius: 10,
                          padding: 16,
                          background: icon === selected ? 'rgba(37,99,235,0.08)' : '#fff',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 80,
                          boxShadow: icon === selected ? '0 2px 8px rgba(37,99,235,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
                          outline: 'none',
                        }}
                        aria-label={icon}
                        onClick={() => handleSelect(icon)}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.06)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = icon === selected ? 'rgba(37,99,235,0.08)' : '#fff')}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #2563eb33')}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = icon === selected ? '0 2px 8px rgba(37,99,235,0.10)' : '0 1px 3px rgba(0,0,0,0.04)')}>
                        <i className={icon} style={{ fontSize: 28, marginBottom: 6, color: '#222' }} />
                        <Box
                          as="span"
                          style={{
                            fontSize: 11,
                            color: '#666',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                            marginTop: 2,
                          }}>
                          {cleanIconNameForDisplay(icon)}
                        </Box>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </>
            )}

            {!loading && !error && filteredIcons.length === 0 && <Paragraph>No icons found matching "{search}". Try a different search term.</Paragraph>}
          </>
        )}
      </Box>
    </div>
  );
};

export default Dialog;
