// Icon library configurations for robust, specific support

export interface IconLibraryConfig {
  name: string;
  detection: RegExp[];
  classPatterns: RegExp[];
  metadataAvailable: boolean;
  styles?: string[];
  stylePrefixes?: Record<string, string>;
  exampleUrls?: string[];
  description?: string;
}

export const ICON_LIBRARIES: IconLibraryConfig[] = [
  {
    name: 'Font Awesome',
    detection: [/fontawesome/i, /font-awesome/i, /use\.fontawesome\.com/i],
    classPatterns: [/\.fa-([a-zA-Z0-9-_]+):before/g],
    metadataAvailable: true,
    styles: ['solid', 'regular', 'brands', 'light', 'thin', 'duotone'],
    stylePrefixes: {
      solid: 'fa-solid',
      regular: 'fa-regular',
      brands: 'fa-brands',
      light: 'fa-light',
      thin: 'fa-thin',
      duotone: 'fa-duotone',
    },
    exampleUrls: ['https://use.fontawesome.com/releases/v6.4.0/css/all.css', 'https://kit.fontawesome.com/YOUR_KIT_ID.css'],
    description: 'Font Awesome (use your custom kit URL)',
  },
  {
    name: 'Phosphor Icons',
    detection: [/phosphor-icons.*web/i, /@phosphor-icons\/web/i],
    classPatterns: [/\.ph\.ph-([a-zA-Z0-9-_]+):before/g],
    metadataAvailable: false,
    styles: ['regular', 'thin', 'light', 'bold', 'fill', 'duotone'],
    stylePrefixes: {
      regular: 'ph',
      thin: 'ph-thin',
      light: 'ph-light',
      bold: 'ph-bold',
      fill: 'ph-fill',
      duotone: 'ph-duotone',
    },
    exampleUrls: [
      'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css',
      'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css',
    ],
    description: 'Phosphor Icons (latest web font)',
  },
];

export const detectIconLibrary = (url: string, cssContent?: string): IconLibraryConfig | undefined => {
  for (const library of ICON_LIBRARIES) {
    const urlMatches = library.detection.some((pattern) => pattern.test(url));
    if (urlMatches) return library;
    if (cssContent) {
      const cssMatches = library.detection.some((pattern) => pattern.test(cssContent));
      if (cssMatches) return library;
    }
  }
  return undefined;
};

export const extractIconClassesFromCSS = (css: string, library: IconLibraryConfig): string[] => {
  const classes = new Set<string>();
  for (const pattern of library.classPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(css)) !== null) {
      const className = match[1];
      if (!className || className.includes('font-face') || className.length <= 1) continue;
      if (library.name === 'Font Awesome' && library.stylePrefixes) {
        // Skip style classes
        if (Object.values(library.stylePrefixes).includes(`fa-${className}`) || Object.values(library.stylePrefixes).includes(className)) continue;
        const availableStyles = library.styles || ['solid'];
        availableStyles.forEach((style) => {
          const prefix = library.stylePrefixes?.[style];
          if (prefix) classes.add(`${prefix} fa-${className}`);
        });
      } else if (library.name === 'Phosphor Icons' && library.stylePrefixes) {
        // Only add 'ph ph-ICONNAME' for regular, and 'ph-thin ph-thin-ICONNAME' etc. for others
        const availableStyles = library.styles || ['regular'];
        availableStyles.forEach((style) => {
          const prefix = library.stylePrefixes?.[style];
          if (prefix) {
            if (style === 'regular') {
              classes.add(`ph ph-${className}`);
            } else {
              classes.add(`${prefix} ${prefix}-${className}`);
            }
          }
        });
      }
    }
  }
  return Array.from(classes).sort();
};

export const getIconLibraryExamples = () => {
  return ICON_LIBRARIES.filter((lib) => lib.exampleUrls && lib.exampleUrls.length > 0).map((lib) => ({
    name: lib.name,
    urls: lib.exampleUrls!,
    description: lib.description || '',
  }));
};

export const cleanIconNameForDisplay = (iconClass: string): string => {
  return iconClass
    .replace(/^(fa-solid|fa-regular|fa-brands|fa-light|fa-thin|fa-duotone)\s+/, '')
    .replace(/^(ph-thin|ph-light|ph-bold|ph-fill|ph-duotone|ph)\s+/, '')
    .replace(/^(fa-|ph-)/, '');
};
