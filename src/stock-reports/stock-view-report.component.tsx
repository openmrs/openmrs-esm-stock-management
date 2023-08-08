import {
  Checkbox,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  Modal,
  SelectSkeleton,
} from "carbon-components-react";
import { Formik, FormikProps, FormikValues } from "formik";
import { produce } from "immer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { STOCK_ITEM_CATEGORY_CONCEPT_ID } from "../constants";
import { useCreateBatchJobMutation } from "../core/api/batchJob";
import { useGetConceptByIdQuery } from "../core/api/lookups";
import { BatchJobTypeReport } from "../core/api/types/BatchJob";
import { Party } from "../core/api/types/Party";
import { Concept } from "../core/api/types/concept/Concept";
import { errorAlert, successAlert } from "../core/utils/alert";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatDisplayDate,
  formatForDatePicker,
} from "../core/utils/datetimeUtils";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { ReportParameter, ReportType } from "./stock-report-type";
import { editValidationSchema } from "./validationSchema";

export interface ViewReportProps {
  model: ReportModel;
  setModel: React.Dispatch<React.SetStateAction<ReportModel>>;
  isNew: boolean;
  setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
  reportTypes: ReportType[];
  stockSourceList: Party[];
  partyLookupList: Party[];
  refreshBatchJobs: () => void;
  onCloseEditDialog: (
    showReportStatus: boolean,
    batchJobUuid?: string | null
  ) => void;
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
}

