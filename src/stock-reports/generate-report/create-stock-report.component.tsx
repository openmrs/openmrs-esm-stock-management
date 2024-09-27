import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  InlineLoading,
  ComboBox,
  DatePickerInput,
  DatePicker,
  Select,
  SelectItem,
  RadioButtonGroup,
  RadioButton,
  Form,
  Checkbox,
  NumberInput,
} from '@carbon/react';
import styles from './create-stock-report.scss';
import { useTranslation } from 'react-i18next';
import { closeOverlay } from '../../core/components/overlay/hook';
import { useReportTypes } from '../stock-reports.resource';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatForDatePicker, today } from '../../constants';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StockReportSchema, reportSchema } from '../report-validation-schema';
import { useConcept, useStockTagLocations } from '../../stock-lookups/stock-lookups.resource';
import { ConfigObject, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { Concept } from '../../core/api/types/concept/Concept';
import { createBatchJob } from '../../stock-batch/stock-batch.resource';
import {
  ReportParameter,
  getParamDefaultLimit,
  getReportEndDateLabel,
  getReportLimitLabel,
  getReportStartDateLabel,
} from '../ReportType';
import { formatDisplayDate } from '../../core/utils/datetimeUtils';
import { BatchJobTypeReport } from '../../core/api/types/BatchJob';
interface CreateReportProps {
  model?: ReportModel;
}

export interface ReportModel {
  reportSystemName?: string;
  reportName?: string;
  parameters?: string[];
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  stockItemCategory?: string;
  stockItemCategoryConceptUuid?: string;
  location?: string;
  locationUuid?: string;
  childLocations: boolean;
  stockSourceUuid?: string;
  stockSource?: string;
  stockSourceDestinationUuid?: string;
  stockSourceDestination?: string;
  inventoryGroupBy?: string;
  inventoryGroupByName?: string;
  maxReorderLevelRatio?: number;
  stockItemUuid?: string;
  stockItemName?: string;
  patientUuid?: string;
  patientName?: string;
  limit?: number | null;
  mostLeastMoving?: string;
  mostLeastMovingName?: string;
  fullFillment?: string[];
}
const CreateReport: React.FC<CreateReportProps> = ({ model }) => {
  const { t } = useTranslation();
  const { stockItemCategoryUUID } = useConfig<ConfigObject>();

  const { reportTypes, isLoading } = useReportTypes();
  const { stockLocations } = useStockTagLocations();
  const { items } = useConcept(stockItemCategoryUUID);
  const [displayDate, setDisplayDate] = useState<boolean>(false);
  const [displayStartDate, setDisplayStartDate] = useState<boolean>(false);
  const [displayEndDate, setDisplayEndDate] = useState<boolean>(false);
  const [displayStockItemCategory, setDisplayStockItemCategory] = useState<boolean>(false);
  const [displayLocation, setDisplayLocation] = useState<boolean>(false);
  const [displayChildLocations, setDisplayChildLocations] = useState<boolean>(false);
  const [displayStockSource, setDisplayStockSource] = useState<boolean>(false);
  const [displayStockSourceDestination, setDisplayStockSourceDestination] = useState<boolean>(false);
  const [displayInventoryGroupBy, setDisplayInventoryGroupBy] = useState<boolean>(false);
  const [displayMaxReorderLevelRatio, setDisplayMaxReorderLevelRatio] = useState<boolean>(false);
  const [displayPatient, setDisplayPatient] = useState<boolean>(false);
  const [displayStockItem, setDisplayStockItem] = useState<boolean>(false);
  const [displayLimit, setDisplayLimit] = useState<boolean>(false);
  const [displayMostLeastMoving, setDisplayMostLeastMoving] = useState<boolean>(false);
  const [displayFulfillment, setDisplayFulfillment] = useState<boolean>(false);
  const [selectedReportName, setSelectedReportName] = useState<string>('');

  const handleReportNameChange = (name: string) => {
    setSelectedReportName(name);
  };
  useEffect(() => {
    let hasResetParameters = false;
    if (selectedReportName) {
      const reportType = (reportTypes as any)?.find((p) => p.name === selectedReportName);
      if (reportType) {
        setDisplayDate(reportType.parameters?.some((p) => p === ReportParameter.Date));
        setDisplayStartDate(reportType.parameters?.some((p) => p === ReportParameter.StartDate));
        setDisplayEndDate(reportType.parameters?.some((p) => p === ReportParameter.EndDate));
        setDisplayStockItemCategory(reportType.parameters?.some((p) => p === ReportParameter.StockItemCategory));
        setDisplayLocation(reportType.parameters?.some((p) => p === ReportParameter.Location));
        setDisplayChildLocations(reportType.parameters?.some((p) => p === ReportParameter.ChildLocations));
        setDisplayStockSource(reportType.parameters?.some((p) => p === ReportParameter.StockSource));
        setDisplayStockSourceDestination(
          reportType.parameters?.some((p) => p === ReportParameter.StockSourceDestination),
        );
        setDisplayInventoryGroupBy(reportType.parameters?.some((p) => p === ReportParameter.InventoryGroupBy));
        setDisplayMaxReorderLevelRatio(reportType.parameters?.some((p) => p === ReportParameter.MaxReorderLevelRatio));
        setDisplayStockItem(reportType.parameters?.some((p) => p === ReportParameter.StockItem));
        setDisplayPatient(reportType.parameters?.some((p) => p === ReportParameter.Patient));
        setDisplayLimit(reportType.parameters?.some((p) => p === ReportParameter.Limit));
        setDisplayMostLeastMoving(reportType.parameters?.some((p) => p === ReportParameter.MostLeastMoving));
        setDisplayFulfillment(reportType.parameters?.some((p) => p === ReportParameter.Fullfillment));
        hasResetParameters = true;
      }
    }
    if (!hasResetParameters) {
      setDisplayDate(false);
      setDisplayStartDate(false);
      setDisplayEndDate(false);
      setDisplayStockItemCategory(false);
      setDisplayLocation(false);
      setDisplayChildLocations(false);
      setDisplayStockSource(false);
      setDisplayStockSourceDestination(false);
      setDisplayInventoryGroupBy(false);
      setDisplayMaxReorderLevelRatio(false);
      setDisplayStockItem(false);
      setDisplayPatient(false);
      setDisplayLimit(false);
      setDisplayMostLeastMoving(false);
      setDisplayFulfillment(false);
    }
  }, [selectedReportName, reportTypes]);

  const stockItemCategories = useMemo(() => {
    return [
      {
        display: 'All Categories',
        name: 'All Categories',
        uuid: '',
      } as any as Concept,
      ...((items && items?.answers?.length > 0 ? items?.answers : items?.setMembers) ?? []),
    ];
  }, [items]);
  const {
    handleSubmit,
    control,
    formState: { errors, defaultValues, isDirty },
    setValue,
  } = useForm<StockReportSchema>({
    mode: 'all',
    resolver: zodResolver(reportSchema),
  });

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }

  const onSubmit = async (report: StockReportSchema) => {
    const reportSystemName = (reportTypes as any).find(
      (reportType) => reportType.name === report.reportName,
    )?.systemName;

    let hideSplash = true;
    try {
      const newLine = '\r\n';
      let parameters = `param.report=${reportSystemName}${newLine}`;
      if (displayFulfillment) {
        parameters += getReportParameter(
          ReportParameter.Fullfillment,
          (report.fullFillment ?? ['All']).join(','),
          (report.fullFillment ?? ['All']).join(', '),
          t('editFullfillmentReport', 'stockmanagement.report.edit.fullfillment'),
          newLine,
        );
      }
      if (displayPatient) {
        parameters += getReportParameter(
          ReportParameter.Patient,
          report.patientUuid ?? '',
          report.patientName?.trim() ?? 'All Patients',
          t('patients', 'Patients'),
          newLine,
        );
      }
      if (displayStockItem) {
        parameters += getReportParameter(
          ReportParameter.StockItem,
          report.stockItemUuid ?? '',
          report.stockItemName?.trim() ?? 'All Stock Items',
          t('stockItem', 'Stock Item'),
          newLine,
        );
      }
      if (displayStockItemCategory) {
        parameters += getReportParameter(
          ReportParameter.StockItemCategory,
          report.stockItemCategoryConceptUuid ?? '',
          report.stockItemCategory?.trim() ?? 'All Categories',
          t('stockItemCategory', 'Stock Item Category'),
          newLine,
        );
      }
      if (displayInventoryGroupBy) {
        parameters += getReportParameter(
          ReportParameter.InventoryGroupBy,
          report.inventoryGroupBy ?? 'LocationStockItemBatchNo',
          report.inventoryGroupByName?.trim() ?? 'Stock Item Batch Number',
          t('displayInventoryReport', 'stockmanagement.report.edit.inventorygroupby'),
          newLine,
        );
      }
      if (displayLocation) {
        parameters += getReportParameter(
          ReportParameter.Location,
          report.location,
          report.location?.trim() ?? '',
          t('location', 'Location'),
          newLine,
        );
        if (displayChildLocations) {
          parameters += getReportParameter(
            ReportParameter.ChildLocations,
            report.childLocations ? 'true' : 'false',
            report.childLocations ? 'Yes' : 'No',
            t('includeChildLocations', 'Include Child Locations'),
            newLine,
          );
        }
      }
      if (displayMaxReorderLevelRatio) {
        parameters += getReportParameter(
          ReportParameter.MaxReorderLevelRatio,
          (report.maxReorderLevelRatio ?? 0).toString(),
          (report.maxReorderLevelRatio ?? 0).toString() + '%',
          t('displayMaxReorderReport', 'stockmanagement.report.edit.maxreorderlevelratio'),
          newLine,
        );
      }
      if (displayStockSource) {
        parameters += getReportParameter(
          ReportParameter.StockSource,
          report.stockSourceUuid ?? '',
          report.stockSource?.trim() ?? 'All Sources',
          t('displayStockReport', 'stockmanagement.report.edit.stocksource'),
          newLine,
        );
      }
      if (displayStockSourceDestination) {
        parameters += getReportParameter(
          ReportParameter.StockSourceDestination,
          report.stockSourceDestinationUuid ?? '',
          report.stockSourceDestination?.trim() ?? 'All Destinations',
          t('displayStockDestinationReport', 'stockmanagement.report.edit.stocksourcedestination'),
          newLine,
        );
      }
      if (displayMostLeastMoving) {
        parameters += getReportParameter(
          ReportParameter.MostLeastMoving,
          report.mostLeastMoving ?? 'MostMoving',
          report.mostLeastMovingName?.trim() ?? 'Most Moving',
          t('displayMostLeastMovingReport', 'stockmanagement.report.edit.mostleastmoving'),
          newLine,
        );
      }
      if (displayLimit) {
        parameters += getReportParameter(
          ReportParameter.Limit,
          (report.limit ?? getParamDefaultLimit(report.reportSystemName) ?? 20).toString(),
          (report.limit ?? getParamDefaultLimit(report.reportSystemName) ?? 20).toString(),
          t(getReportLimitLabel(report.reportSystemName)),
          newLine,
        );
      }
      if (displayDate) {
        parameters += getReportParameter(
          ReportParameter.Date,
          report.date ? JSON.stringify(report.date).replaceAll('"', '') : '',
          formatDisplayDate(report.date) ?? '',
          t('displayReportDate', 'stockmanagement.report.edit.date'),
          newLine,
        );
      }
      if (displayStartDate) {
        parameters += getReportParameter(
          ReportParameter.StartDate,
          report.startDate ? JSON.stringify(report.startDate).replaceAll('"', '') : '',
          formatDisplayDate(report.startDate) ?? '',
          t(getReportStartDateLabel(report.reportSystemName)),
          newLine,
        );
      }
      if (displayEndDate) {
        parameters += getReportParameter(
          ReportParameter.EndDate,
          report.endDate ? JSON.stringify(report.endDate).replaceAll('"', '') : '',
          formatDisplayDate(report.endDate) ?? '',
          t(getReportEndDateLabel(report.reportSystemName)),
          newLine,
        );
      }
      const newItem = {
        batchJobType: BatchJobTypeReport,
        description: report.reportName,
        parameters: parameters,
      };
      await createBatchJob(newItem)
        .then((response) => {
          closeOverlay();
          if (response.status === 201) {
            showSnackbar({
              title: t('batchJob', 'Batch Job'),
              subtitle: t('BatchJobSuccess', 'Batch job created successfully'),
              kind: 'success',
            });
          } else {
            showSnackbar({
              title: t('BatchJobErrorTitle', 'Batch job'),
              subtitle: t('batchJobErrorMessage', 'Error creating batch job'),
              kind: 'error',
            });
          }
        })
        .catch(() => {
          showSnackbar({
            title: t('BatchJobErrorTitle', 'Batch job'),
            subtitle: t('batchJobErrorMessage', 'Error creating batch job'),
            kind: 'error',
          });
        });
      hideSplash = false;
    } finally {
      if (hideSplash) {
        // setShowSplash(false);
      }
    }
  };
  const onError = (error: any) => {
    console.error(error);
  };
  const getReportParameter = (
    name: string,
    value: string,
    valueDescription: string,
    description: string,
    newLine: string,
  ): string => {
    return `param.${name}.value=${value}${newLine}param.${name}.value.desc=${valueDescription}${newLine}param.${name}.description=${description}${newLine}`;
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)}>
      <div className={styles.reportContainer}>
        <>
          <span>{t('reportName', 'Report')}</span>
          <Controller
            control={control}
            name="reportName"
            render={({ field: { onChange } }) => (
              <ComboBox
                id="report"
                size="md"
                labelText={t('reportName', 'Report')}
                items={reportTypes}
                itemToString={(item) => `${item?.name ?? item?.name ?? ''}`}
                placeholder="Filter..."
                onChange={({ selectedItem }) => {
                  onChange(selectedItem.name);
                  handleReportNameChange(selectedItem.name);
                }}
              />
            )}
          />
        </>

        {displayStockItemCategory && (
          <>
            <span>{t('stockItemCategory', 'Stock Item Category')}</span>
            <Controller
              control={control}
              name="stockReportItemCategory"
              render={({ field: { onChange } }) => (
                <ComboBox
                  id="stockReportItem"
                  size="md"
                  labelText={t('stockItemCategory', 'Stock Item Category')}
                  items={stockItemCategories}
                  onChange={({ selectedItem }) => {
                    onChange(selectedItem.uuid);
                  }}
                  itemToString={(item) => (item && item?.display ? `${item?.display}` : '')}
                  placeholder="Filter..."
                />
              )}
            />
          </>
        )}
        {displayStartDate && (
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                datePickerType="single"
                maxDate={formatForDatePicker(today())}
                locale="en"
                dateFormat={DATE_PICKER_CONTROL_FORMAT}
                onChange={onChange}
                value={value}
              >
                <DatePickerInput
                  id="startDate"
                  name="startDate"
                  placeholder={DATE_PICKER_FORMAT}
                  labelText={t('startDate', 'Start Date')}
                  defaultValue=""
                  invalid={errors?.startDate?.message}
                  invalidText={errors?.startDate?.message}
                />
              </DatePicker>
            )}
          />
        )}
        {displayEndDate && (
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                datePickerType="single"
                maxDate={formatForDatePicker(today())}
                locale="en"
                dateFormat={DATE_PICKER_CONTROL_FORMAT}
                onChange={onChange}
                value={value}
              >
                <DatePickerInput
                  id="endDate"
                  name="endDate"
                  placeholder={DATE_PICKER_FORMAT}
                  labelText={t('endDate', 'End Date')}
                  defaultValue=""
                  invalid={errors?.endDate?.message}
                  invalidText={errors?.endDate?.message}
                />
              </DatePicker>
            )}
          />
        )}
        {displayInventoryGroupBy && (
          <Select
            id="inventoryGroupBy"
            defaultValue={model?.inventoryGroupBy}
            invalid={errors?.inventoryGroupBy?.message}
            invalidText={errors?.inventoryGroupBy?.message}
            labelText={t('inventoryBy', 'Inventory by')}
            onChange={(e) => setValue('inventoryGroupBy', e.target.value)}
          >
            <SelectItem value="" text={t('SelectOption', 'Select an option')} />
            <SelectItem value="StockItemOnly" text={t('stockItem', 'Stock Item')} />
            <SelectItem value="LocationStockItem" text={t('locationAndStockItem', 'Location and Stock Item')} />
            <SelectItem value="LocationStockItemBatchNo" text={t('locationAndBatchno', 'Location and Batch')} />
          </Select>
        )}
        {displayLocation && (
          <Select
            name="location"
            className="select-field"
            labelText={t('location', 'Location')}
            id="location"
            onChange={(e) => setValue('location', e.target.value)}
            defaultValue=""
            invalid={errors?.location?.message}
            invalidText={errors?.location?.message}
          >
            <SelectItem disabled hidden value="" text={t('chooseALocation', 'Choose a location')} />
            {(stockLocations ?? [])?.map((loc) => {
              return <SelectItem key={loc.id} value={loc.id} text={loc.name} />;
            })}
          </Select>
        )}
        {displayChildLocations && (
          <Controller
            control={control}
            name="childLocations"
            render={({ field: { onChange, value } }) => (
              <Checkbox
                id="childLocations"
                onChange={onChange}
                value={value}
                labelText={t('includeChildLocations', 'Include Child Locations')}
              />
            )}
          />
        )}
        {displayMostLeastMoving && (
          <Controller
            control={control}
            name="mostLeastMoving"
            render={({ field: { onChange, value } }) => (
              <RadioButtonGroup name="mostLeastMoving" legendText={t('rank', 'Rank')} onChange={onChange} value={value}>
                <RadioButton value="MostMoving" id="mostLeastMovingMost" labelText={t('mostMoving', 'Most Moving')} />
                <RadioButton
                  value="LeastMoving"
                  id="mostLeastMovingLeast"
                  labelText={t('leastMoving', 'Least Moving')}
                />
              </RadioButtonGroup>
            )}
          />
        )}
        {displayLimit && (
          <Controller
            control={control}
            name="limit"
            render={({ field: { onChange, value } }) => (
              <NumberInput
                id="limitTop"
                allowEmpty
                disableWheel
                hideSteppers
                value={value}
                onchange={onChange}
                label={t('limit', 'Limit')}
                defaultValue={20}
              />
            )}
          />
        )}
        {displayFulfillment && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0 1rem' }}>
            <Controller
              control={control}
              name="fullFillment"
              render={({ field: { onChange, value } }) => (
                <>
                  <Checkbox
                    id="allFulfillment"
                    checked={value?.includes('All')}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      if (isChecked) {
                        onChange(['All']);
                      } else {
                        onChange(value.filter((item) => item !== 'All'));
                      }
                    }}
                    labelText={t('all', 'All')}
                  />
                  <Checkbox
                    id="fullFulfillment"
                    checked={value?.includes('Full')}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      onChange(
                        isChecked
                          ? [...value.filter((item) => item !== 'All'), 'Full']
                          : value.filter((item) => item !== 'Full'),
                      );
                    }}
                    labelText={t('fullFulfillment', 'Full Fulfillment')}
                  />
                  <Checkbox
                    id="partialFulfillment"
                    checked={value?.includes('Partial')}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      onChange(
                        isChecked
                          ? [...value.filter((item) => item !== 'All'), 'Partial']
                          : value.filter((item) => item !== 'Partial'),
                      );
                    }}
                    labelText={t('partialFulfillment', 'Partial Fulfillment')}
                  />
                  <Checkbox
                    id="noneFulfillment"
                    checked={value?.includes('None')}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      onChange(
                        isChecked
                          ? [...value.filter((item) => item !== 'All'), 'None']
                          : value.filter((item) => item !== 'None'),
                      );
                    }}
                    labelText={t('noneFulfillment', 'Non Fulfillment')}
                  />
                </>
              )}
            />
          </div>
        )}
        {displayDate && (
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                datePickerType="single"
                maxDate={formatForDatePicker(today())}
                locale="en"
                dateFormat={DATE_PICKER_CONTROL_FORMAT}
                onChange={onChange}
                value={value}
              >
                <DatePickerInput
                  id="date"
                  name="date"
                  placeholder={DATE_PICKER_FORMAT}
                  labelText={t('date', 'Date')}
                  defaultValue=""
                  invalid={errors?.date?.message}
                  invalidText={errors?.date?.message}
                />
              </DatePicker>
            )}
          />
        )}
      </div>
      <div className={styles.reportButton}>
        <Button kind="secondary" onClick={closeOverlay}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit">{t('continue', 'Continue')}</Button>
      </div>
    </Form>
  );
};

export default CreateReport;
