import { Box, TextInput, Grid, GridItem, Paragraph, Note, Spinner, Flex } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useEffect, useMemo, useState } from 'react';
import { extractFontAwesomeIcons, cleanIconNameForDisplay } from '../utils/iconLibraries';

// Group definitions for filters
const ICON_GROUPS = {
  all: 'All Icons',
  brands: 'Brands',
  solid: 'Solid',
  regular: 'Regular',
};

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const invocation = sdk.parameters?.invocation;
  const selected = typeof invocation === 'object' && invocation !== null && 'selected' in invocation ? (invocation as any).selected : null;

  // Access the Font Awesome CSS URL from installation parameters
  const fontAwesomeCssUrl = sdk.parameters.installation?.iconFontCssUrl;

  // State for icon management
  const [icons, setIcons] = useState<string[]>([]);
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
          // Use the utility function to extract icons
          const extractedIcons = extractFontAwesomeIcons(css);

          if (extractedIcons.length === 0) {
            throw new Error('No Font Awesome icon classes found. Please check that the CSS URL is correct.');
          }

          console.log(`Found ${extractedIcons.length} Font Awesome icons`);
          setIcons(extractedIcons);

          // Wait a bit more to ensure CSS is fully loaded and applied
          setTimeout(() => {
            setLoading(false);
            setError(null);
          }, 200);
        })
        .catch((err) => {
          console.error('Error loading Font Awesome CSS:', err);
          setError(`Error loading Font Awesome CSS: ${err.message}`);
          setLoading(false);
        });
    }; // Wait for CSS to load, then extract icons
    if (link.href !== fontAwesomeCssUrl) {
      link.onload = () => {
        // Give more time to ensure CSS is fully processed and fonts are loaded
        setTimeout(extractIcons, 500);
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
  }, [fontAwesomeCssUrl, sdk]);

  const filteredIcons = useMemo(() => {
    let filtered = icons;

    // Filter by group if not "all"
    if (activeGroup !== 'all') {
      filtered = icons.filter((icon) => {
        if (activeGroup === 'brands') {
          return icon.startsWith('fab');
        } else if (activeGroup === 'solid') {
          return icon.startsWith('fas');
        } else if (activeGroup === 'regular') {
          return icon.startsWith('far');
        }
        return true;
      });
    }

    // Then filter by search
    if (search) {
      filtered = filtered.filter((icon) => {
        const iconName = cleanIconNameForDisplay(icon);
        return iconName.toLowerCase().includes(search.toLowerCase());
      });
    }

    return filtered;
  }, [search, icons, activeGroup]);

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

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '6px',
    background: isActive ? '#2563eb' : 'transparent',
    color: isActive ? 'white' : '#4b5563',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    marginRight: '8px',
    transition: 'all 0.2s',
  });

  return (
    <div style={overlayStyle}>
      <Box style={modalStyle}>
        <Paragraph style={{ marginBottom: 24, fontWeight: 600, fontSize: 20, letterSpacing: 0.1 }}>Select an icon from Font Awesome:</Paragraph>
        {!fontAwesomeCssUrl ? (
          <Note variant="negative">No Font Awesome CSS URL configured. Please configure the app installation.</Note>
        ) : (
          <>
            <Flex marginBottom="spacingM" justifyContent="space-between">
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons..."
                autoFocus
                style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f8fafc', width: '60%' }}
              />

              <Flex>
                {Object.entries(ICON_GROUPS).map(([key, label]) => (
                  <button key={key} style={tabButtonStyle(activeGroup === key)} onClick={() => setActiveGroup(key)}>
                    {label}
                  </button>
                ))}
              </Flex>
            </Flex>

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
                  {`Found ${icons.length} icons from Font Awesome (showing ${filteredIcons.length})`}
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

                {filteredIcons.length === 0 && (
                  <Paragraph>
                    {search ? `No icons found matching "${search}". Try a different search term.` : `No icons found in this Font Awesome CSS.`}
                  </Paragraph>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </div>
  );
};

export default Dialog;
