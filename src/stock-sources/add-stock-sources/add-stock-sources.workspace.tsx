import { Button, Form, Select, TextInput, SelectItem, ButtonSet } from '@carbon/react';
import React, { type ChangeEvent, useCallback, useState } from 'react';
import styles from './add-stock-sources.scss';
import { useConcept } from '../../stock-lookups/stock-lookups.resource';
import { type StockSource } from '../../core/api/types/stockOperation/StockSource';
import { createOrUpdateStockSource } from '../stock-sources.resource';
import { type DefaultWorkspaceProps, restBaseUrl, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../../config-schema';
import { handleMutate } from '../../utils';
import { Save } from '@carbon/react/icons';

type AddStockSourceProps = DefaultWorkspaceProps & {
  model?: StockSource;
};

const StockSourcesAddOrUpdate: React.FC<AddStockSourceProps> = ({ model, closeWorkspace }) => {
  const { t } = useTranslation();
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

  const onFormSubmit = useCallback(
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
      <div>
        <section className={styles.section}>
          <TextInput
            id="fullname"
            type="text"
            labelText={t('fullName', 'Full Name')}
            size="md"
            onChange={onNameChanged}
            value={model?.name}
            placeholder="e.g National Medical Stores"
          />
        </section>
        <section className={styles.section}>
          <TextInput
            id="acronym"
            type="text"
            size="md"
            placeholder="e.g NMS"
            onChange={onAcronymChanged}
            value={model?.acronym}
            labelText={t('acronym', 'Acronym/Code')}
          />
        </section>
        <section className={styles.section}>
          <Select
            name="sourceType"
            className="select-field"
            labelText={t('sourceType', 'Source Type')}
            id="sourceType"
            value={formModel?.sourceType ? formModel.sourceType.uuid : ''}
            onChange={onSourceTypeChange}
          >
            <SelectItem disabled hidden value="" text={t('chooseSourceType', 'Choose a source type')} />
            {items?.answers?.map((sourceType) => (
              <SelectItem key={sourceType.uuid} value={sourceType.uuid} text={sourceType.display} />
            ))}
          </Select>
        </section>
      </div>

      <ButtonSet className={styles.buttonSet}>
        <Button kind="secondary" onClick={closeWorkspace} className={styles.button}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" className={styles.button} onClick={() => onFormSubmit} kind="primary" renderIcon={Save}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default StockSourcesAddOrUpdate;
