import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layer, Tile, Button } from "@carbon/react";
import { navigate, useLayoutType } from "@openmrs/esm-framework";
import styles from "./stock-home-detail-card.scss";
import { WarningHex, Warning } from "@carbon/react/icons";
import { ResourceRepresentation } from "../core/api/api";
import { useStockInventory } from "./stock-home-inventory-expiry.resource";
import { useStockInventoryItems } from "./stock-home-inventory-items.resource";

const StockHomeInventoryCard = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  // TODO: Pull low on stock
  const { items: expiryItems, isLoading: inventoryLoading } =
    useStockInventory();
  const { items: stockItems, isLoading } = useStockInventoryItems();

  if (isLoading) return <></>;

  if (stockItems?.length === 0) {
    return (
      <>
        <p className={styles.content}>
          {t("inventoryAlertNull", "No inventory alerts to display")}
        </p>
      </>
    );
  }

  const currentDate: any = new Date();
  let mergedArray: any[] = expiryItems.map((batch) => {
    const matchingItem = stockItems?.find(
      (item2) => batch?.stockItemUuid === item2.uuid
    );
    return { ...batch, ...matchingItem };
  });
  mergedArray = mergedArray.filter((item) => item.hasExpiration);
  const filteredData = mergedArray.filter((item) => {
    const expiryNotice = item.expiryNotice || 0; // Default to 0 if expiryNotice is undefined or null
    const expirationDate: any = new Date(item.expiration);
    const differenceInDays = Math.ceil(
      (expirationDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    // Include items that have not expired yet or are within the expiry notice period
    return differenceInDays <= expiryNotice || differenceInDays < 0;
  });

  return (
    <>
      {filteredData.map((item, index) => (
        <div className={styles.card} key={index}>
          <div className={styles.colorLineRed} />
          <div className={styles.icon}>
            <WarningHex size={40} color={"#DA1E28"} />
          </div>
          <div className={styles.cardText}>
            <p>EXPIRING STOCK</p>
            <p>
              <strong>{item?.drugName}</strong> {item?.dispensingUnitName}
            </p>
          </div>
        </div>
      ))}
      <Button
        onClick={() => {
          navigate({
            to: `${window.getOpenmrsSpaBase()}stock-management/expired-stock`,
          });
        }}
        kind="ghost"
      >
        View All
      </Button>
    </>
  );
};

export default StockHomeInventoryCard;
