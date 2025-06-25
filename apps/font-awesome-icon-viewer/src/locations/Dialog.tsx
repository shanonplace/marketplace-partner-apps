import { Box, TextInput, Grid, GridItem, Paragraph, Note, Spinner } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useEffect, useMemo, useState } from 'react';
import { IconLibraryConfig, detectIconLibrary, extractIconClassesFromCSS, cleanIconNameForDisplay, ICON_LIBRARIES } from '../utils/iconLibraries';

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [search, setSearch] = useState('');
  const invocation = sdk.parameters?.invocation;
  const selected = typeof invocation === 'object' && invocation !== null && 'selected' in invocation ? (invocation as any).selected : null;

  // Access the icon font CSS URL from installation parameters
  const iconFontCssUrl = sdk.parameters.installation?.iconFontCssUrl;

  // State for icon management
  const [iconClasses, setIconClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedLibrary, setDetectedLibrary] = useState<IconLibraryConfig | null>(null);

  useEffect(() => {
    console.log('Dialog parameters:', sdk.parameters);
    console.log('Icon Font CSS URL in dialog:', iconFontCssUrl);
  }, [sdk.parameters, iconFontCssUrl]);

  // Detect icon library based on URL and CSS content
  const detectLibrary = (url: string, cssContent?: string): IconLibraryConfig => {
    return detectIconLibrary(url, cssContent) || ICON_LIBRARIES[0]; // fallback to Font Awesome config
  };

  // Extract icon classes from CSS using library-specific patterns
  const extractClasses = (css: string, library: IconLibraryConfig): string[] => {
    return extractIconClassesFromCSS(css, library);
  };

  // Load the icon font CSS and extract icons
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

    // Detect library type and load icons
    setLoading(true);
    setError(null);

    const library = detectLibrary(iconFontCssUrl);
    setDetectedLibrary(library);

    console.log(`Detected icon library: ${library.name}`);

    // Only use CSS parsing for all libraries
    fetch(iconFontCssUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch CSS: ${response.statusText}`);
        }
        return response.text();
      })
      .then((css) => {
        // Re-detect library with CSS content for better accuracy
        const detectedWithCSS = detectLibrary(iconFontCssUrl, css);
        setDetectedLibrary(detectedWithCSS);

        const extractedClasses = extractClasses(css, detectedWithCSS);
        if (extractedClasses.length === 0) {
          throw new Error(`No icon classes found. The CSS might not be compatible or the URL might be incorrect.`);
        }

        setIconClasses(extractedClasses);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading icon font CSS:', err);
        setError(`Error loading icon font: ${err.message}`);
        setLoading(false);
      });
  }, [iconFontCssUrl]);

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
        <Paragraph style={{ marginBottom: 24, fontWeight: 600, fontSize: 20, letterSpacing: 0.1 }}>
          Select an icon from {detectedLibrary?.name || 'your icon library'}:
        </Paragraph>
        {!iconFontCssUrl ? (
          <Note variant="negative">No icon font CSS URL configured. Please configure the app installation.</Note>
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
                <Paragraph>Loading icons from {detectedLibrary?.name || 'icon library'}...</Paragraph>
              </Box>
            )}

            {error && (
              <Note variant="negative" title="Error loading icons">
                {error}
                {detectedLibrary && (
                  <Paragraph marginTop="spacingS">
                    <strong>Detected library:</strong> {detectedLibrary.name}
                  </Paragraph>
                )}
              </Note>
            )}

            {!loading && !error && (
              <>
                {detectedLibrary && (
                  <Note variant="primary" title={`Using ${detectedLibrary.name}`} style={{ marginBottom: 'var(--f36-spacing-m)' }}>
                    Found {iconClasses.length} icons from {detectedLibrary.name}
                  </Note>
                )}
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
