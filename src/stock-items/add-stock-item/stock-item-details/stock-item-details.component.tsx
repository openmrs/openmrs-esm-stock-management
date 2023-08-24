import React, { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import addStockStyles from "../add-stock-item.scss";
import styles from "./stock-item-details.scss";
import { Save } from "@carbon/react/icons";

import { Button, FormGroup, RadioButton, InlineLoading } from "@carbon/react";
import { StockItemDTO } from "../../../core/api/types/stockItem/StockItem";
import DrugSelector from "../drug-selector/drug-selector.component";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockItemDetailsSchema,
  StockItemFormData,
} from "../../validationSchema";
import ControlledRadioButtonGroup from "../../../core/components/carbon/controlled-radio-button-group/controlled-radio-button-group.component";
import ControlledNumberInput from "../../../core/components/carbon/controlled-number-input/controlled-number-input.component";
import ControlledTextInput from "../../../core/components/carbon/controlled-text-input/controlled-text-input.component";
import DispensingUnitSelector from "../dispensing-unit-selector/dispensing-unit-selector.component";
import PreferredVendorSelector from "../preferred-vendor-selector/preferred-vendor-selector.component";
import StockItemCategorySelector from "../stock-item-category-selector/stock-item-category-selector.component";

interface StockItemDetailsProps {
  model: StockItemDTO;
  onSave: (item: StockItemDTO) => Promise<void>;
}