export const ViewReport: React.FC<ViewReportProps> = ({
  model,
  setModel,
  isNew,
  setShowSplash,
  reportTypes,
  partyLookupList,
  stockSourceList,
  onCloseEditDialog,
  refreshBatchJobs,
}) => {
  const { t } = useTranslation();
  const t2 = (token: any) => {
    if (token) return t(token!);
    return "";
  };
  const {
    data: stockItemCategoriesRemote,
    isLoading: isLoadingStockItemCategories,
  } = useGetConceptByIdQuery(STOCK_ITEM_CATEGORY_CONCEPT_ID);
  const [displayDate, setDisplayDate] = useState<boolean>(false);
  const [displayStartDate, setDisplayStartDate] = useState<boolean>(false);
  const [displayEndDate, setDisplayEndDate] = useState<boolean>(false);
  const [displayStockItemCategory, setDisplayStockItemCategory] =
    useState<boolean>(false);
  const [displayLocation, setDisplayLocation] = useState<boolean>(false);
  const [displayChildLocations, setDisplayChildLocations] =
    useState<boolean>(false);
  const [displayStockSource, setDisplayStockSource] = useState<boolean>(false);
  const [displayStockSourceDestination, setDisplayStockSourceDestination] =
    useState<boolean>(false);

  const formikRef = useRef<FormikProps<FormikValues>>(null);
  const [createBatchJob] = useCreateBatchJobMutation();

  const stockItemCategories = useMemo(() => {
    return [
      {
        display: "All Categories",
        name: "All Categories",
        uuid: "",
      } as any as Concept,
      ...((stockItemCategoriesRemote &&
      stockItemCategoriesRemote?.answers.length > 0
        ? stockItemCategoriesRemote?.answers
        : stockItemCategoriesRemote?.setMembers) ?? []),
    ];
  }, [stockItemCategoriesRemote]);

  const stockSources = useMemo(() => {
    return [
      {
        display: "All Sources",
        name: "All Sources",
        stockSourceUuid: "",
      } as any as Party,
      ...(stockSourceList ?? []),
    ];
  }, [stockSourceList]);

  const onStockItemCategoryChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.uuid ?? data.selectedItem?.uuid;
    setModel(
      produce((draft) => {
        draft.stockItemCategory =
          data.selectedItem?.display ?? data.selectedItem?.name;
        draft.stockItemCategoryConceptUuid = newValue;
      })
    );
  };

  const onStockSourceChanged = (data: { selectedItem: any }) => {
    let newValue =
      data.selectedItem?.stockSourceUuid ?? data.selectedItem?.uuid;
    setModel(
      produce((draft) => {
        draft.stockSource =
          data.selectedItem?.display ?? data.selectedItem?.name;
        draft.stockSourceUuid = newValue;
      })
    );
  };

  const onStockSourceDestinationChanged = (data: { selectedItem: any }) => {
    let newValue =
      data.selectedItem?.stockSourceUuid ?? data.selectedItem?.uuid;
    setModel(
      produce((draft) => {
        draft.stockSourceDestination =
          data.selectedItem?.display ?? data.selectedItem?.name;
        draft.stockSourceDestinationUuid = newValue;
      })
    );
  };

  const onLocationChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.locationUuid ?? data.selectedItem?.uuid;
    setModel(
      produce((draft) => {
        draft.location = data.selectedItem?.display ?? data.selectedItem?.name;
        draft.locationUuid = newValue;
      })
    );
    formikRef?.current?.setFieldValue("locationUuid", newValue);
  };

  useEffect(() => {
    let hasResetParameters = false;
    if (model.reportSystemName) {
      let reportType = reportTypes?.find(
        (p) => p.systemName === model.reportSystemName
      );
      if (reportType) {
        setDisplayDate(
          reportType.parameters?.some((p) => p === ReportParameter.Date)
        );
        setDisplayStartDate(
          reportType.parameters?.some((p) => p === ReportParameter.StartDate)
        );
        setDisplayEndDate(
          reportType.parameters?.some((p) => p === ReportParameter.EndDate)
        );
        setDisplayStockItemCategory(
          reportType.parameters?.some(
            (p) => p === ReportParameter.StockItemCategory
          )
        );
        setDisplayLocation(
          reportType.parameters?.some((p) => p === ReportParameter.Location)
        );
        setDisplayChildLocations(
          reportType.parameters?.some(
            (p) => p === ReportParameter.ChildLocations
          )
        );
        setDisplayStockSource(
          reportType.parameters?.some((p) => p === ReportParameter.StockSource)
        );
        setDisplayStockSourceDestination(
          reportType.parameters?.some(
            (p) => p === ReportParameter.StockSourceDestination
          )
        );
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
    }
  }, [model.reportSystemName, reportTypes]);

  const onReportTypeChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.systemName;
    setModel({
      reportName: data.selectedItem?.display ?? data?.selectedItem?.name,
      reportSystemName: newValue,
      childLocations: false,
    });
    let reportType = reportTypes?.find((p) => p.systemName === newValue);
    formikRef?.current?.setFieldValue(
      "parameters",
      reportType?.parameters ?? []
    );
    formikRef?.current?.setFieldValue("reportSystemName", newValue);
    formikRef?.current?.setFieldValue("locationUuid", null);
    formikRef?.current?.setFieldValue("date", null);
    formikRef?.current?.setFieldValue("startDate", null);
    formikRef?.current?.setFieldValue("endDate", null);
  };

  const onChildLocationsChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    let newValue = !model.childLocations;
    setModel(
      produce((draft) => {
        draft.childLocations = newValue;
      })
    );
  };

  const onDateChange = (dates: Date[]): void => {
    setModel(
      produce((draft) => {
        draft.date = dates[0];
      })
    );
    formikRef?.current?.setFieldValue("date", dates[0]);
  };

  const onStartDateChange = (dates: Date[]): void => {
    setModel(
      produce((draft) => {
        draft.startDate = dates[0];
      })
    );
    formikRef?.current?.setFieldValue("startDate", dates[0]);
  };

  const onEndDateChange = (dates: Date[]): void => {
    setModel(
      produce((draft) => {
        draft.endDate = dates[0];
      })
    );
    formikRef?.current?.setFieldValue("endDate", dates[0]);
  };

  const handleSave = async () => {
    try {
      if (formikRef.current) {
        let success: boolean = true;
        await formikRef.current.validateForm().then(
          (e) => {
            if (!!!formikRef.current?.isValid) {
              success = false;
              setTimeout(() => {
                Object.keys(e).forEach((p) => {
                  formikRef.current?.setFieldTouched(p, true, true);
                });
              });
            }
          },
          (f) => {
            success = false;
          }
        );
        if (success) {
          setShowSplash(true);
          handleSaveBatchJob(model);
        }
      }
    } finally {
    }
  };

  const getReportParameter = (
    name: string,
    value: string,
    valueDescription: string,
    description: string,
    newLine: string
  ): string => {
    return `param.${name}.value=${value}${newLine}param.${name}.value.desc=${valueDescription}${newLine}param.${name}.description=${description}${newLine}`;
  };

  const handleSaveBatchJob = useCallback(
    async (report: ReportModel) => {
      let hideSplash = true;
      try {
        let newLine = "\r\n";
        let parameters: string = `param.report=${report.reportSystemName}${newLine}`;
        if (displayStockItemCategory) {
          parameters += getReportParameter(
            ReportParameter.StockItemCategory,
            report.stockItemCategoryConceptUuid!,
            report.stockItemCategory!.trim(),
            t("stockmanagement.report.edit.stockitemcategory"),
            newLine
          );
        }
        if (displayLocation) {
          parameters += getReportParameter(
            ReportParameter.Location,
            report.locationUuid!,
            report.location!.trim(),
            t("stockmanagement.report.edit.location"),
            newLine
          );
          if (displayChildLocations) {
            parameters += getReportParameter(
              ReportParameter.ChildLocations,
              report.childLocations ? "true" : "false",
              report.childLocations ? "Yes" : "No",
              t("stockmanagement.report.edit.childlocation"),
              newLine
            );
          }
        }
        if (displayStockSource) {
          parameters += getReportParameter(
            ReportParameter.StockSource,
            report.stockSourceUuid!,
            report.stockSource!.trim(),
            t("stockmanagement.report.edit.stocksource"),
            newLine
          );
        }
        if (displayStockSourceDestination) {
          parameters += getReportParameter(
            ReportParameter.StockSourceDestination,
            report.stockSourceDestinationUuid!,
            report.stockSourceDestination!.trim(),
            t("stockmanagement.report.edit.stocksourcedestination"),
            newLine
          );
        }
        if (displayDate) {
          parameters += getReportParameter(
            ReportParameter.Date,
            JSON.stringify(report.date!).replaceAll('"', ""),
            formatDisplayDate(report.date!),
            t("stockmanagement.report.edit.date"),
            newLine
          );
        }
        if (displayStartDate) {
          parameters += getReportParameter(
            ReportParameter.StartDate,
            JSON.stringify(report.startDate!).replaceAll('"', ""),
            formatDisplayDate(report.startDate!),
            t("stockmanagement.report.edit.startdate"),
            newLine
          );
        }
        if (displayEndDate) {
          parameters += getReportParameter(
            ReportParameter.EndDate,
            JSON.stringify(report.endDate!).replaceAll('"', ""),
            formatDisplayDate(report.endDate!),
            t("stockmanagement.report.edit.enddate"),
            newLine
          );
        }

        let newItem = {
          batchJobType: BatchJobTypeReport,
          description: report.reportName,
          parameters: parameters,
        } as any;

        await createBatchJob(newItem)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorToken = toErrorMessage(payload);
              errorAlert(
                `${t(
                  "stockmanagement.report.batchjobcreatefailed"
                )} ${errorToken}`
              );
              return;
            } else {
              successAlert(
                `${t("stockmanagement.report.batchjobcreatesuccess")}`
              );
              refreshBatchJobs();
              onCloseEditDialog(true, payload?.uuid);
            }
          })
          .catch((error) => {
            var errorToken = toErrorMessage(error);
            errorAlert(
              `${t(
                "stockmanagement.report.batchjobcreatefailed"
              )} ${errorToken}`
            );
            return;
          });
        setShowSplash(false);
        hideSplash = false;
      } finally {
        if (hideSplash) {
          setShowSplash(false);
        }
      }
    },
    [
      displayStockItemCategory,
      displayLocation,
      displayStockSource,
      displayStockSourceDestination,
      displayDate,
      displayStartDate,
      displayEndDate,
      createBatchJob,
      setShowSplash,
      t,
      displayChildLocations,
      refreshBatchJobs,
      onCloseEditDialog,
    ]
  );

  const onRequestCloseModal = () => {
    onCloseEditDialog(false, null);
  };

  return (
    <>
      <Modal
        open={true}
        primaryButtonText={t("stockmanagement.continue")}
        secondaryButtonText={t("stockmanagement.cancel")}
        primaryButtonDisabled={false}
        modalLabel={t("stockmanagement.report.edit.title")}
        modalHeading=""
        onRequestClose={onRequestCloseModal}
        shouldSubmitOnEnter={false}
        onRequestSubmit={handleSave}
        onSecondarySubmit={onRequestCloseModal}
      >
        <Formik
          innerRef={formikRef}
          validationSchema={editValidationSchema}
          initialValues={{
            locationUuid: model.locationUuid,
            reportSystemName: model.reportSystemName,
            parameters: model.parameters,
            date: model.date,
            startDate: model.startDate,
            endDate: model.endDate,
          }}
          onSubmit={(values) => {
            formikRef?.current?.setSubmitting(false);
          }}
        >
          {({
            errors,
            touched,
            validateField,
            validateForm,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form
              className="smt-form"
              style={{ minHeight: "500px" }}
              onSubmit={handleSubmit}
            >
              <ComboBox
                titleText={t("stockmanagement.report.edit.reportname")}
                id="reportSystemName"
                initialSelectedItem={
                  model.reportSystemName
                    ? ({
                        systemName: model.reportSystemName,
                        display: model.reportName,
                      } as any)
                    : null
                }
                selectedItem={
                  model.reportSystemName
                    ? {
                        systemName: model.reportSystemName,
                        display: model.reportName,
                      }
                    : null
                }
                items={
                  model.reportSystemName
                    ? [
                        ...(reportTypes.some(
                          (x) => x.systemName === model.reportSystemName
                        )
                          ? []
                          : [
                              {
                                systemName: model.reportSystemName,
                                display: model.reportName,
                              },
                            ]),
                        ...(reportTypes ?? []),
                      ]
                    : reportTypes
                }
                onChange={(data: { selectedItem: any }) =>
                  onReportTypeChanged(data)
                }
                shouldFilterItem={(data) => true}
                itemToString={(item) => item?.display ?? item?.name ?? ""}
                placeholder={"Filter..."}
                invalid={touched.reportSystemName && !!errors.reportSystemName}
                invalidText={t2(errors.reportSystemName)}
              />
              {model.reportSystemName && (
                <>
                  {displayStockItemCategory && (
                    <>
                      {(isLoadingStockItemCategories ||
                        !stockItemCategories) && <SelectSkeleton hideLabel />}
                      {!(
                        isLoadingStockItemCategories || !stockItemCategories
                      ) && (
                        <>
                          <ComboBox
                            titleText={t(
                              "stockmanagement.report.edit.stockitemcategory"
                            )}
                            invalid={
                              touched.stockItemCategoryConceptUuid &&
                              !!errors.stockItemCategoryConceptUuid
                            }
                            invalidText={t2(
                              errors.stockItemCategoryConceptUuid
                            )}
                            name="stockItemCategoryConceptUuid"
                            className="select-field"
                            id="stockItemCategory"
                            items={stockItemCategories}
                            onChange={onStockItemCategoryChanged}
                            shouldFilterItem={(data) => true}
                            initialSelectedItem={
                              stockItemCategories?.find(
                                (p) =>
                                  p.uuid === model.stockItemCategoryConceptUuid
                              ) ?? ({} as any)
                            }
                            itemToString={(item) =>
                              item && item?.display ? `${item?.display}` : ""
                            }
                            placeholder={t(
                              "stockmanagement.report.edit.stockitemcategoryholder"
                            )}
                          />
                        </>
                      )}
                    </>
                  )}
                  {displayLocation && (
                    <>
                      <ComboBox
                        titleText={t("stockmanagement.report.edit.location")}
                        id="reportLocation"
                        initialSelectedItem={
                          model.locationUuid
                            ? ({
                                uuid: model.locationUuid,
                                display: model.location,
                              } as any)
                            : null
                        }
                        selectedItem={
                          model.locationUuid
                            ? {
                                uuid: model.locationUuid,
                                display: model.location,
                              }
                            : null
                        }
                        items={
                          model.location
                            ? [
                                ...(partyLookupList.some(
                                  (x) => x.locationUuid === model.locationUuid
                                )
                                  ? []
                                  : [
                                      {
                                        uuid: model.locationUuid,
                                        display: model.location,
                                      },
                                    ]),
                                ...(partyLookupList ?? []),
                              ]
                            : partyLookupList
                        }
                        onChange={(data: { selectedItem: any }) =>
                          onLocationChanged(data)
                        }
                        shouldFilterItem={(data) => true}
                        itemToString={(item) => item?.display ?? item?.name}
                        placeholder={"Filter..."}
                        invalid={touched.locationUuid && !!errors.locationUuid}
                        invalidText={t2(errors.locationUuid)}
                      />
                      {displayChildLocations && (
                        <Checkbox
                          id="childLocations"
                          checked={model.childLocations ?? false}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                            d: { checked: boolean; id: string }
                          ) => onChildLocationsChanged(e, d)}
                          labelText={t(
                            "stockmanagement.report.edit.childlocation"
                          )}
                        />
                      )}
                    </>
                  )}
                  {displayStockSource && (
                    <>
                      <ComboBox
                        titleText={t("stockmanagement.report.edit.stocksource")}
                        id="reportStockSource"
                        initialSelectedItem={
                          model.stockSourceUuid
                            ? ({
                                uuid: model.stockSourceUuid,
                                display: model.stockSource,
                              } as any)
                            : null
                        }
                        selectedItem={
                          model.stockSourceUuid
                            ? {
                                uuid: model.stockSourceUuid,
                                display: model.stockSource,
                              }
                            : null
                        }
                        items={
                          model.stockSource
                            ? [
                                ...(stockSources.some(
                                  (x) =>
                                    x.stockSourceUuid === model.stockSourceUuid
                                )
                                  ? []
                                  : [
                                      {
                                        uuid: model.stockSourceUuid,
                                        display: model.stockSource,
                                      },
                                    ]),
                                ...(stockSources ?? []),
                              ]
                            : stockSources
                        }
                        onChange={(data: { selectedItem: any }) =>
                          onStockSourceChanged(data)
                        }
                        shouldFilterItem={(data) => true}
                        itemToString={(item) => item?.display ?? item?.name}
                        placeholder={"Filter..."}
                        invalid={
                          touched.stockSourceUuid && !!errors.stockSourceUuid
                        }
                        invalidText={t2(errors.stockSourceUuid)}
                      />
                    </>
                  )}
                  {displayStockSourceDestination && (
                    <>
                      <ComboBox
                        titleText={t(
                          "stockmanagement.report.edit.stocksourcedestination"
                        )}
                        id="reportStockSourceDestination"
                        initialSelectedItem={
                          model.stockSourceDestinationUuid
                            ? ({
                                uuid: model.stockSourceDestinationUuid,
                                display: model.stockSourceDestination,
                              } as any)
                            : null
                        }
                        selectedItem={
                          model.stockSourceDestinationUuid
                            ? {
                                uuid: model.stockSourceDestinationUuid,
                                display: model.stockSourceDestination,
                              }
                            : null
                        }
                        items={
                          model.stockSourceDestination
                            ? [
                                ...(stockSources.some(
                                  (x) =>
                                    x.stockSourceUuid ===
                                    model.stockSourceDestinationUuid
                                )
                                  ? []
                                  : [
                                      {
                                        uuid: model.stockSourceDestinationUuid,
                                        display: model.stockSourceDestination,
                                      },
                                    ]),
                                ...(stockSources ?? []),
                              ]
                            : stockSources
                        }
                        onChange={(data: { selectedItem: any }) =>
                          onStockSourceDestinationChanged(data)
                        }
                        shouldFilterItem={(data) => true}
                        itemToString={(item) => item?.display ?? item?.name}
                        placeholder={"Filter..."}
                        invalid={
                          touched.stockSourceDestinationUuid &&
                          !!errors.stockSourceDestinationUuid
                        }
                        invalidText={t2(errors.stockSourceDestinationUuid)}
                      />
                    </>
                  )}
                  {displayDate && (
                    <DatePicker
                      datePickerType="single"
                      locale="en"
                      dateFormat={DATE_PICKER_CONTROL_FORMAT}
                      onChange={onDateChange}
                    >
                      <DatePickerInput
                        invalid={touched.date && !!errors.date}
                        invalidText={t2(errors.date)}
                        id="date"
                        name="date"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText={t("stockmanagement.report.edit.date")}
                        value={formatForDatePicker(model?.date)}
                      />
                    </DatePicker>
                  )}
                  {displayStartDate && (
                    <DatePicker
                      datePickerType="single"
                      locale="en"
                      dateFormat={DATE_PICKER_CONTROL_FORMAT}
                      onChange={onStartDateChange}
                    >
                      <DatePickerInput
                        invalid={touched.startDate && !!errors.startDate}
                        invalidText={t2(errors.startDate)}
                        id="startDate"
                        name="startDate"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText={t("stockmanagement.report.edit.startdate")}
                        value={formatForDatePicker(model?.startDate)}
                      />
                    </DatePicker>
                  )}
                  {displayEndDate && (
                    <DatePicker
                      datePickerType="single"
                      locale="en"
                      dateFormat={DATE_PICKER_CONTROL_FORMAT}
                      onChange={onEndDateChange}
                    >
                      <DatePickerInput
                        invalid={touched.endDate && !!errors.endDate}
                        invalidText={t2(errors.endDate)}
                        id="endDate"
                        name="endDate"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText={t("stockmanagement.report.edit.enddate")}
                        value={formatForDatePicker(model?.endDate)}
                      />
                    </DatePicker>
                  )}
                </>
              )}
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};
