import React, { ChangeEvent, forwardRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import addStockStyles from "../add-stock-item.scss";
import { Save } from "@carbon/react/icons";

import {
  Button,
  ComboBox,
  Form,
  FormGroup,
  Grid,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  TextInput,
} from "@carbon/react";
import { useConceptById } from "../../../stock-lookups/stock-lookups.resource";
import { StockItemDTO } from "../../../core/api/types/stockItem/StockItem";
import { ResourceRepresentation } from "../../../core/api/api";
import { useStockSources } from "../../../stock-sources/stock-sources.resource";
import { StockSource } from "../../../core/api/types/stockOperation/StockSource";
import { STOCK_ITEM_CATEGORY_CONCEPT_ID } from "../../../constants";
import { Concept } from "../../../core/api/types/concept/Concept";
import DrugSelector from "../drug-selector/drug-selector.component";
import DispensingUnitSelector from "../dispensing-unit-selector/dispensing-unit-selector.component";
import { Drug } from "../../../core/api/types/concept/Drug";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockItemDetailsSchema } from "../../validationSchema";

interface StockItemDetailsProps {
  model: StockItemDTO;
}

const StockItemDetails = forwardRef<never, StockItemDetailsProps>(
  ({ model }, ref) => {
    const { t } = useTranslation();
    const {
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: model,
      mode: "all",
      resolver: zodResolver(stockItemDetailsSchema),
    });

    const { items: stockSourceList, isLoading: stockSourceListIsLoading } =
      useStockSources({
        v: ResourceRepresentation.Default,
      });

    const { items: categories, isLoading: isFetchingCategories } =
      useConceptById(STOCK_ITEM_CATEGORY_CONCEPT_ID);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onPreferredVendorChange = (change: StockSource) => {};

    const onDrugChanged = (data: Drug) => {};

    const onDispensingUnitChange = (data: Concept) => {};

    const onExpiryNoticeChange = (data: ChangeEvent<HTMLInputElement>) => {};
    const handleSave = (model: StockItemDTO) => {
      // handle new drug
      alert(JSON.stringify(model));
    };

    const onError = (err) => {
      alert(err);
    };

    const onCategoryChange = (data: Concept) => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handleExpiration = (expiration: boolean) => {};

    const handleIsDrugChange = (isDrug: boolean) => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handleCommonNameChange = (e: ChangeEvent<HTMLInputElement>) => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handleAbbrChange = (e: ChangeEvent<HTMLInputElement>) => {};

    const [isDrug, setIsDrug] = useState<boolean | null>();
    const [hasExpiration, setHasExpiration] = useState<boolean | null>();

    return (
      <Form
        style={{
          display: "grid",
          gap: "1.5rem",
          paddingTop: "1rem",
        }}
        className={addStockStyles.formContainer}
      >
        <FormGroup
          className="clear-margin-bottom"
          legendText={t("stockmanagement.stockitem.edit.itemtype", "Item Type")}
          title={t("stockmanagement.stockitem.edit.itemtype", "Item Type")}
        >
          <Controller
            name="isDrug"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <RadioButtonGroup
                legendText=""
                defaultSelected={value}
                onChange={(e) => onChange(e)}
                ref={ref}
                invalid={!!errors.isDrug}
                invalidText={errors.isDrug && errors?.isDrug?.message}
              >
                <RadioButton
                  value={true}
                  id="isDrug-true"
                  labelText={t("stockmanagement.drug", "Drug")}
                />
                <RadioButton
                  value={false}
                  id="isDrug-false"
                  labelText={t("stockmanagement.other", "Other")}
                />
              </RadioButtonGroup>
            )}
          />
        </FormGroup>
        {isDrug && (
          <DrugSelector
            name="drugUuid"
            title={t("stockmanagement.pleasespecify", "Please specify:")}
            onDrugChanged={onDrugChanged}
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
        <TextInput
          id="commonName"
          maxLength={255}
          name="commonName"
          size={"md"}
          value={`${model?.commonName ?? ""}`}
          labelText={t(
            "stockmanagement.stockitem.edit.commonname",
            "Common name:"
          )}
          onChange={handleCommonNameChange}
          invalid={errors.commonName}
          invalidText={errors.commonName && errors?.commonName?.message}
        />
        <TextInput
          id="acronym"
          maxLength={255}
          name="acronym"
          size={"md"}
          value={`${model?.acronym ?? ""}`}
          labelText={t(
            "stockmanagement.stockitem.edit.abbreviation",
            "Abbreviation:"
          )}
          onChange={handleAbbrChange}
          invalid={errors.acronym}
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
            legendText={t(
              "stockmanagement.stockitem.edit.hasexpiration",
              "Does the item expire?"
            )}
            title={t(
              "stockmanagement.stockitem.edit.hasexpiration",
              "Does the item expire?"
            )}
          >
            <RadioButtonGroup
              name="hasExpiration"
              defaultSelected={model.hasExpiration}
              legendText=""
              onChange={handleExpiration}
              invalid={!!errors.hasExpiration}
              invalidText={
                errors.hasExpiration && errors?.hasExpiration?.message
              }
            >
              <RadioButton
                value={true}
                id="hasExpiration-true"
                labelText={t("stockmanagement.yes", "Yes")}
              />
              <RadioButton
                value={false}
                id="hasExpiration-false"
                labelText={t("stockmanagement.no", "No")}
              />
            </RadioButtonGroup>
          </FormGroup>

          {hasExpiration && (
            <NumberInput
              id="expiryNotice"
              name="expiryNotice"
              size={"md"}
              allowEmpty={true}
              value={model.expiryNotice ?? ""}
              label={t(
                "stockmanagement.stockitem.edit.expirynotice",
                "Expiration Notice (days)"
              )}
              onChange={onExpiryNoticeChange}
              invalid={!!errors.expiryNotice}
              invalidText={errors.expiryNotice && errors?.expiryNotice?.message}
            />
          )}
        </div>
        <ComboBox
          titleText={t(
            "stockmanagement.stockitem.edit.preferredvendor",
            "Who is the preferred vendor?"
          )}
          name="preferredVendorUuid"
          size={"md"}
          className="select-field"
          id="preferredVendorUuid"
          items={
            (stockSourceList?.results?.filter((x) => x.uuid != null) ??
              []) as any
          }
          onChange={onPreferredVendorChange}
          initialSelectedItem={stockSourceList?.results?.find(
            (p) => p.uuid === model.preferredVendorUuid
          )}
          itemToString={(item) => (item ? `${item?.name}` : "")}
          shouldFilterItem={(data) => true}
          placeholder={t(
            "stockmanagement.stockitem.edit.vendorholder",
            "Choose vendor"
          )}
        />
        <ComboBox
          titleText={t("stockmanagement.stockitem.edit.category", "Category:")}
          name="categoryUuid"
          size={"md"}
          className="select-field"
          id="categoryUuid"
          items={
            ((categories?.answers && categories?.answers.length > 0
              ? categories?.answers
              : categories?.setMembers) as any) ?? []
          }
          onChange={onCategoryChange}
          initialSelectedItem={
            (categories?.answers && categories?.answers.length > 0
              ? categories?.answers
              : categories?.setMembers
            )?.find((p) => p.uuid === model.categoryUuid) ?? ({} as any)
          }
          itemToString={(item) =>
            item && item?.display ? `${item?.display}` : ""
          }
          shouldFilterItem={(data) => true}
          placeholder={t(
            "stockmanagement.stockitem.edit.categoryholder",
            "Choose a category"
          )}
        />
        {isDrug && (
          <DispensingUnitSelector
            onDispensingUnitChange={onDispensingUnitChange}
            title={t(
              "stockmanagement.stockitem.edit.dispensingunit",
              "Dispensing Unit:"
            )}
            placeholder={t(
              "stockmanagement.stockitem.edit.dispensingunitholder",
              "Choose a dispensing unit"
            )}
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
            onClick={() => {
              handleSubmit(handleSave, onError);
            }}
            kind="primary"
            renderIcon={Save}
          >
            {t("stockmanagement.save", "Save")}
          </Button>
          {/*<Button*/}
          {/*  type="button"*/}
          {/*  className="cancelButton"*/}
          {/*  kind="tertiary"*/}
          {/*  onClick={actions.onGoBack}*/}
          {/*  renderIcon={Undo24}*/}
          {/*>*/}
          {/*  {t("stockmanagement.goback", "Go Back")}*/}
          {/*</Button>*/}
        </div>
      </Form>
    );
  }
);

export default StockItemDetails;
