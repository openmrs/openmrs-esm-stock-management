import { CircleDash } from '@carbon/react/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { type DefaultWorkspaceProps, parseDate, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type FieldError, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../../config-schema';
import { today } from '../../constants';
import { type StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import {
  operationFromString,
  OperationType,
  type StockOperationType,
  StockOperationTypeIsStockIssue,
} from '../../core/api/types/stockOperation/StockOperationType';
import { type TabItem } from '../../core/components/tabs/types';
import { otherUser, pick } from '../../core/utils/utils';
import {
  type BaseStockOperationItemFormData,
  getStockOperationFormSchema,
  getStockOperationItemFormSchema,
  type StockOperationItemDtoSchema,
} from '../validation-schema';
import useOperationTypePermisions from './hooks/useOperationTypePermisions';
import BaseOperationDetailsFormStep from './steps/base-operation-details-form-step';
import ReceivedItems from './steps/received-items.component';
import StockOperationItemsFormStep from './steps/stock-operation-items-form-step.component';
import StockOperationSubmissionFormStep from './steps/stock-operation-submission-form-step.component';
import StockIssueFormInitializerWithRelatedRequisitionOperation from './stock-issue-form-initializer-with-related-requisition-operation.component';
import StockItemForm, { type StockItemFormProps } from './stock-item-form/stock-item-form.workspace';
import StockOperationStepper from './stock-operation-stepper/stock-operation-stepper.component';

/**
 * Props interface for the StockOperationForm component
 * @interface StockOperationFormProps
 * @property {StockOperationType} [stockOperationType] - The stock operation type being created or edited.
 * @property {StockOperationDTO} [stockOperation] - The stock operation data transfer object.
 * @property {string} [stockRequisitionUuid] - Requisition operation uuid used in stock issue stockOperation type
 * When undefined or null, the form will be in creation mode.
 */
type StockOperationFormProps = DefaultWorkspaceProps & {
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
  stockRequisitionUuid?: string;
};

const StockOperationForm: React.FC<StockOperationFormProps> = ({
  stockOperation,
  stockOperationType,
  stockRequisitionUuid,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const operationType = useMemo(() => {
    return operationFromString(stockOperationType.operationType);
  }, [stockOperationType]);
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  const stockOperationItemFormSchema = useMemo(() => {
    return getStockOperationItemFormSchema(operationType);
  }, [operationType]);
  const formschema = useMemo(() => {
    return getStockOperationFormSchema(operationType);
  }, [operationType]);
  const showReceivedItems = useMemo(() => {
    return (
      (StockOperationTypeIsStockIssue(stockOperation?.operationType as OperationType) ||
        stockOperation?.permission?.canDisplayReceivedItems) &&
      (stockOperation.status === 'DISPATCHED' || stockOperation.status === 'COMPLETED')
    );
  }, [stockOperation]);
  const {
    user: { uuid: defaultLoggedUserUuid },
  } = useSession();
  const { autoPopulateResponsiblePerson } = useConfig<ConfigObject>();
  const form = useForm<StockOperationItemDtoSchema>({
    defaultValues: {
      responsiblePersonUuid:
        stockOperation?.responsiblePersonUuid ?? // if person uuid exist, make it default
        (stockOperation?.responsiblePersonOther ? otherUser.uuid : undefined) ?? // if other resp person exist, default other user uuid
        (autoPopulateResponsiblePerson ? defaultLoggedUserUuid : undefined), //Else default login user if configured
      operationDate: stockOperation?.operationDate ? parseDate(stockOperation!.operationDate as any) : today(),
      remarks: stockOperation?.remarks ?? '',

      operationTypeUuid: stockOperation?.operationTypeUuid ?? stockOperationType?.uuid,
      reasonUuid: stockOperation?.reasonUuid ?? '',
      responsiblePersonOther: stockOperation?.responsiblePersonOther ?? '',
      stockOperationItems:
        stockOperation?.stockOperationItems?.map((item) =>
          pick(
            { ...item, expiration: item.expiration ? parseDate(item.expiration as any) : undefined },
            stockOperationItemFormSchema.keyof().options,
          ),
        ) ?? [],
      sourceUuid: stockOperation?.sourceUuid ?? '',
      destinationUuid: stockOperation?.destinationUuid ?? '',
    },
    mode: 'all',
    resolver: zodResolver(formschema),
  });
  const [renderItemForm, setRenderItemForm] = useState(false);
  const [itemsFormProps, setItemFormProps] = useState<StockItemFormProps>();

  const handleLaunchStockItem = useCallback(
    (stockOperationItem?: BaseStockOperationItemFormData) => {
      setItemFormProps({
        stockOperationType,
        stockOperationItem,
        onSave: (data) => {
          const items = (form.getValues('stockOperationItems') ?? []) as Array<BaseStockOperationItemFormData>;
          const index = items.findIndex((i) => i.uuid === data.uuid);
          if (index === -1) {
            items.push(data);
          } else {
            items[index] = data;
          }
          form.setValue('stockOperationItems', items as any);
          setRenderItemForm(false);
          setItemFormProps(undefined);
        },
        onBack: () => {
          setRenderItemForm(false);
          setItemFormProps(undefined);
        },
      });
      setRenderItemForm(true);
    },
    [stockOperationType, form, setItemFormProps, setRenderItemForm],
  );
  const steps: TabItem[] = useMemo(() => {
    return [
      {
        name: stockOperation ? `${stockOperationType?.name} Details` : `${stockOperationType?.name} Details`,
        component: (
          <BaseOperationDetailsFormStep
            stockOperation={stockOperation}
            stockOperationType={stockOperationType}
            onNext={() => setSelectedIndex(1)}
          />
        ),
        disabled: false,
      },
      {
        name: t('stockItems', 'Stock Items'),
        component: (
          <StockOperationItemsFormStep
            stockOperation={stockOperation}
            stockOperationType={stockOperationType}
            onNext={() => setSelectedIndex(2)}
            onPrevious={() => setSelectedIndex(0)}
            onLaunchItemsForm={handleLaunchStockItem}
          />
        ),
        disabled: false,
      },
      {
        name: operationTypePermision?.requiresDispatchAcknowledgement ? 'Submit/Dispatch' : 'Submit/Complete',
        component: (
          <StockOperationSubmissionFormStep
            stockOperation={stockOperation}
            stockOperationType={stockOperationType}
            onPrevious={() => setSelectedIndex(1)}
            onNext={showReceivedItems ? () => setSelectedIndex(3) : undefined}
            dismissWorkspace={closeWorkspace}
          />
        ),
        disabled: false,
      },
    ].concat(
      showReceivedItems
        ? [
            {
              name: t('receivedItems', 'Received Items'),
              component: <ReceivedItems stockOperation={stockOperation} onPrevious={() => setSelectedIndex(2)} />,
              disabled: false,
            },
          ]
        : [],
    ) as TabItem[];
  }, [
    stockOperation,
    stockOperationType,
    t,
    operationTypePermision,
    showReceivedItems,
    handleLaunchStockItem,
    closeWorkspace,
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Display fields errors for stock operation items and operation type uuid
    Object.entries(form.formState.errors ?? {}).forEach(([key, val]) => {
      if (['stockOperationItems', 'operationTypeUuid'].includes(key)) {
        showSnackbar({ kind: 'error', title: key, subtitle: (val as FieldError)?.message });
      }
    });

    // Navigate to step where the error is
    const fieldSteps = [
      [
        'responsiblePersonUuid',
        'operationDate',
        'remarks',
        'sourceUuid',
        'destinationUuid',
        'reasonUuid',
        'responsiblePersonOther',
      ],
      ['stockOperationItems'],
    ];
    for (let step = 0; step < fieldSteps.length; step++) {
      const hasError = fieldSteps[step].some((field) => field in form.formState.errors);
      if (hasError) {
        setSelectedIndex(step);
        break;
      }
    }
  }, [form.formState.errors]);

  return (
    <FormProvider {...form}>
      {stockOperationType.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE && (
        <StockIssueFormInitializerWithRelatedRequisitionOperation
          stockRequisitionUuid={stockRequisitionUuid as string}
          stockOperationType={stockOperationType}
        />
      )}
      {renderItemForm ? (
        <StockItemForm {...itemsFormProps} />
      ) : (
        <StockOperationStepper
          steps={steps.map((tab, index) => ({
            title: tab.name,
            component: tab.component,
            disabled: tab.disabled,
            icon: <CircleDash />,
          }))}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        />
      )}
    </FormProvider>
  );
};

export default StockOperationForm;
