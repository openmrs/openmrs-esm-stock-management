import React, { type ChangeEvent, useCallback, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSet, Select, SelectItem, Stack, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Save } from '@carbon/react/icons';
import {
  getCoreTranslation,
  restBaseUrl,
  showSnackbar,
  type DefaultWorkspaceProps,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useConcept } from '../../stock-lookups/stock-lookups.resource';
import { type StockSource } from '../../core/api/types/stockOperation/StockSource';
import { createOrUpdateStockSource } from '../stock-sources.resource';
import { type ConfigObject } from '../../config-schema';
import { handleMutate } from '../../utils';
import styles from './add-stock-sources.scss';

type AddStockSourceProps = DefaultWorkspaceProps & {
  model?: StockSource;
};

const StockSourcesAddOrUpdate: React.FC<AddStockSourceProps> = ({ model, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { stockSourceTypeUUID } = useConfig<ConfigObject>();

  // get stock sources
  const { items } = useConcept(stockSourceTypeUUID);

  const [formModel, setFormModel] = useState<StockSource>({ ...model });

  const onNameChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    model ? (model.name = evt.target.value) : '';
    setFormModel({ ...formModel, name: evt.target.value });
  };

  const onAcronymChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    model ? (model.acronym = evt.target.value) : '';
    setFormModel({ ...formModel, acronym: evt.target.value });
  };

  const onSourceTypeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const selectedSourceType = items?.answers.find((x) => x.uuid === evt.target.value);
    setFormModel({ ...formModel, sourceType: selectedSourceType });
  };

  const handleSave = useCallback(
    (event) => {
      event.preventDefault();

      if (model) {
        formModel.uuid = model.uuid;
      }

      createOrUpdateStockSource(formModel)
        .then(
          () => {
            showSnackbar({
              isLowContrast: true,
              title: t('addedSource', 'Add Source'),
              kind: 'success',
              subtitle: t('stockSourceAddedSuccessfully', 'Stock Source Added Successfully'),
              timeoutInMs: 5000,
            });

            handleMutate(`${restBaseUrl}/stockmanagement/stocksource`);

            closeWorkspace();
          },
          (error) => {
            showSnackbar({
              title: t('errorAddingSource', 'Error adding a source'),
              kind: 'error',
              isLowContrast: true,
              subtitle: error?.message,
            });
            closeWorkspace();
          },
        )
        .catch();
    },
    [formModel, model, t, closeWorkspace],
  );
  return (
    <div className={styles.formContainer}>
      <div className={styles.body}>
        <Stack gap={5}>
          <TextInput
            id="fullname"
            labelText={t('fullName', 'Full name')}
            onChange={onNameChanged}
            placeholder="e.g National Medical Stores"
            size="md"
            type="text"
            value={model?.name}
          />
          <TextInput
            id="acronym"
            labelText={t('acronymOrCode', 'Acronym/Code')}
            onChange={onAcronymChanged}
            placeholder="e.g NMS"
            size="md"
            type="text"
            value={model?.acronym}
          />
          <Select
            className="select-field"
            id="sourceType"
            labelText={t('sourceType', 'Source Type')}
            name="sourceType"
            onChange={onSourceTypeChange}
            value={formModel?.sourceType ? formModel.sourceType.uuid : ''}
          >
            <SelectItem disabled hidden value="" text={t('chooseSourceType', 'Choose a source type')} />
            {items?.answers?.map((sourceType) => (
              <SelectItem key={sourceType.uuid} value={sourceType.uuid} text={sourceType.display} />
            ))}
          </Select>
        </Stack>
      </div>
      <ButtonSet
        className={classNames(styles.buttonSet, {
          [styles.tablet]: isTablet,
          [styles.desktop]: !isTablet,
        })}
      >
        <Button kind="secondary" onClick={closeWorkspace} className={styles.button}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button type="submit" className={styles.button} onClick={handleSave} kind="primary" renderIcon={Save}>
          {getCoreTranslation('save')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default StockSourcesAddOrUpdate;
