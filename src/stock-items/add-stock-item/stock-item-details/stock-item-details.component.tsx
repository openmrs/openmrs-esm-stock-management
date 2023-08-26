import React from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "@openmrs/esm-framework";
import {
  Column,
  ComboBox,
  Form,
  FormGroup,
  Grid,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  TextInput,
} from "@carbon/react";
import {
  useConceptById,
  useDrugs,
} from "../../../stock-lookups/stock-lookups.resource";
import { StockItemDTO } from "../../../core/api/types/stockItem/StockItem";
import { ResourceRepresentation } from "../../../core/api/api";
import { useStockSources } from "../../../stock-sources/stock-sources.resource";
import { StockSource } from "../../../core/api/types/stockOperation/StockSource";
import { STOCK_ITEM_CATEGORY_CONCEPT_ID } from "../../../constants";
import { Concept } from "../../../core/api/types/concept/Concept";
import styles from "./stock-item-details.scss";

interface StockItemDetailsProps {
  state?: string;
}

const StockItemDetails: React.FC<StockItemDetailsProps> = () => {
  const { t } = useTranslation();

  const { items: drugList } = useDrugs({
    v: ResourceRepresentation.Default,
  });

  const { items: stockSourceList, isLoading: stockSourceListIsLoading } =
    useStockSources({
      v: ResourceRepresentation.Default,
    });

  const { items: categories, isLoading: isFetchingCategories } = useConceptById(
    STOCK_ITEM_CATEGORY_CONCEPT_ID
  );

  const onHasExpirationChanged = (hasChanged: boolean) => {
    // TODO: Handle expiration change
  };
  const onPreferredVendorChange = (change: StockSource) => {
    // TODO: Handle stock source changed
  };
  const onDrugChanged = (data: { selectedItem: any }) => {
    // handle new drug
  };

  const onCategoryChange = (data: { selectedItem: Concept }) => {
    // TODO: Handle category change
  };
  // const handleDrugSearch = useMemo(
  //   () =>
  //     debounce((searchTerm) => {
  //       getDrugs({
  //         v: ResourceRepresentation.Default,
  //         q: searchTerm,
  //         startIndex: 0,
  //         limit: 10,
  //       } as any as DrugFilterCriteria);
  //     }, 300),
  //   [getDrugs]
  // );

  const model: StockItemDTO = {
    uuid: undefined,
    isDrug: undefined,
    drugUuid: undefined,
    drugName: undefined,
    conceptUuid: undefined,
    commonName: undefined,
    acronym: undefined,
    conceptName: undefined,
    hasExpiration: undefined,
    preferredVendorUuid: undefined,
    preferredVendorName: undefined,
    purchasePrice: undefined,
    purchasePriceUoMUuid: undefined,
    purchasePriceUoMName: undefined,
    dispensingUnitName: undefined,
    dispensingUnitUuid: undefined,
    dispensingUnitPackagingUoMUuid: undefined,
    dispensingUnitPackagingUoMName: undefined,
    defaultStockOperationsUoMUuid: undefined,
    defaultStockOperationsUoMName: undefined,
    reorderLevel: undefined,
    reorderLevelUoMUuid: undefined,
    reorderLevelUoMName: undefined,
    dateCreated: undefined,
    creatorGivenName: undefined,
    creatorFamilyName: undefined,
    voided: undefined,
    packagingUnits: undefined,
    permission: undefined,
    categoryUuid: undefined,
    categoryName: undefined,
    expiryNotice: undefined,
  };

  const locations = useLocations();

  return (
    <Form
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <FormGroup
        className={styles.section}
        legendText={t("stockmanagement.stockitem.edit.itemtype", "Item Type")}
        title={t("stockmanagement.stockitem.edit.itemtype", "Item Type")}
      >
        <RadioButtonGroup name="isDrug" legendText="">
          <RadioButton
            value="true"
            id="isDrug-true"
            labelText={t("stockmanagement.drug", "Drug")}
          />
          <RadioButton
            value="false"
            id="isDrug-false"
            labelText={t("stockmanagement.other", "Other")}
          />
        </RadioButtonGroup>
      </FormGroup>

      <ComboBox
        titleText={t("stockmanagement.pleasespecify", "Please specify:")}
        name="drugUuid"
        className="select-field"
        id="drugUuid"
        size={"md"}
        items={drugList?.results ? drugList?.results : []}
        onChange={onDrugChanged}
        initialSelectedItem={
          drugList?.results?.find((p) => p.uuid === model.drugUuid) ?? ""
        }
        itemToString={(item) =>
          item
            ? `${item.name}${item.concept ? ` (${item.concept.display})` : ""}`
            : ""
        }
        placeholder={t(
          "stockmanagement.stockitem.edit.drugholder",
          "Choose a drug"
        )}
      />
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
      />
      <Grid>
        <Column sm={6} lg={6} md={6}>
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
              defaultSelected={
                model.hasExpiration == null
                  ? ""
                  : model.hasExpiration.toString().toLowerCase()
              }
              legendText=""
              onChange={onHasExpirationChanged}
            >
              <RadioButton
                value="true"
                id="hasExpiration-true"
                labelText={t("stockmanagement.yes", "Yes")}
              />
              <RadioButton
                value="false"
                id="hasExpiration-false"
                labelText={t("stockmanagement.no", "No")}
              />
            </RadioButtonGroup>
          </FormGroup>
        </Column>
        <Column sm={6} lg={6} md={6}>
          {/*<TextInput*/}
          {/*  id="drugLbl"*/}
          {/*  value={t(*/}
          {/*    model.hasExpiration ? "stockmanagement.yes" : "stockmanagement.no"*/}
          {/*  )}*/}
          {/*  readOnly={true}*/}
          {/*  labelText={t("stockmanagement.stockitem.edit.hasexpiration")}*/}
          {/*/>*/}
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
          />
        </Column>
      </Grid>
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
          (stockSourceList?.results?.filter((x) => x.uuid != null) ?? []) as any
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
    </Form>
  );
};

export default StockItemDetails;
