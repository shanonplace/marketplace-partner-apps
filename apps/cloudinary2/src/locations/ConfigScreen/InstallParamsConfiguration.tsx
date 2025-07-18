import { Checkbox, Form, FormControl, TextLink } from '@contentful/f36-components';
import { ExternalLinkTrimmedIcon } from '@contentful/f36-icons';
import { useCallback } from 'react';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { DEFAULT_APP_INSTALLATION_PARAMETERS } from '../../constants';
import { AppInstallationParameters } from '../../types';
import { BackendConfiguration } from './BackendConfiguration';

const MAX_FILES_UPPER_LIMIT = 1000;

type Props = {
  parameters: AppInstallationParameters;
  onParametersChange: (parameters: AppInstallationParameters) => void;
} & React.ComponentProps<typeof BackendConfiguration>;

export function InstallParamsConfiguration(props: Props) {
  const { parameters, onParametersChange } = props;
  const { backendParameters, onBackendParametersChange } = props;
  const onParameterChange = useCallback(
    <Key extends keyof AppInstallationParameters>(key: Key, value: AppInstallationParameters[Key]) => {
      const newParameters = {
        ...parameters,
        [key]: value,
      };
      onParametersChange(newParameters);
    },
    [parameters, onParametersChange],
  );

  return (
    <Form>
      <TextField
        testId="config-cloudName"
        name="Cloud name"
        description="The Cloudinary cloud name that the app will connect to."
        value={parameters.cloudName}
        onChange={(value) => onParameterChange('cloudName', value)}
        isRequired
        type="text"
      />
      <TextField
        testId="config-apiKey"
        name="API key"
        description={
          <>
            You can access the API key through Cloudinary's{' '}
            <TextLink
              href="https://console.cloudinary.com/settings/api-keys"
              target="_blank"
              rel="noreferrer noopener"
              icon={<ExternalLinkTrimmedIcon />}
              alignIcon="end">
              Access keys
            </TextLink>
          </>
        }
        value={parameters.apiKey}
        onChange={(value) => onParameterChange('apiKey', value)}
        isRequired
        type="text"
      />
      <BackendConfiguration backendParameters={backendParameters} onBackendParametersChange={onBackendParametersChange} />
      <TextField
        testId="config-maxFiles"
        name="Max number of files"
        description={`The max number of files that can be added to a single field. Must be between 1 and ${MAX_FILES_UPPER_LIMIT}`}
        value={String(parameters.maxFiles)}
        onChange={(value) =>
          isNaN(parseInt(value, 10))
            ? onParameterChange('maxFiles', DEFAULT_APP_INSTALLATION_PARAMETERS.maxFiles)
            : onParameterChange('maxFiles', parseInt(value, 10))
        }
        isRequired
        type="number"
        inputProps={{ min: 1, max: MAX_FILES_UPPER_LIMIT }}
      />
      <TextField
        testId="config-startFolder"
        name="Starting folder"
        description="A path to a folder which the Cloudinary Media Library will automatically browse to on load."
        value={parameters.startFolder}
        onChange={(value) => onParameterChange('startFolder', value)}
        isRequired
        type="text"
      />
      <SelectField
        testId="config-quality"
        name="Media Quality"
        description="The quality level of your assets. This can be a fixed number ranging from 1-100, or you can get Cloudinary to decide the most optimized level by setting it to 'auto'. More options are available such as: auto:low/auto:eco/auto:good/auto:best. If you wish to use the original level, set it to 'none'."
        isRequired
        options={['auto', 'none', 'auto:low', 'auto:eco', 'auto:good', 'auto:best', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']}
        value={parameters.quality}
        onChange={(value) => onParameterChange('quality', value)}
      />
      <SelectField
        testId="config-format"
        name="Format"
        description={
          <>
            The format of the assets. This can be set manually to a specific format - &lsquo;jpg&rsquo; as an example (all supported formats can be found{' '}
            <TextLink href="https://cloudinary.com/documentation/image_transformations#supported_image_formats" target="_blank" rel="noopener noreferrer">
              here
            </TextLink>
            ). By setting it to &lsquo;auto&rsquo;, Cloudinary will decide on the most optimized format for your users. If you wish to keep the original format,
            set it to &lsquo;none&rsquo;.
          </>
        }
        isRequired
        options={[
          'auto',
          'none',
          'gif',
          'webp',
          'bmp',
          'flif',
          'heif',
          'heic',
          'ico',
          'jpg',
          'jpe',
          'jpeg',
          'jp2',
          'wdp',
          'jxr',
          'hdp',
          'png',
          'psd',
          'arw',
          'cr2',
          'svg',
          'tga',
          'tif',
          'tiff',
        ]}
        value={parameters.format}
        onChange={(value) => onParameterChange('format', value)}
      />
      <Checkbox
        isChecked={parameters.showUploadButton === 'true'}
        value={'showUploadButton'}
        onChange={(event) => onParameterChange('showUploadButton', event.currentTarget.checked ? 'true' : 'false')}>
        Show Upload Button
      </Checkbox>
      <FormControl.HelpText>
        Enable or disable the upload functionality. When checked, users will see an Upload button that allows them to add assets directly to your library. When
        unchecked, the upload option will be hidden, preventing any new assets from being added manually. This setting is useful when you want to restrict asset
        input to predefined sources only.
      </FormControl.HelpText>
    </Form>
  );
}
