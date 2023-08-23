import React, { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import addStockStyles from "../add-stock-item.scss";
import { Save } from "@carbon/react/icons";

import { Button, FormGroup, RadioButton } from "@carbon/react";
import { useConceptById } from "../../../stock-lookups/stock-lookups.resource";
import { StockItemDTO } from "../../../core/api/types/stockItem/StockItem";
import { ResourceRepresentation } from "../../../core/api/api";
import { useStockSources } from "../../../stock-sources/stock-sources.resource";
import { STOCK_ITEM_CATEGORY_CONCEPT_ID } from "../../../constants";
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

interface StockItemDetailsProps {
  model: StockItemDTO;
}

const StockItemDetails = forwardRef<never, StockItemDetailsProps>(
  ({ model }, ref) => {
    const { t } = useTranslation();
    const {
      handleSubmit,
      control,
      formState: { errors },
    } = useForm<StockItemFormData>({
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

    // // eslint-disable-next-line @typescript-eslint/no-empty-function
    // const onPreferredVendorChange = (change: StockSource) => {};
    //
    // const onDrugChanged = (data: Drug) => {};
    //
    // const onDispensingUnitChange = (data: Concept) => {};
    //
    // const onExpiryNoticeChange = (data: ChangeEvent<HTMLInputElement>) => {};
    const handleSave = (model: StockItemDTO) => {
      // handle new drug
      alert(JSON.stringify(model));
    };

    const onError = (err) => {
      alert(JSON.stringify(err));
    };

    // const onCategoryChange = (data: Concept) => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // const handleExpiration = (expiration: boolean) => {};
    //
    // const handleIsDrugChange = (isDrug: boolean) => {};
    //
    // // eslint-disable-next-line @typescript-eslint/no-empty-function
    // const handleCommonNameChange = (e: ChangeEvent<HTMLInputElement>) => {};
    //
    // // eslint-disable-next-line @typescript-eslint/no-empty-function
    // const handleAbbrChange = (e: ChangeEvent<HTMLInputElement>) => {};

    const [isDrug, setIsDrug] = useState<boolean | null>();
    const [hasExpiration, setHasExpiration] = useState<boolean | null>();

    return (
      <form
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
          <ControlledRadioButtonGroup
            control={control}
            controllerName="isDrug"
            legendText=""
            invalid={!!errors.isDrug}
            invalidText={errors.isDrug && errors?.isDrug?.message}
            name="isDrug"
          >
            <RadioButton value={true} id="isDrug-true" labelText="Drug" />
            <RadioButton value={false} id="isDrug-false" labelText="Other" />
          </ControlledRadioButtonGroup>
        </FormGroup>
        {isDrug && (
          <DrugSelector
            name="drugUuid"
            title={t("stockmanagement.pleasespecify", "Please specify:")}
            onDrugChanged={(e) => {
              //
            }}
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
        {/*<TextInput*/}
        {/*  id="commonName"*/}
        {/*  maxLength={255}*/}
        {/*  name="commonName"*/}
        {/*  size={"md"}*/}
        {/*  value={`${model?.commonName ?? ""}`}*/}
        {/*  labelText={t(*/}
        {/*    "stockmanagement.stockitem.edit.commonname",*/}
        {/*    "Common name:"*/}
        {/*  )}*/}
        {/*  onChange={handleCommonNameChange}*/}
        {/*  invalid={errors.commonName}*/}
        {/*  invalidText={errors.commonName && errors?.commonName?.message}*/}
        {/*/>*/}
        <ControlledTextInput
          id="acronym1"
          maxLength={255}
          name="acronym2"
          control={control}
          controllerName="acronym"
          size={"md"}
          labelText={t(
            "stockmanagement.stockitem.edit.abbreviation",
            "Abbreviation:"
          )}
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
            legendText={t(
              "stockmanagement.stockitem.edit.hasexpiration",
              "Does the item expire?"
            )}
            title={t(
              "stockmanagement.stockitem.edit.hasexpiration",
              "Does the item expire?"
            )}
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
              label={t(
                "stockmanagement.stockitem.edit.expirynotice",
                "Expiration Notice (days)"
              )}
              invalid={!!errors.expiryNotice}
              invalidText={errors.expiryNotice && errors?.expiryNotice?.message}
            />
          )}
        </div>
        {/*<ControlledComboBox*/}
        {/*  id="preferredVendorUuid"*/}
        {/*  name="preferredVendorUuid"*/}
        {/*  control={control}*/}
        {/*  controllerName="preferredVendorUuid"*/}
        {/*  titleText={t(*/}
        {/*    "stockmanagement.stockitem.edit.preferredvendor",*/}
        {/*    "Who is the preferred vendor?"*/}
        {/*  )}*/}
        {/*  size={"md"}*/}
        {/*  className="select-field"*/}
        {/*  items={*/}
        {/*    (stockSourceList?.results?.filter((x) => x.uuid != null) ??*/}
        {/*      []) as any*/}
        {/*  }*/}
        {/*  initialSelectedItem={stockSourceList?.results?.find(*/}
        {/*    (p) => p.uuid === model.preferredVendorUuid*/}
        {/*  )}*/}
        {/*  itemToString={(item) => (item ? `${item?.name}` : "")}*/}
        {/*  shouldFilterItem={(data) => true}*/}
        {/*  placeholder="Choose vendor"*/}
        {/*  onChange={(e) => {*/}
        {/*    //*/}
        {/*  }}*/}
        {/*/>*/}
        {/*<ComboBox*/}
        {/*  titleText={t("stockmanagement.stockitem.edit.category", "Category:")}*/}
        {/*  name="categoryUuid"*/}
        {/*  size={"md"}*/}
        {/*  className="select-field"*/}
        {/*  id="categoryUuid"*/}
        {/*  items={*/}
        {/*    ((categories?.answers && categories?.answers.length > 0*/}
        {/*      ? categories?.answers*/}
        {/*      : categories?.setMembers) as any) ?? []*/}
        {/*  }*/}
        {/*  onChange={onCategoryChange}*/}
        {/*  initialSelectedItem={*/}
        {/*    (categories?.answers && categories?.answers.length > 0*/}
        {/*      ? categories?.answers*/}
        {/*      : categories?.setMembers*/}
        {/*    )?.find((p) => p.uuid === model.categoryUuid) ?? ({} as any)*/}
        {/*  }*/}
        {/*  itemToString={(item) =>*/}
        {/*    item && item?.display ? `${item?.display}` : ""*/}
        {/*  }*/}
        {/*  shouldFilterItem={(data) => true}*/}
        {/*  placeholder={t(*/}
        {/*    "stockmanagement.stockitem.edit.categoryholder",*/}
        {/*    "Choose a category"*/}
        {/*  )}*/}
        {/*/>*/}
        {/*{isDrug && (*/}
        {/*  <DispensingUnitSelector*/}
        {/*    onDispensingUnitChange={onDispensingUnitChange}*/}
        {/*    title={t(*/}
        {/*      "stockmanagement.stockitem.edit.dispensingunit",*/}
        {/*      "Dispensing Unit:"*/}
        {/*    )}*/}
        {/*    placeholder={t(*/}
        {/*      "stockmanagement.stockitem.edit.dispensingunitholder",*/}
        {/*      "Choose a dispensing unit"*/}
        {/*    )}*/}
        {/*    invalid={!!errors.dispensingUnitUuid}*/}
        {/*    invalidText={*/}
        {/*      errors.dispensingUnitUuid && errors?.dispensingUnitUuid?.message*/}
        {/*    }*/}
        {/*  />*/}
        {/*)}*/}

        <div style={{ display: "flex", flexDirection: "row-reverse" }}>
          <Button
            name="save"
            type="button"
            className="submitButton"
            onClick={handleSubmit(handleSave, onError)}
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
      </form>
    );
  }
);

export default StockItemDetails;
