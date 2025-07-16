# Font Awesome Icon Viewer

A Contentful app that provides a visual icon picker for Font Awesome icons, making it easy to add icon classes to your content entries.

## Features

- Visual icon picker with search functionality
- Support for Font Awesome (free, pro, and custom kits)
- Real-time icon preview
- Clean, modern interface
- Easy integration with Contentful fields

## Supported Icon Library

- **Font Awesome**: Any valid Font Awesome CSS URL, including:
  - Font Awesome Free CDN
  - Font Awesome Pro with custom kit URLs
  - Self-hosted Font Awesome CSS files

## Configuration

1. Install the app in your Contentful space
2. Configure the Font Awesome CSS URL in the app settings
3. Add the app to a text field in your content model
4. Start selecting icons in your entries!

## What the User Needs to Supply

To use this app, you only need to provide:

1. **CSS URL**: The URL to the CSS file containing the icon font definitions for Font Awesome
2. That's it! The app handles the rest automatically:
   - Detects the icon library type
   - Extracts all available icon classes
   - Provides a searchable interface
   - Renders icons with proper styling

## How It Works

1. **Library Detection**: The app analyzes the CSS URL and content to identify the icon library
2. **Icon Extraction**: It parses the CSS using library-specific patterns to find icon classes
3. **Smart Rendering**: Icons are displayed using the correct class names and styling
4. **Metadata Optimization**: For Font Awesome, it uses included metadata for better performance

## Extending Support

To add support for a new icon library, custom logic must be added to `src/utils/iconLibraries.ts` for detection and extraction. Generic icon font support is not provided.

This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

## How to use

Execute create-contentful-app with npm, npx or yarn to bootstrap the example:

```bash
# npx
npx create-contentful-app --example vite-react

# npm
npm init contentful-app --example vite-react

# Yarn
yarn create contentful-app --example vite-react
```

## Available Scripts

In the project directory, you can run:

#### `npm start`

Creates or updates your app definition in Contentful, and runs the app in development mode.
Open your app to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

#### `npm run upload`

Uploads the `dist` folder to Contentful and creates a bundle that is automatically activated.
The command guides you through the deployment process and asks for all required arguments.
Read [here](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/#deploy-with-contentful) for more information about the deployment process.

#### `npm run upload-ci`

Similar to `npm run upload` it will upload your app to contentful and activate it. The only difference is  
that with this command all required arguments are read from the environment variables, for example when you add
the upload command to your CI pipeline.

For this command to work, the following environment variables must be set:

- `CONTENTFUL_ORG_ID` - The ID of your organization
- `CONTENTFUL_APP_DEF_ID` - The ID of the app to which to add the bundle
- `CONTENTFUL_ACCESS_TOKEN` - A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens)

## Libraries to use

To make your app look and feel like Contentful use the following libraries:

- [Forma 36](https://f36.contentful.com/) – Contentful's design system
- [Contentful Field Editors](https://www.contentful.com/developers/docs/extensibility/field-editors/) – Contentful's field editor React components

## Using the `contentful-management` SDK

In the default create contentful app output, a contentful management client is
passed into each location. This can be used to interact with Contentful's
management API. For example

```js
// Use the client
cma.locale.getMany({}).then((locales) => console.log(locales));
```

Visit the [`contentful-management` documentation](https://www.contentful.com/developers/docs/extensibility/app-framework/sdk/#using-the-contentful-management-library)
to find out more.

## Learn More

[Read more](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/) and check out the video on how to use the CLI.
