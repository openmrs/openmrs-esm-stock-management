import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  NumberInput,
  Stack,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatForDatePicker, today } from '../../../constants';
import BatchNoSelector from '../../batch-no-selector/batch-no-selector.component';
import QtyUomSelector from '../../qty-uom-selector/qty-uom-selector.component';
import styles from './stock-item-form.scss';
import { BaseStockOperationItemFormData, getStockOperationItemFormSchema } from '../../validation-schema';
import { operationFromString, StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';

export interface StockItemFormProps {
  stockOperationType: StockOperationType;
  item: BaseStockOperationItemFormData;
}

interface Props extends DefaultWorkspaceProps, StockItemFormProps {}
const StockItemForm: React.FC<Props> = ({ closeWorkspace, stockOperationType }) => {
  const operationType = useMemo(() => {
    return operationFromString(stockOperationType.operationType);
  }, [stockOperationType]);
  const formschema = useMemo(() => {
    return getStockOperationItemFormSchema(operationType);
  }, [operationType]);
  const fields = formschema.keyof().options;
  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    defaultValues: {},
    mode: 'all',
  });
  const { t } = useTranslation();

  const onSubmit = (data: z.infer<typeof formschema>) => {
    closeWorkspace();
    // Implementation of adding or updating itsms in items table
  };
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        {/* <p className={styles.title}>{stockOperationItem?.commonName}</p>
        {(requiresActualBatchInformation || requiresBatchUuid) &&
          fields.includes('batchNo' as any) &&
          (canEdit || (canUpdateBatchInformation && stockOperationItem?.permission?.canUpdateBatchInformation)) && (
            <Column>
              <Controller
                control={form.control}
                defaultValue={stockOperationItem?.batchNo}
                name="batchNo"
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    {...field}
                    maxLength={50}
                    invalidText={error?.message}
                    invalid={error?.message}
                    placeholder={t('batchNumber', 'Batch Number')}
                    labelText={t('batchNumber', 'Batch Number')}
                  />
                )}
              />
            </Column>
          )}

        {requiresBatchUuid && !requiresActualBatchInformation && canEdit && (
          <BatchNoSelector
            batchUuid={stockOperationItem?.stockBatchUuid}
            onBatchNoChanged={(item) => {
              form.setValue('batchNo', item.batchNo ?? '');
              // setValue(`stockItems.${index}.batchNo`, item?.batchNo ?? '');
              form.setValue('expiration', item.expiration);
              // setValue(`stockItems.${index}.expiration`, item?.expiration);
            }}
            title={t('batchNo', 'Batch')}
            placeholder={'Filter...'}
            control={form.control}
            controllerName={'stockBatchUuid'}
            name={'stockBatchUuid'}
            stockItemUuid={stockOperationItem.stockItemUuid}
          />
        )}
        {(requiresActualBatchInformation || requiresBatchUuid) &&
          (canEdit || (canUpdateBatchInformation && stockOperationItem?.permission?.canUpdateBatchInformation)) &&
          fields.includes('expiration' as any) && (
            <Column>
              <Controller
                control={form.control}
                name="expiration"
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    id={`expiration`}
                    datePickerType="single"
                    minDate={formatForDatePicker(today())}
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
                      id={`expiration-input`}
                      name="operationDate"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText={t('expiriation', 'Expiration Date')}
                      invalid={error?.message}
                    />
                  </DatePicker>
                )}
              />
            </Column>
          )}
        {canEdit && (
          <Column>
            <Controller
              control={form.control}
              name="quantity"
              render={({ field, fieldState: { error } }) => (
                <NumberInput
                  allowEmpty
                  className="small-placeholder-text"
                  disableWheel
                  hideSteppers
                  id={`qty`}
                  {...field}
                  label={t('qty', 'Qty')}
                  invalidText={error?.message}
                  placeholder={
                    requiresBatchUuid &&
                    !requiresActualBatchInformation &&
                    stockOperationItem?.stockBatchUuid in batchBalance
                      ? `Bal: ${batchBalance[stockOperationItem?.stockBatchUuid]?.quantity?.toLocaleString() ?? ''} ${
                          batchBalance[stockOperationItem?.stockBatchUuid]?.quantityUoM ?? ''
                        }`
                      : ''
                  }
                  invalid={error?.message}
                />
              )}
            />
          </Column>
        )}
        {canEdit && (
          <Column>
            <QtyUomSelector
              stockItemUuid={stockOperationItem?.stockItemUuid}
              onStockPackageChanged={(selectedItem) => {
                form.setValue('stockItemPackagingUOMUuid', selectedItem.uuid);
                form.setValue('stockItemPackagingUOMName', selectedItem.packagingUomName);
              }}
              placeholder={'Filter...'}
              title={t('quantityUom', 'Qty UoM')}
              control={form.control}
              controllerName={'stockItemPackagingUOMUuid'}
              name={'stockItemPackagingUOMUuid'}
            />
          </Column>
        )}
        {canCapturePurchasePrice && canEdit && (
          <Column>
            <Controller
              control={form.control}
              name="purchasePrice"
              render={({ field, fieldState: { error } }) => (
                <NumberInput
                  allowEmpty
                  disableWheel
                  {...field}
                  label={t('purchasePrice', 'Purchase Price')}
                  invalid={error?.message}
                  invalidText={error?.message}
                  id={`purchaseprice`}
                  title="Purchase price"
                />
              )}
            />
          </Column>
        )} */}
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={form.formState.isSubmitting}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StockItemForm;
