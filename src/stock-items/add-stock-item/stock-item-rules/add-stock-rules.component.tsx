import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Select,
  TextInput,
  SelectItem,
  FormGroup,
  Checkbox,
  CheckboxGroup,
} from "@carbon/react";
import React, { ChangeEvent, useCallback, useState, useEffect } from "react";
import styles from "./add-stock-rules.scss";
import {
  useRoles,
  useStockLocations,
  useStockTagLocations,
} from "../../../stock-lookups/stock-lookups.resource";
import { createOrUpdateStockRule } from "./stock-rules.resource";
import { StockRule } from "../../../core/api/types/stockItem/StockRule";
import { showNotification, showToast } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { closeOverlay } from "../../../core/components/overlay/hook";
import { ResourceRepresentation } from "../../../core/api/api";
import {
  StockItemInventoryFilter,
  useStockItemPackagingUOMs,
} from "../../stock-items.resource";
import {
  APP_STOCKMANAGEMENT_STOCKITEMS,
  DISPENSARY_LOCATION_TAG,
  MAIN_PHARMACY_LOCATION_TAG,
  MAIN_STORE_LOCATION_TAG,
} from "../../../constants";

interface AddStockRuleProps {
  model?: StockRule;
  stockItemUuid?: string;
}

const StockRulesAddOrUpdate: React.FC<AddStockRuleProps> = ({
  model,
  stockItemUuid,
}) => {
  const { t } = useTranslation();

  const [stockItemFilter, setStockItemFilter] =
    useState<StockItemInventoryFilter>({
      startIndex: 0,
      v: ResourceRepresentation.Default,
      q: null,
      totalCount: true,
    });

  useEffect(() => {
    setStockItemFilter({
      startIndex: 0,
      v: ResourceRepresentation.Default,
      totalCount: true,
      stockItemUuid: stockItemUuid,
    });
  }, [stockItemUuid]);

  const { items: dispensingUnits } = useStockItemPackagingUOMs(stockItemFilter);

  //locations
  // const {
  //   locations: { results: locations },
  // } = useStockLocations({ v: ResourceRepresentation.Default });

  const { stockLocations } = useStockTagLocations();

  console.info(stockLocations);

  //Roles
  const {
    items: rolesData,
    isError: rolesError,
    isLoading: loadingRoles,
  } = useRoles({ v: ResourceRepresentation.Default });

  const [formModel, setFormModel] = useState<StockRule>();

  useEffect(() => {
    if (model != null && Object.keys(model).length != 0) {
      // To prevent editing properties like date created
      const { dateCreated, creatorGivenName, creatorFamilyName, ...rest } =
        model;
      const tmpFormModel = { ...rest };
      setFormModel(tmpFormModel);
    }
  }, [model]);

  const onNameChanged = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    model ? (model.name = evt.target.value) : "";
    setFormModel({ ...formModel, name: evt.target.value });
  };

  const onQuantityChanged = (
    evt: React.ChangeEvent<HTMLInputElement>
  ): void => {
    model ? (model.quantity = Number(evt.target.value)) : "";
    setFormModel({ ...formModel, quantity: Number(evt.target.value) });
  };

  const onEvaluationFrequencyChanged = (
    evt: React.ChangeEvent<HTMLInputElement>
  ): void => {
    model ? (model.evaluationFrequency = Number(evt.target.value)) : "";
    setFormModel({
      ...formModel,
      evaluationFrequency: Number(evt.target.value),
    });
  };

  const onActionFrequencyChanged = (
    evt: React.ChangeEvent<HTMLInputElement>
  ): void => {
    model ? (model.actionFrequency = Number(evt.target.value)) : "";
    setFormModel({ ...formModel, actionFrequency: Number(evt.target.value) });
  };

  const onLocationChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const selectedLocation = stockLocations.find(
      (x) => x.id === evt.target.value
    );
    setFormModel({ ...formModel, locationUuid: selectedLocation.id });
  };

  const onQuantityUnitChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const selectedQuantityUnit = dispensingUnits?.results.find(
      (x) => x.uuid === evt.target.value
    );
    setFormModel({
      ...formModel,
      stockItemPackagingUOMUuid: selectedQuantityUnit.uuid,
    });
  };

  const onAlertRoleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const selectedAlertRole = rolesData?.results.find(
      (x) => x.display === evt.target.value
    );
    setFormModel({ ...formModel, alertRole: selectedAlertRole.display });
  };

  const onMailRoleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const selectedMailRole = rolesData?.results.find(
      (x) => x.display === evt.target.value
    );
    console.warn("Setting mail role to: ", selectedMailRole);
    setFormModel({ ...formModel, mailRole: selectedMailRole.display });
  };

  const onEnabledChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    const isEnabled = !formModel?.enabled;
    setFormModel({ ...formModel, enabled: isEnabled });
  };

  const onAppliesToChildrenChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    const enableDescendants = !formModel?.enableDescendants;
    setFormModel({ ...formModel, enableDescendants: enableDescendants });
  };

  const onFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (model) {
        formModel.uuid = model.uuid;
      }
      if (stockItemUuid) {
        formModel.stockItemUuid = stockItemUuid;
      }
      createOrUpdateStockRule(formModel)
        .then(
          () => {
            showToast({
              critical: true,
              title: t("addedRule", "Add Rule"),
              kind: "success",
              description: t(
                "stockruleaddedsuccessfully",
                "Stock Rule Added Successfully"
              ),
            });
            closeOverlay();
          },
          (error) => {
            showNotification({
              title: t(`errorAddingRule', 'error adding a rule`),
              kind: "error",
              critical: true,
              description: error?.message,
            });
          }
        )
        .catch();
    },
    [formModel, model, t]
  );

  return (
    <div>
      <Form onSubmit={onFormSubmit}>
        <ModalHeader />
        <ModalBody>
          <FormGroup>
            <section className={styles.section}>
              <section className={styles.section}>
                <Select
                  name="location"
                  className="select-field"
                  labelText={t("location", "Location")}
                  id="location"
                  value={formModel?.locationUuid ? formModel.locationUuid : ""}
                  onChange={onLocationChange}
                >
                  <SelectItem
                    disabled
                    hidden
                    value=""
                    text={t("chooseLocation", "Choose the location")}
                  />
                  {stockLocations?.map((location) => {
                    return (
                      <SelectItem
                        key={location.id}
                        value={location.id}
                        text={location.name}
                      />
                    );
                  })}
                </Select>
              </section>

              <section className={styles.section}>
                <TextInput
                  id="name"
                  type="text"
                  labelText={t("name", "Rule Name")}
                  size="md"
                  onChange={onNameChanged}
                  value={model?.name}
                  placeholder="e.g Panado Alert"
                />
              </section>

              <section className={styles.section}>
                <Select
                  name="quantityUnit"
                  className="select-field"
                  labelText={t("quantityUnit", "Quantity Unit")}
                  id="quantityUnit"
                  value={
                    formModel?.stockItemPackagingUOMUuid
                      ? formModel.stockItemPackagingUOMUuid
                      : ""
                  }
                  onChange={onQuantityUnitChange}
                >
                  <SelectItem
                    disabled
                    hidden
                    value=""
                    text={t(
                      "chooseQuantityUnit",
                      "Choose the Unit of Quantity"
                    )}
                  />
                  {dispensingUnits?.results.map((stockItemPackagingUOMUuid) => {
                    return (
                      <SelectItem
                        key={stockItemPackagingUOMUuid.uuid}
                        value={stockItemPackagingUOMUuid.uuid}
                        text={stockItemPackagingUOMUuid.packagingUomName}
                      />
                    );
                  })}
                </Select>
              </section>

              <section className={styles.section}>
                <TextInput
                  id="quantity"
                  type="number"
                  labelText={t("quantity", "Quantity Threshold")}
                  size="md"
                  onChange={onQuantityChanged}
                  value={model?.quantity}
                  placeholder="e.g 30 Boxes"
                />
              </section>
            </section>
          </FormGroup>

          <FormGroup>
            <section className={styles.section}>
              <Select
                name="alertRole"
                className="select-field"
                labelText={t("alertRole", "Alert Role")}
                id="alertRole"
                value={formModel?.alertRole ? formModel.alertRole : ""}
                onChange={onAlertRoleChange}
              >
                <SelectItem
                  disabled
                  hidden
                  value=""
                  text={t("chooseAlertRole", "Choose an Alert Role")}
                />
                {rolesData?.results?.map((alertRole) => {
                  return (
                    <SelectItem
                      key={alertRole.display}
                      value={alertRole.display}
                      text={alertRole.display}
                    />
                  );
                })}
              </Select>
            </section>
            <section className={styles.section}>
              <Select
                name="mailRole"
                className="select-field"
                labelText={t("mailRole", "Mail Role")}
                id="mailRole"
                value={formModel?.mailRole ? formModel.mailRole : ""}
                onChange={onMailRoleChange}
              >
                <SelectItem
                  disabled
                  hidden
                  value=""
                  text={t("chooseMailRole", "Choose a Mail Role")}
                />
                {rolesData?.results?.map((mailRole) => {
                  return (
                    <SelectItem
                      key={mailRole.display}
                      value={mailRole.display}
                      text={mailRole.display}
                    />
                  );
                })}
              </Select>
            </section>
            <section className={styles.section}>
              <TextInput
                id="evaluationFrequency"
                type="number"
                labelText={t(
                  "evaluationFrequency",
                  "Frequency Check (Minutes)"
                )}
                size="md"
                onChange={onEvaluationFrequencyChanged}
                value={model?.evaluationFrequency}
                placeholder="e.g 30 Minutes"
              />
              <TextInput
                id="actionFrequency"
                type="number"
                labelText={t(
                  "actionFrequency",
                  "Notification Frequency (Minutes)"
                )}
                size="md"
                onChange={onActionFrequencyChanged}
                value={model?.actionFrequency}
                placeholder="e.g 3600 Minutes"
              />
            </section>
          </FormGroup>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              justifyContent: "center",
            }}
          >
            <FormGroup className="clear-margin-bottom">
              <CheckboxGroup className={styles.checkboxGrid}>
                <Checkbox
                  onChange={onEnabledChanged}
                  checked={formModel?.enabled}
                  labelText={`Enabled ?`}
                  value={model?.enabled}
                  id="chk-ruleEnabled"
                />
              </CheckboxGroup>
            </FormGroup>
            <FormGroup className="clear-margin-bottom">
              <CheckboxGroup className={styles.checkboxGrid}>
                <Checkbox
                  onChange={onAppliesToChildrenChanged}
                  name="appliesToChildren"
                  checked={formModel?.enableDescendants}
                  value={model?.enableDescendants}
                  labelText={`Applies to child locations?`}
                  id="chk-ruleAppliesToChildren"
                />
              </CheckboxGroup>
            </FormGroup>
          </div>

          <div>
            This stock rule will be evaluated by checking if the stock
            quantities have lowered to the threshold or below and a notification
            will be sent to the personnel with the specified role in the given
            location. The notification will only be sent once per specified
            notification frequency.
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeOverlay}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit">{t("save", "Save")}</Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default StockRulesAddOrUpdate;
