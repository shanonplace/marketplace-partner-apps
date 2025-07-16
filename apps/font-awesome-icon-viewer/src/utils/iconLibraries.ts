// Font Awesome icon extraction utilities

export const extractFontAwesomeIconsFromCSS = (css: string): string[] => {
  const classes = new Set<string>();

  // Match only fa-solid icons
  const regex = /\.fa-solid\.fa-([a-zA-Z0-9-_]+):before/g;
  let match;

  // Collect all fa-solid icon class names
  while ((match = regex.exec(css)) !== null) {
    const iconName = match[1];
    if (iconName && iconName.length > 2) {
      classes.add(`fa-solid fa-${iconName}`);
    }
  }

  return Array.from(classes).sort();
};

export const cleanIconNameForDisplay = (iconClass: string): string => {
  return iconClass.replace(/^(fa-solid|fa-regular|fa-brands|fa-light|fa-thin|fa-duotone|fas|far|fab)\s+/, '').replace(/^fa-/, '');
};