const StockItemDetails = forwardRef<never, StockItemDetailsProps>(
  ({ model, onSave }, ref) => {
    const { t } = useTranslation();
    const {
      handleSubmit,
      control,
      setValue,
      formState: { errors },
    } = useForm<StockItemFormData>({
      defaultValues: model,
      mode: "all",
      resolver: zodResolver(stockItemDetailsSchema),
    });

    const handleSave = async (model: StockItemDTO) => {
      try {
        setIsSaving(true);
        await onSave(model);
      } catch (e) {
        // Show notification
      } finally {
        setIsSaving(false);
      }
    };

    const [isSaving, setIsSaving] = useState(false);
    const [isDrug, setIsDrug] = useState<boolean | null>();
    const [hasExpiration, setHasExpiration] = useState<boolean | null>();

    return (
      <form className={`${addStockStyles.formContainer} ${styles.form}`}>
        <FormGroup
          className="clear-margin-bottom"
          legendText={t("itemType", "Item Type")}
          title={t("itemType", "Item Type")}
        >
          <ControlledRadioButtonGroup
            control={control}
            controllerName="isDrug"
            legendText=""
            invalid={!!errors.isDrug}
            invalidText={errors.isDrug && errors?.isDrug?.message}
            onChange={(selection: boolean) => {
              setIsDrug(selection);
            }}
            name="isDrug"
          >
            <RadioButton value={true} id="isDrug-true" labelText="Drug" />
            <RadioButton value={false} id="isDrug-false" labelText="Other" />
          </ControlledRadioButtonGroup>
        </FormGroup>
        {isDrug && (
          <DrugSelector
            name="drugUuid"
            controllerName="drugUuid"
            control={control}
            title={t("pleaseSpecify", "Please specify:")}
            invalid={!!errors.drugUuid}
            invalidText={errors.drugUuid && errors?.drugUuid?.message}
          />
        )}
        {/*<ComboBox titleText={t('stockmanagement.pleasespecify')}*/}
        {/*          invalid={touched.conceptUuid && !!errors.conceptUuid} invalidText={t2(errors.conceptUuid)}*/}
        {/*          name='conceptUuid' className='select-field' id="conceptUuid"*/}
        {/*          items={(conceptsList?.results ?? []) as any}*/}
        {/*          onChange={onConceptChanged}*/}
        {/*          onInputChange={handleConceptSearch}*/}
        {/*          initialSelectedItem={conceptsList?.results?.find(p => p.uuid === model.conceptUuid) ?? ""}*/}
        {/*          itemToString={item => item ? `${item.display}` : ""}*/}
        {/*          placeholder={t("stockmanagement.stockitem.edit.conceptholder")} />*/}
        <ControlledTextInput
          id="commonName"
          name="commonName"
          control={control}
          controllerName="commonName"
          maxLength={255}
          size={"md"}
          value={`${model?.commonName ?? ""}`}
          labelText={t("commonName", "Common name:")}
          invalid={!!errors.commonName}
          invalidText={errors.commonName && errors?.commonName?.message}
        />
        <ControlledTextInput
          id="acronym"
          maxLength={255}
          name="acronym"
          control={control}
          controllerName="acronym"
          size={"md"}
          labelText={t("abbreviation", "Abbreviation:")}
          invalid={!!errors.acronym}
          invalidText={errors.acronym && errors?.acronym?.message}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            justifyContent: "center",
          }}
        >
          <FormGroup
            className="clear-margin-bottom"
            legendText={t("hasExpiration", "Does the item expire?")}
            title={t("hasExpiration", "Does the item expire?")}
          >
            <ControlledRadioButtonGroup
              name="hasExpiration"
              controllerName="hasExpiration"
              control={control}
              legendText=""
              invalid={!!errors.hasExpiration}
              invalidText={
                errors.hasExpiration && errors?.hasExpiration?.message
              }
              onChange={(selection: boolean) => {
                setHasExpiration(selection);
              }}
            >
              <RadioButton
                value={true}
                id="hasExpiration-true"
                labelText={t("yes", "Yes")}
              />
              <RadioButton
                value={false}
                id="hasExpiration-false"
                labelText={t("no", "No")}
              />
            </ControlledRadioButtonGroup>
          </FormGroup>

          {hasExpiration && (
            <ControlledNumberInput
              id="expiryNotice"
              name="expiryNotice"
              control={control}
              controllerName="expiryNotice"
              size={"md"}
              allowEmpty={true}
              label={t("expiryNoticeDays", "Expiration Notice (days)")}
              invalid={!!errors.expiryNotice}
              invalidText={errors.expiryNotice && errors?.expiryNotice?.message}
            />
          )}
        </div>
        <PreferredVendorSelector
          name="preferredVendorUuid"
          controllerName="preferredVendorUuid"
          control={control}
          title={t("whoIsThePreferredVendor", "Who is the preferred vendor?")}
          placeholder={t("chooseVendor", "Choose vendor")}
          invalid={!!errors.preferredVendorUuid}
          invalidText={
            errors.preferredVendorUuid && errors?.preferredVendorUuid?.message
          }
        />
        <StockItemCategorySelector
          name="categoryUuid"
          controllerName="categoryUuid"
          control={control}
          title={t("category:", "Category:")}
          placeholder={t("chooseACategory", "Choose a category")}
          invalid={!!errors.categoryUuid}
          invalidText={errors.categoryUuid && errors?.categoryUuid?.message}
        />
        {isDrug && (
          <DispensingUnitSelector
            name="dispensingUnitUuid"
            controllerName="dispensingUnitUuid"
            control={control}
            title={t("dispensingUnit", "Dispensing Unit:")}
            placeholder={t("dispensingUnitHolder", "Choose a dispensing unit")}
            invalid={!!errors.dispensingUnitUuid}
            invalidText={
              errors.dispensingUnitUuid && errors?.dispensingUnitUuid?.message
            }
          />
        )}

        <div style={{ display: "flex", flexDirection: "row-reverse" }}>
          <Button
            name="save"
            type="button"
            className="submitButton"
            onClick={handleSubmit(handleSave)}
            kind="primary"
            renderIcon={Save}
          >
            {isSaving ? <InlineLoading /> : t("save", "Save")}
          </Button>
        </div>
      </form>
    );
  }
);

export default StockItemDetails;
