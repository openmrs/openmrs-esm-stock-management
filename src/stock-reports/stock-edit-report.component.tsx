import {
  Checkbox,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  Modal,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  RadioButtonValue,
  Select,
  SelectItem,
  SelectSkeleton,
} from "carbon-components-react";
import { Formik, FormikProps, FormikValues } from "formik";
import { produce } from "immer";
import { debounce } from "lodash-es";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { STOCK_ITEM_CATEGORY_CONCEPT_ID } from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import { useCreateBatchJobMutation } from "../core/api/batchJob";
import {
  useGetConceptByIdQuery,
  useLazyGetPatientsQuery,
} from "../core/api/lookups";
import {
  StockItemFilter,
  useLazyGetStockItemsQuery,
} from "../core/api/stockItem";
import { BatchJobTypeReport } from "../core/api/types/BatchJob";
import { Party } from "../core/api/types/Party";
import { Concept } from "../core/api/types/concept/Concept";
import { Patient } from "../core/api/types/identity/Patient";
import { StockItemDTO } from "../core/api/types/stockItem/StockItem";
import { errorAlert, successAlert } from "../core/utils/alert";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  ParseDate,
  formatDisplayDate,
  formatForDatePicker,
} from "../core/utils/datetimeUtils";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import {
  ReportParameter,
  ReportType,
  getParamDefaultLimit,
  getReportEndDateLabel,
  getReportLimitLabel,
  getReportStartDateLabel,
} from "./stock-report-type";
import { editValidationSchema } from "./validationSchema";

