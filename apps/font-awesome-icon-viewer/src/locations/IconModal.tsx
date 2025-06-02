import { Box, TextInput, Grid, GridItem, Modal } from '@contentful/f36-components';
import { useMemo, useState } from 'react';

const ICONS = [
  'fa-solid fa-star',
  'fa-solid fa-heart',
  'fa-solid fa-user',
  'fa-solid fa-bolt',
  'fa-solid fa-check',
  'fa-solid fa-xmark',
  'fa-solid fa-magnifying-glass',
  'fa-solid fa-arrow-right',
  'fa-solid fa-arrow-left',
  'fa-solid fa-thumbs-up',
];

function IconModal({
  selected,
  onSelect,
  onClose,
  isShown,
}: {
  selected: string | null;
  onSelect: (icon: string) => void;
  onClose: () => void;
  isShown: boolean;
}) {
  const [search, setSearch] = useState('');
  const filteredIcons = useMemo(() => {
    if (!search) return ICONS;
    return ICONS.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <Modal isShown={isShown} onClose={onClose} size="large" title="Select a Font Awesome Icon">
      <Modal.Content>
        <Box marginBottom="spacingM">
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search icons..." autoFocus />
        </Box>
        <Grid columns="repeat(auto-fill, minmax(48px, 1fr))" gap="spacingS">
          {filteredIcons.map((icon) => (
            <GridItem key={icon}>
              <Box
                as="button"
                type="button"
                style={{
                  border: icon === selected ? '2px solid #2563eb' : '1px solid #ccc',
                  borderRadius: 6,
                  padding: 8,
                  background: 'white',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'center',
                }}
                aria-label={icon}
                onClick={() => {
                  onSelect(icon);
                  onClose();
                }}>
                <i className={icon} style={{ fontSize: 24 }} />
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Modal.Content>
    </Modal>
  );
}

export default IconModal;
