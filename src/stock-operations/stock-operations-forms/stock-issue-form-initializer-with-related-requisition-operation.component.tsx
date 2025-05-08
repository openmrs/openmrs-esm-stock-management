import { parseDate, showSnackbar } from '@openmrs/esm-framework';
import React, { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { OperationType, type StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { useStockOperationAndItems } from '../stock-operations.resource';
import { getStockOperationItemFormSchema, type StockOperationItemDtoSchema } from '../validation-schema';
import { pick } from '../../core/utils/utils';
import { Loading } from '@carbon/react';

type StockIssueFormInitializerWithRelatedRequisitionOperationProps = {
  stockRequisitionUuid: string;
  stockOperationType: StockOperationType;
};

const StockIssueFormInitializerWithRelatedRequisitionOperation: React.FC<
  StockIssueFormInitializerWithRelatedRequisitionOperationProps
> = ({ stockRequisitionUuid, stockOperationType }) => {
  const form = useFormContext<StockOperationItemDtoSchema>();
  const { t } = useTranslation();
  const { error, items: stockOperation, isLoading } = useStockOperationAndItems(stockRequisitionUuid);
  const { setValue } = form;
  const stockOperationItemFormSchema = useMemo(() => {
    return getStockOperationItemFormSchema(OperationType.STOCK_ISSUE_OPERATION_TYPE);
  }, []);

  const items = form.watch('stockOperationItems');
  // initialize form values with requisition values for Stock issue operation type
  useEffect(() => {
    if (stockOperation) {
      // Initialize form with the values
      setValue('sourceUuid', stockOperation.sourceUuid);
      setValue('destinationUuid', stockOperation.destinationUuid);
      setValue('requisitionStockOperationUuid', stockRequisitionUuid);
      setValue('operationTypeUuid', stockOperationType.uuid);
      setValue('responsiblePersonUuid', stockOperation.responsiblePersonUuid);
      setValue('responsiblePersonOther', stockOperation.responsiblePersonOther);
      setValue(
        'stockOperationItems',
        (stockOperation?.stockOperationItems?.map((item) =>
          pick(
            { ...item, expiration: item.expiration ? parseDate(item.expiration as any) : undefined },
            stockOperationItemFormSchema.keyof().options,
          ),
        ) ?? []) as any,
      );
    }
  }, [stockOperation, stockOperationItemFormSchema, setValue, items, stockOperationType, stockRequisitionUuid]);

  //   Handle errors encountered
  useEffect(() => {
    if (!stockRequisitionUuid)
      showSnackbar({
        kind: 'error',
        title: t('stockIssueError', 'StockIssue error'),
        subtitle: t('relatedStockRequisitionRequired', 'Related stock requisition Required'),
      });
    if (error) {
      showSnackbar({
        kind: 'error',
        title: t('stockIssueError', 'StockIssue error'),
        subtitle: error?.message,
      });
    }
  }, [stockRequisitionUuid, error, t]);

  if (isLoading) return <Loading active description="Loading" />;

  return <React.Fragment />;
};

export default StockIssueFormInitializerWithRelatedRequisitionOperation;
