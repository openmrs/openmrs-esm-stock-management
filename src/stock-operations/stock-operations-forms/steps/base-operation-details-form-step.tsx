import { Column, ComboBox, DatePicker, DatePickerInput, InlineLoading, Stack, TextArea } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React, { ChangeEvent, FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatForDatePicker, today } from '../../../constants';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { StockOperationItemDtoSchema } from '../../validation-schema';
import useParties from '../hooks/useParties';
import styles from '../stock-operation-form.scss';
import { Party } from '../../../core/api/types/Party';
import StockOperationReasonSelector from '../input-components/stock-operation-reason-selector.component';

type BaseOperationDetailsFormStepProps = {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};

const BaseOperationDetailsFormStep: FC<BaseOperationDetailsFormStepProps> = ({
  stockOperation,
  stockOperationType,
}) => {
  const { t } = useTranslation();

  const {
    destinationParties,
    sourceParties,
    isLoading: isPartiesLoading,
    error: patiesError,
  } = useParties(stockOperationType);
  const form = useFormContext<StockOperationItemDtoSchema>();

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
      <Column>
        <Controller
          control={form.control}
          name="reasonUuid"
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
      <Column>
        <StockOperationReasonSelector />
      </Column>
    </Stack>
  );
};

export default BaseOperationDetailsFormStep;
