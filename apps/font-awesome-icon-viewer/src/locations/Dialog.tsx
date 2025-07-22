import { Box, TextInput, Grid, GridItem, Paragraph, Note, Spinner, Flex, Button, Pagination } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { extractFontAwesomeIcons, cleanIconNameForDisplay } from '../utils/iconLibraries';
import {
  overlayStyle,
  modalStyle,
  tabButtonStyle,
  titleStyle,
  searchInputStyle,
  iconButtonStyle,
  iconStyle,
  iconLabelStyle,
  iconGridStyle,
} from './Dialog.styles';

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
  const selected = (sdk.parameters?.invocation as any)?.selected || null;

  // Access the Font Awesome CSS URL from installation parameters
  const fontAwesomeCssUrl = sdk.parameters.installation?.iconFontCssUrl;

  // State for icon management
  const [icons, setIcons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Limit to 100 icons per page

  useEffect(() => {
    console.log('Dialog parameters:', sdk.parameters);
    console.log('Font Awesome CSS URL in dialog:', fontAwesomeCssUrl);
  }, [sdk.parameters, fontAwesomeCssUrl]);

  // Load the Font Awesome CSS and extract icons
  useEffect(() => {
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

  // Handle pagination
  const totalPages = Math.ceil(filteredIcons.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeGroup]);

  // Get current page of icons
  const paginatedIcons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredIcons.slice(startIndex, endIndex);
  }, [filteredIcons, currentPage, itemsPerPage]);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, []);

  const handleSelect = (icon: string) => {
    sdk.close(icon);
  };

  return (
    <div style={overlayStyle}>
      <Box style={modalStyle}>
        <Paragraph style={titleStyle}>Select an icon from Font Awesome:</Paragraph>
        <>
          <Flex marginBottom="spacingM" justifyContent="space-between">
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..." autoFocus style={searchInputStyle} />

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

              <Flex justifyContent="center" marginBottom="spacingM">
                <Pagination activePage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </Flex>

              <Grid columns="repeat(auto-fill, minmax(90px, 1fr))" style={iconGridStyle}>
                {paginatedIcons.map((icon) => (
                  <GridItem key={icon}>
                    <Box
                      as="button"
                      type="button"
                      title={icon}
                      style={iconButtonStyle(icon === selected)}
                      aria-label={icon}
                      onClick={() => handleSelect(icon)}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.06)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = icon === selected ? 'rgba(37,99,235,0.08)' : '#fff')}
                      onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #2563eb33')}
                      onBlur={(e) => (e.currentTarget.style.boxShadow = icon === selected ? '0 2px 8px rgba(37,99,235,0.10)' : '0 1px 3px rgba(0,0,0,0.04)')}>
                      <i className={icon} style={iconStyle} />
                      <Box as="span" style={iconLabelStyle}>
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

              {filteredIcons.length > 0 && (
                <Flex justifyContent="center" marginTop="spacingL">
                  <Pagination activePage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </Flex>
              )}
            </>
          )}
        </>
      </Box>
    </div>
  );
};

export default Dialog;