export interface EditReportProps {
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

export const EditReport: React.FC<EditReportProps> = ({
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
  const [displayInventoryGroupBy, setDisplayInventoryGroupBy] =
    useState<boolean>(false);
  const [displayMaxReorderLevelRatio, setDisplayMaxReorderLevelRatio] =
    useState<boolean>(false);
  const [displayPatient, setDisplayPatient] = useState<boolean>(false);
  const [displayStockItem, setDisplayStockItem] = useState<boolean>(false);
  const [displayLimit, setDisplayLimit] = useState<boolean>(false);
  const [displayMostLeastMoving, setDisplayMostLeastMoving] =
    useState<boolean>(false);
  const [displayFulfillment, setDisplayFulfillment] = useState<boolean>(false);

  const formikRef = useRef<FormikProps<FormikValues>>(null);
  const [createBatchJob] = useCreateBatchJobMutation();
  const [stockItemSearchResult, setStockItemSearchResult] = useState<
    StockItemDTO[]
  >([]);
  const [patientSearchResult, setPatientSearchResult] = useState<Patient[]>([]);
  const [getStockItems] = useLazyGetStockItemsQuery();
  const [getPatients] = useLazyGetPatientsQuery();

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

  const onMaxReorderLevelFieldChange = (value: string | number) => {
    try {
      let qtyValue: number | undefined = undefined;
      if (typeof value === "number") {
        qtyValue = value;
      } else {
        qtyValue = value && value.length > 0 ? parseFloat(value) : undefined;
      }
      setModel(
        produce((draft) => {
          draft.maxReorderLevelRatio = qtyValue;
        })
      );
      formikRef?.current?.setFieldValue("maxReorderLevelRatio", qtyValue);
    } catch (e) {
      console.log(e);
    }
  };

  const onLimitFieldChange = (value: string | number) => {
    try {
      let qtyValue: number | undefined = undefined;
      if (typeof value === "number") {
        qtyValue = value;
      } else {
        qtyValue = value && value.length > 0 ? parseFloat(value) : undefined;
      }
      setModel(
        produce((draft) => {
          draft.limit = qtyValue;
        })
      );
      formikRef?.current?.setFieldValue("limit", qtyValue);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (model.stockItemName && model.stockItemUuid) {
      setStockItemSearchResult([
        {
          uuid: model.stockItemUuid,
          conceptName: model.stockItemName,
        } as any as StockItemDTO,
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setDisplayInventoryGroupBy(
          reportType.parameters?.some(
            (p) => p === ReportParameter.InventoryGroupBy
          )
        );
        setDisplayMaxReorderLevelRatio(
          reportType.parameters?.some(
            (p) => p === ReportParameter.MaxReorderLevelRatio
          )
        );
        setDisplayStockItem(
          reportType.parameters?.some((p) => p === ReportParameter.StockItem)
        );
        setDisplayPatient(
          reportType.parameters?.some((p) => p === ReportParameter.Patient)
        );
        setDisplayLimit(
          reportType.parameters?.some((p) => p === ReportParameter.Limit)
        );
        setDisplayMostLeastMoving(
          reportType.parameters?.some(
            (p) => p === ReportParameter.MostLeastMoving
          )
        );
        setDisplayFulfillment(
          reportType.parameters?.some((p) => p === ReportParameter.Fullfillment)
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
      setDisplayInventoryGroupBy(false);
      setDisplayMaxReorderLevelRatio(false);
      setDisplayStockItem(false);
      setDisplayPatient(false);
      setDisplayLimit(false);
      setDisplayMostLeastMoving(false);
      setDisplayFulfillment(false);
    }
  }, [model.reportSystemName, reportTypes]);

  const onReportTypeChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.systemName;
    setModel({
      reportName: data.selectedItem?.display ?? data?.selectedItem?.name,
      reportSystemName: newValue,
      childLocations: false,
      limit: getParamDefaultLimit(newValue),
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
    formikRef?.current?.setFieldValue("inventoryGroupBy", null);
    formikRef?.current?.setFieldValue("maxReorderLevelRatio", null);
    formikRef?.current?.setFieldValue("stockItemUuid", null);
    formikRef?.current?.setFieldValue("patientUuid", null);
    formikRef?.current?.setFieldValue("limit", null);
    formikRef?.current?.setFieldValue("mostLeastMoving", null);
    formikRef?.current?.setFieldValue("limit", getParamDefaultLimit(newValue));
  };

  const onInventoryGroupByChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    let newValue = evt.target.value;
    setModel(
      produce((draft) => {
        draft.inventoryGroupBy = newValue;
        draft.inventoryGroupByName =
          newValue === "LocationStockItem"
            ? t("stockmanagement.report.locationstockitem")
            : newValue === "LocationStockItemBatchNo"
            ? t("stockmanagement.report.locationstockitembatchno")
            : newValue === "StockItemOnly"
            ? t("stockmanagement.report.stockitemonly")
            : undefined;
      })
    );
    formikRef?.current?.setFieldValue("inventoryGroupBy", newValue);
  };

  const onMostLeastMovingChange = (
    selection: RadioButtonValue,
    name: string,
    evt: ChangeEvent<HTMLInputElement>
  ) => {
    setModel(
      produce((draft) => {
        draft.mostLeastMoving = selection ? selection.toString() : "";
        draft.mostLeastMovingName =
          selection === "MostMoving"
            ? t("stockmanagement.report.mostmoving")
            : selection === "LeastMoving"
            ? t("stockmanagement.report.leastmoving")
            : undefined;
      })
    );
    formikRef?.current?.setFieldValue("mostLeastMoving", selection);
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

  const onDateChangeInput = (date: string | null | undefined): void => {
    let parsedDate = ParseDate(date);
    if (!parsedDate) {
      onDateChange([null, null] as any as Date[]);
    } else {
      onDateChange([parsedDate, parsedDate] as any as Date[]);
    }
  };

  const onStartDateChange = (dates: Date[]): void => {
    setModel(
      produce((draft) => {
        draft.startDate = dates[0];
      })
    );
    formikRef?.current?.setFieldValue("startDate", dates[0]);
  };

  const onStartDateChangeInput = (date: string | null | undefined): void => {
    let parsedDate = ParseDate(date);
    if (!parsedDate) {
      onStartDateChange([null, null] as any as Date[]);
    } else {
      onStartDateChange([parsedDate, parsedDate] as any as Date[]);
    }
  };

  const onEndDateChange = (dates: Date[]): void => {
    setModel(
      produce((draft) => {
        draft.endDate = dates[0];
      })
    );
    formikRef?.current?.setFieldValue("endDate", dates[0]);
  };

  const onEndDateChangeInput = (date: string | null | undefined): void => {
    let parsedDate = ParseDate(date);
    if (!parsedDate) {
      onEndDateChange([null, null] as any as Date[]);
    } else {
      onEndDateChange([parsedDate, parsedDate] as any as Date[]);
    }
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
        if (displayFulfillment) {
          parameters += getReportParameter(
            ReportParameter.Fullfillment,
            (report.fullFillment ?? ["All"]).join(","),
            (report.fullFillment ?? ["All"]).join(", "),
            t("stockmanagement.report.edit.fullfillment"),
            newLine
          );
        }
        if (displayPatient) {
          parameters += getReportParameter(
            ReportParameter.Patient,
            report.patientUuid ?? "",
            report.patientName?.trim() ?? "All Patients",
            t("stockmanagement.report.edit.patient"),
            newLine
          );
        }
        if (displayStockItem) {
          parameters += getReportParameter(
            ReportParameter.StockItem,
            report.stockItemUuid ?? "",
            report.stockItemName?.trim() ?? "All Stock Items",
            t("stockmanagement.report.edit.stockitem"),
            newLine
          );
        }
        if (displayStockItemCategory) {
          parameters += getReportParameter(
            ReportParameter.StockItemCategory,
            report.stockItemCategoryConceptUuid ?? "",
            report.stockItemCategory?.trim() ?? "All Categories",
            t("stockmanagement.report.edit.stockitemcategory"),
            newLine
          );
        }
        if (displayInventoryGroupBy) {
          parameters += getReportParameter(
            ReportParameter.InventoryGroupBy,
            report.inventoryGroupBy ?? "LocationStockItemBatchNo",
            report.inventoryGroupByName?.trim() ?? "Stock Item Batch Number",
            t("stockmanagement.report.edit.inventorygroupby"),
            newLine
          );
        }
        if (displayLocation) {
          parameters += getReportParameter(
            ReportParameter.Location,
            report.locationUuid!,
            report.location?.trim() ?? "",
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
        if (displayMaxReorderLevelRatio) {
          parameters += getReportParameter(
            ReportParameter.MaxReorderLevelRatio,
            (report.maxReorderLevelRatio ?? 0).toString(),
            (report.maxReorderLevelRatio ?? 0).toString() + "%",
            t("stockmanagement.report.edit.maxreorderlevelratio"),
            newLine
          );
        }
        if (displayStockSource) {
          parameters += getReportParameter(
            ReportParameter.StockSource,
            report.stockSourceUuid ?? "",
            report.stockSource?.trim() ?? "All Sources",
            t("stockmanagement.report.edit.stocksource"),
            newLine
          );
        }
        if (displayStockSourceDestination) {
          parameters += getReportParameter(
            ReportParameter.StockSourceDestination,
            report.stockSourceDestinationUuid ?? "",
            report.stockSourceDestination?.trim() ?? "All Destinations",
            t("stockmanagement.report.edit.stocksourcedestination"),
            newLine
          );
        }
        if (displayMostLeastMoving) {
          parameters += getReportParameter(
            ReportParameter.MostLeastMoving,
            report.mostLeastMoving ?? "MostMoving",
            report.mostLeastMovingName?.trim() ?? "Most Moving",
            t("stockmanagement.report.edit.mostleastmoving"),
            newLine
          );
        }
        if (displayLimit) {
          parameters += getReportParameter(
            ReportParameter.Limit,
            (
              report.limit ??
              getParamDefaultLimit(report.reportSystemName) ??
              20
            ).toString(),
            (
              report.limit ??
              getParamDefaultLimit(report.reportSystemName) ??
              20
            ).toString(),
            t(getReportLimitLabel(report.reportSystemName)),
            newLine
          );
        }
        if (displayDate) {
          parameters += getReportParameter(
            ReportParameter.Date,
            JSON.stringify(report.date!).replaceAll('"', ""),
            formatDisplayDate(report.date!) ?? "",
            t("stockmanagement.report.edit.date"),
            newLine
          );
        }
        if (displayStartDate) {
          parameters += getReportParameter(
            ReportParameter.StartDate,
            JSON.stringify(report.startDate!).replaceAll('"', ""),
            formatDisplayDate(report.startDate!) ?? "",
            t(getReportStartDateLabel(report.reportSystemName)),
            newLine
          );
        }
        if (displayEndDate) {
          parameters += getReportParameter(
            ReportParameter.EndDate,
            JSON.stringify(report.endDate!).replaceAll('"', ""),
            formatDisplayDate(report.endDate!) ?? "",
            t(getReportEndDateLabel(report.reportSystemName)),
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
      displayFulfillment,
      displayPatient,
      displayStockItem,
      displayStockItemCategory,
      displayInventoryGroupBy,
      displayLocation,
      displayMaxReorderLevelRatio,
      displayStockSource,
      displayStockSourceDestination,
      displayMostLeastMoving,
      displayLimit,
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

  const onStockItemChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem;
    setModel(
      produce((draft) => {
        draft.stockItemName = newValue
          ? `${newValue?.drugName}${
              newValue?.commonName ?? newValue?.conceptName
                ? ` (${newValue?.commonName ?? newValue?.conceptName})`
                : ""
            }`
          : undefined;
        draft.stockItemUuid = newValue?.uuid;
      })
    );
  };

  const handleStockItemsSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getStockItems({
          startIndex: 0,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: searchTerm,
          totalCount: true,
          isDrug: null,
        } as any as StockItemFilter)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(`Search failed ${errorMessage}`);
              return;
            } else {
              setStockItemSearchResult(payload?.results as StockItemDTO[]);
            }
          })
          .catch((error) => {
            var errorMessage = toErrorMessage(error);
            errorAlert(`Search failed ${errorMessage}`);
            return;
          });
      }, 300),
    [getStockItems]
  );

  const onPatientChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem;
    setModel(
      produce((draft) => {
        draft.patientName = newValue
          ? newValue?.display ??
            (newValue?.drugName
              ? `${newValue?.drugName}${
                  newValue?.commonName ?? newValue?.conceptName
                    ? ` (${newValue?.commonName ?? newValue?.conceptName})`
                    : ""
                }`
              : null) ??
            newValue?.conceptName ??
            ""
          : undefined;
        draft.patientUuid = newValue?.uuid;
      })
    );
  };

  const handlePatientsSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getPatients({
          startIndex: 0,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: searchTerm,
          totalCount: true,
          isDrug: null,
        } as any as StockItemFilter)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(`Search failed ${errorMessage}`);
              return;
            } else {
              setPatientSearchResult(payload?.results as Patient[]);
            }
          })
          .catch((error) => {
            var errorMessage = toErrorMessage(error);
            errorAlert(`Search failed ${errorMessage}`);
            return;
          });
      }, 300),
    [getPatients]
  );

  const onFullfillmentSelected = (fullfillment: string, checked: boolean) => {
    let newValues: string[] = model.fullFillment ? [...model.fullFillment] : [];
    if (checked) {
      if (fullfillment === "All") {
        newValues = ["All"];
      } else {
        newValues.push(fullfillment);
        newValues = newValues.filter((x) => x !== "All");
      }
    } else {
      newValues = newValues.filter((x) => x !== fullfillment);
    }
    setModel(
      produce((draft) => {
        draft.fullFillment = newValues;
      })
    );
    formikRef?.current?.setFieldValue("fullFillment", newValues);
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
            fullFillment: model.fullFillment,
            date: model.date,
            startDate: model.startDate,
            endDate: model.endDate,
            inventoryGroupBy: model.inventoryGroupBy,
            maxReorderLevelRatio: model.maxReorderLevelRatio,
            limit: model.limit,
            mostLeastMoving: model.mostLeastMoving,
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
                  {displayFulfillment && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "0 1rem",
                      }}
                    >
                      <Checkbox
                        id="allFulfillment"
                        checked={
                          model.fullFillment?.some((x) => x === "All") ?? false
                        }
                        onChange={(
                          checked: boolean,
                          id: string,
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => onFullfillmentSelected("All", checked)}
                        labelText={t(
                          "stockmanagement.report.edit.allfullfillment"
                        )}
                      />
                      <Checkbox
                        id="fullFulfillment"
                        checked={
                          model.fullFillment?.some((x) => x === "Full") ?? false
                        }
                        onChange={(
                          checked: boolean,
                          id: string,
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => onFullfillmentSelected("Full", checked)}
                        labelText={t(
                          "stockmanagement.report.edit.fullfullfillment"
                        )}
                      />
                      <Checkbox
                        id="partialFulfillment"
                        checked={
                          model.fullFillment?.some((x) => x === "Partial") ??
                          false
                        }
                        onChange={(
                          checked: boolean,
                          id: string,
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => onFullfillmentSelected("Partial", checked)}
                        labelText={t(
                          "stockmanagement.report.edit.partialfullfillment"
                        )}
                      />
                      <Checkbox
                        id="noneFulfillment"
                        checked={
                          model.fullFillment?.some((x) => x === "None") ?? false
                        }
                        onChange={(
                          checked: boolean,
                          id: string,
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => onFullfillmentSelected("None", checked)}
                        labelText={t(
                          "stockmanagement.report.edit.nonefullfillment"
                        )}
                      />
                    </div>
                  )}

                  {displayPatient && (
                    <>
                      <ComboBox
                        titleText={t("stockmanagement.report.edit.patient")}
                        id="cbPatient"
                        items={patientSearchResult}
                        onChange={onPatientChanged}
                        onInputChange={handlePatientsSearch}
                        itemToString={(item) => item?.display ?? ""}
                        placeholder={"Filter patient..."}
                      />
                    </>
                  )}
                  {displayStockItem && (
                    <>
                      <ComboBox
                        titleText={t("stockmanagement.report.edit.stockitem")}
                        id="cbStockItem"
                        initialSelectedItem={
                          model?.stockItemUuid &&
                          model.stockItemName &&
                          stockItemSearchResult?.length === 1 &&
                          stockItemSearchResult[0].uuid === model?.stockItemUuid
                            ? stockItemSearchResult[0]
                            : null
                        }
                        items={stockItemSearchResult}
                        onChange={onStockItemChanged}
                        onInputChange={handleStockItemsSearch}
                        itemToString={(item) =>
                          item
                            ? item?.display ??
                              (item?.drugName
                                ? `${item?.drugName}${
                                    item?.commonName ?? item?.conceptName
                                      ? ` (${
                                          item?.commonName ?? item?.conceptName
                                        })`
                                      : ""
                                  }`
                                : null) ??
                              item?.conceptName ??
                              ""
                            : ""
                        }
                        placeholder={"Filter stock item..."}
                      />
                    </>
                  )}
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
                                  p.uuid ===
                                  (model.stockItemCategoryConceptUuid ?? "")
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
                  {displayInventoryGroupBy && (
                    <Select
                      id="inventoryGroupBy"
                      defaultValue={model?.inventoryGroupBy}
                      invalid={
                        touched.inventoryGroupBy && !!errors.inventoryGroupBy
                      }
                      invalidText={t2(errors.inventoryGroupBy)}
                      labelText={t(
                        "stockmanagement.report.edit.inventorygroupby"
                      )}
                      onChange={onInventoryGroupByChange}
                    >
                      <SelectItem
                        value=""
                        text={t(
                          "stockmanagement.report.selectinventorygroupby"
                        )}
                      />
                      <SelectItem
                        value="StockItemOnly"
                        text={t("stockmanagement.report.stockitemonly")}
                      />
                      <SelectItem
                        value="LocationStockItem"
                        text={t("stockmanagement.report.locationstockitem")}
                      />
                      <SelectItem
                        value="LocationStockItemBatchNo"
                        text={t(
                          "stockmanagement.report.locationstockitembatchno"
                        )}
                      />
                    </Select>
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
                  {displayMaxReorderLevelRatio && (
                    <NumberInput
                      id="maxReorderLevelRatio"
                      allowEmpty={true}
                      onChange={(e: any, d: any) =>
                        onMaxReorderLevelFieldChange(e?.target?.value)
                      }
                      value={model?.maxReorderLevelRatio ?? ""}
                      label={t(
                        "stockmanagement.report.edit.maxreorderlevelratio"
                      )}
                      invalid={
                        touched.maxReorderLevelRatio &&
                        !!errors.maxReorderLevelRatio
                      }
                      invalidText={t2(errors.maxReorderLevelRatio)}
                    />
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: ".5fr .5fr",
                      gap: "0 1rem",
                    }}
                  >
                    {displayMostLeastMoving && (
                      <FormGroup
                        className="clear-margin-bottom"
                        legendText={t(
                          "stockmanagement.report.edit.mostleastmoving"
                        )}
                        title={t("stockmanagement.report.edit.mostleastmoving")}
                        invalid={
                          touched.mostLeastMoving && !!errors.mostLeastMoving
                        }
                      >
                        <RadioButtonGroup
                          name="mostLeastMoving"
                          defaultSelected={
                            model.mostLeastMoving == null
                              ? ""
                              : model.mostLeastMoving
                          }
                          legendText=""
                          onChange={onMostLeastMovingChange}
                        >
                          <RadioButton
                            value="MostMoving"
                            id="mostLeastMovingMost"
                            labelText={t("stockmanagement.report.mostmoving")}
                          />
                          <RadioButton
                            value="LeastMoving"
                            id="mostLeastMovingLeast"
                            labelText={t("stockmanagement.report.leastmoving")}
                          />
                        </RadioButtonGroup>
                        {touched.mostLeastMoving &&
                          !!errors.mostLeastMoving && (
                            <span
                              className="error-text"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {t2(errors.mostLeastMoving)}
                            </span>
                          )}
                      </FormGroup>
                    )}
                    {displayLimit && (
                      <NumberInput
                        id="limitTop"
                        allowEmpty={true}
                        onChange={(e: any, d: any) =>
                          onLimitFieldChange(e?.target?.value)
                        }
                        value={model?.limit ?? ""}
                        label={t(getReportLimitLabel(model.reportSystemName))}
                        invalid={touched.limit && !!errors.limit}
                        invalidText={t2(errors.limit)}
                      />
                    )}
                  </div>
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
                        defaultValue={formatForDatePicker(model?.date)}
                        placeholder={DATE_PICKER_FORMAT}
                        labelText={t("stockmanagement.report.edit.date")}
                        onChange={(e) => onDateChangeInput(e.target.value)}
                      />
                    </DatePicker>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: ".5fr .5fr",
                      gap: "0 1rem",
                    }}
                  >
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
                          defaultValue={formatForDatePicker(model?.startDate)}
                          placeholder={DATE_PICKER_FORMAT}
                          labelText={t(
                            getReportStartDateLabel(model.reportSystemName)
                          )}
                          onChange={(e) =>
                            onStartDateChangeInput(e.target.value)
                          }
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
                          defaultValue={formatForDatePicker(model?.endDate)}
                          placeholder={DATE_PICKER_FORMAT}
                          labelText={t(
                            getReportEndDateLabel(model.reportSystemName)
                          )}
                          onChange={(e) => onEndDateChangeInput(e.target.value)}
                        />
                      </DatePicker>
                    )}
                  </div>
                </>
              )}
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};
