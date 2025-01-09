import { Column, ComboBox, DatePicker, DatePickerInput, InlineLoading, Stack, TextArea } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React, { ChangeEvent, FC, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  MAIN_STORE_LOCATION_TAG,
  today,
} from '../../../constants';
import { Party } from '../../../core/api/types/Party';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { StockOperationItemDtoSchema } from '../../validation-schema';
import useParties from '../hooks/useParties';
import StockOperationReasonSelector from '../input-components/stock-operation-reason-selector.component';
import UsersSelector from '../input-components/users-selector.component';
import styles from '../stock-operation-form.scss';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';

type BaseOperationDetailsFormStepProps = {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};

const BaseOperationDetailsFormStep: FC<BaseOperationDetailsFormStepProps> = ({
  stockOperation,
  stockOperationType,
}) => {
  const { t } = useTranslation();
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  const {
    destinationParties,
    sourceParties,
    isLoading: isPartiesLoading,
    error: patiesError,
    sourceTags,
    destinationTags,
  } = useParties(stockOperationType);
  const form = useFormContext<StockOperationItemDtoSchema>();

  // initialize location fields
  useEffect(() => {
    // Prefill default locaton with current location if is a new operation
    if (!stockOperation) {
      if (stockOperationType?.hasSource) {
        const shouldLockSource = sourceTags.length === 1 && sourceTags[0] === MAIN_STORE_LOCATION_TAG;
        if (shouldLockSource && sourceParties?.length > 0) {
          const party = sourceParties[0];
          form.setValue('sourceUuid', party.uuid);
        }
      }

      if (stockOperationType?.hasDestination) {
        const shouldLockDestination = destinationTags.length === 1 && destinationTags[0] === MAIN_STORE_LOCATION_TAG;
        if (shouldLockDestination && destinationParties?.length > 0) {
          const party = destinationParties[0];
          form.setValue('destinationUuid', party.uuid);
        }
      }
    }
  }, [sourceParties, destinationParties, stockOperation, stockOperationType, form, destinationTags, sourceTags]);

  if (isPartiesLoading)
    return (
      <InlineLoading status="active" iconDescription="Loading" description={t('loadingData', 'Loading data...')} />
    );

  if (patiesError)
    return (
      <ErrorState error={patiesError} headerTitle={t('partieserror', 'Error launching base operation details form')} />
    );

  return (
    <Stack gap={4} className={styles.grid}>
      {/* <pre>{JSON.stringify(form.getValues(), null, 2)}</pre> */}
      <Column>
        <Controller
          control={form.control}
          name="operationDate"
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              id={`operationDate`}
              datePickerType="single"
              maxDate={formatForDatePicker(today())}
              locale="en"
              className={styles.datePickerInput}
              dateFormat={DATE_PICKER_CONTROL_FORMAT}
              {...field}
              onChange={([newDate]) => {
                field.onChange(newDate);
              }}
            >
              <DatePickerInput
                autoComplete="off"
                id={`operationDate-input`}
                name="operationDate"
                placeholder={DATE_PICKER_FORMAT}
                labelText={t('operationDate', 'Operation Date')}
                invalid={error?.message}
                invalidText={error?.message}
                size="xl"
              />
            </DatePicker>
          )}
        />
      </Column>

      <Column>
        <Controller
          control={form.control}
          name="sourceUuid"
          render={({ field, fieldState: { error } }) => (
            <ComboBox
              titleText={
                stockOperationType?.hasDestination || stockOperation?.destinationUuid
                  ? t('from', 'From')
                  : t('location', 'Location')
              }
              name={'sourceUuid'}
              id={'sourceUuid'}
              size={'xl'}
              items={sourceParties}
              onChange={(data: { selectedItem: Party }) => {
                field.onChange(data.selectedItem?.uuid);
              }}
              initialSelectedItem={sourceParties.find((p) => p.uuid === field.value)}
              selectedItem={sourceParties.find((p) => p.uuid === field.value)}
              itemToString={(item?: Party) => (item && item?.name ? `${item?.name}` : '')}
              shouldFilterItem={() => true}
              placeholder={
                stockOperationType.hasDestination || stockOperation?.destinationUuid
                  ? t('chooseASource', 'Choose a source')
                  : t('chooseALocation', 'Choose a location')
              }
              ref={field.ref}
              invalid={error?.message}
              invalidText={error?.message}
            />
          )}
        />
      </Column>
      {(stockOperationType.hasDestination || stockOperation?.destinationUuid) && (
        <Column>
          <Controller
            control={form.control}
            name="destinationUuid"
            render={({ field, fieldState: { error } }) => (
              <ComboBox
                titleText={
                  stockOperationType?.hasSource || stockOperation?.atLocationUuid
                    ? t('to', 'To')
                    : t('location', 'Location')
                }
                name={'destinationUuid'}
                id={'destinationUuid'}
                size={'xl'}
                items={destinationParties}
                onChange={(data: { selectedItem: Party }) => {
                  field.onChange(data.selectedItem?.uuid);
                }}
                initialSelectedItem={destinationParties.find((p) => p.uuid === field.value)}
                selectedItem={destinationParties.find((p) => p.uuid === field.value)}
                itemToString={(item?: Party) => (item && item?.name ? `${item?.name}` : '')}
                shouldFilterItem={() => true}
                placeholder={
                  stockOperationType?.hasSource || stockOperation?.atLocationUuid
                    ? t('chooseADestination', 'Choose a destination')
                    : t('location', 'Location')
                }
                ref={field.ref}
                invalid={error?.message}
                invalidText={error?.message}
              />
            )}
          />
        </Column>
      )}
      <UsersSelector />
      {operationTypePermision.requiresStockAdjustmentReason && (
        <Column>
          <StockOperationReasonSelector />
        </Column>
      )}
      <Column>
        <Controller
          control={form.control}
          name="remarks"
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              maxCount={250}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                field.onChange(e.target.value);
              }}
              placeholder={t('enterRemarks', 'Enter remarks') + ' ...'}
              id={'remarks'}
              labelText={t('remarks', 'Remarks')}
              invalid={error?.message}
              invalidText={error?.message}
            />
          )}
        />
      </Column>
    </Stack>
  );
};

export default BaseOperationDetailsFormStep;
