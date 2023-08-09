import {
  Form,
  Select,
  SelectItem,
  SelectSkeleton,
  TextInput,
} from "@carbon/react";
import { Formik, FormikProps, FormikValues } from "formik";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { STOCK_SOURCE_TYPE_CODED_CONCEPT_ID } from "../constants";
import { useGetConceptByIdQuery } from "../core/api/lookups";
import { StockSource } from "../core/api/types/stockOperation/StockSource";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { editValidationSchema } from "./validationSchema";

export interface EditStockSourceProps {
  model: StockSource;
  isNew: boolean;
  validateForm: boolean;
  onValidationComplete: (isSuccess: boolean, model: StockSource) => void;
  onFormLoading?: (isLoading: boolean) => void;
}

export const EditStockSource: React.FC<EditStockSourceProps> = ({
  model,
  isNew,
  validateForm,
  onValidationComplete,
  onFormLoading,
}) => {
  const { t } = useTranslation();
  const t2 = (token: any) => {
    if (token) return t(token!);
    return "";
  };
  const {
    data: sourceTypes,
    error: loadSourceTypesError,
    isLoading: isLoadingSourceTypes,
    isFetching: isFetchingSourceTypes,
    isSuccess: loadedSourceTypes,
  } = useGetConceptByIdQuery(STOCK_SOURCE_TYPE_CODED_CONCEPT_ID);
  const [formModel, setFormModel] = useState<StockSource>({ ...model });
  const formikRef = useRef<FormikProps<FormikValues>>(null);
  const [formikErrors, setFormikErrors] = useState<any>(null);

  useEffect(() => {
    onFormLoading?.(isLoadingSourceTypes);
  }, [isLoadingSourceTypes, onFormLoading]);

  const onFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    hasValidated?: boolean
  ) => {
    e?.preventDefault();
    if (formikErrors) {
      setFormikErrors(null);
    }
    let success = true;
    try {
      // do validation
      if (!!!hasValidated) {
        if (formikRef.current) {
          await formikRef.current.validateForm().then(
            (e) => {
              if (!!!formikRef.current?.isValid) {
                success = false;
                setFormikErrors(e);
              }
            },
            (f) => {
              success = false;
            }
          );
        }
      }
    } finally {
      onValidationComplete?.(success, formModel);
    }
  };

  useEffect(() => {
    if (validateForm) {
      onFormSubmit(null!, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateForm]);

  const onNameChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    setFormModel({ ...formModel, name: evt.target.value });
    formikRef?.current?.setFieldValue("name", evt.target.value);
    if (formikErrors?.name) {
      setFormikErrors({ ...formikErrors, name: null });
    }
  };

  const onAcronymChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    setFormModel({ ...formModel, acronym: evt.target.value });
    formikRef?.current?.setFieldValue("acronym", evt.target.value);
    if (formikErrors?.acronym) {
      setFormikErrors({ ...formikErrors, acronym: null });
    }
  };

  const onSourceTypeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    let selectedSourceType = (
      sourceTypes?.answers && sourceTypes?.answers.length > 0
        ? sourceTypes?.answers
        : sourceTypes?.setMembers
    )?.find((x) => x.uuid === evt.target.value);
    setFormModel({ ...formModel, sourceType: selectedSourceType });
    formikRef?.current?.setFieldValue("sourceType", selectedSourceType?.uuid);
    if (formikErrors?.sourceType) {
      setFormikErrors({ ...formikErrors, sourceType: null });
    }
  };

  return (
    <Formik
      innerRef={formikRef}
      validationSchema={editValidationSchema}
      initialValues={{
        name: formModel?.name,
        acronym: formModel?.acronym,
        sourceType: formModel?.sourceType?.uuid,
      }}
      onSubmit={(values) => {
        onFormSubmit(null!, true);
      }}
    >
      {({ errors, touched, validateField, validateForm }) => (
        <Form className="smt-form" onSubmit={onFormSubmit}>
          <TextInput
            invalid={!!formikErrors?.name}
            invalidText={t2(formikErrors?.name)}
            id="name"
            placeholder="e.g. National Medical Stores"
            name="name"
            type="text"
            maxLength={255}
            defaultValue={formModel?.name}
            onChange={onNameChanged}
            labelText={t("stockmanagement.stocksource.edit.name")}
          />
          <TextInput
            invalid={!!formikErrors?.acronym}
            invalidText={t2(formikErrors?.acronym)}
            placeholder="e.g. NMS"
            id="acronym"
            name="acronym"
            type="text"
            maxLength={255}
            defaultValue={formModel?.acronym}
            onChange={onAcronymChanged}
            labelText={t("stockmanagement.stocksource.edit.acronym")}
          />
          {isLoadingSourceTypes && <SelectSkeleton hideLabel />}
          {!isFetchingSourceTypes && !loadedSourceTypes && (
            <span className="error-text">
              {t("stockmanagement.stocksource.loadsourceTypeserror")}{" "}
              {toErrorMessage(loadSourceTypesError)}
            </span>
          )}
          {!isLoadingSourceTypes && loadedSourceTypes && (
            <Select
              invalid={!!formikErrors?.sourceType}
              invalidText={t2(formikErrors?.sourceType)}
              name="sourceType"
              className="select-field"
              labelText={t("stockmanagement.stocksource.edit.sourceType")}
              id="sourceType"
              value={formModel.sourceType?.uuid ?? "placeholder-item"}
              onChange={onSourceTypeChange}
            >
              <SelectItem
                disabled
                hidden
                value="placeholder-item"
                text="Choose a source type"
              />
              {(sourceTypes?.answers && sourceTypes?.answers.length > 0
                ? sourceTypes?.answers
                : sourceTypes?.setMembers
              )?.map((sourceType) => {
                return (
                  <SelectItem
                    key={sourceType.uuid}
                    value={sourceType.uuid}
                    text={sourceType.display}
                  />
                );
              })}
            </Select>
          )}
          <button type="submit" style={{ display: "none" }}></button>
        </Form>
      )}
    </Formik>
  );
};
