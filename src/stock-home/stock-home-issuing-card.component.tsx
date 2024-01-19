import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layer, Tile, Button } from "@carbon/react";
import { navigate, useLayoutType } from "@openmrs/esm-framework";
import styles from "./stock-home-detail-card.scss";
import { ResourceRepresentation } from "../core/api/api";
import { DocumentImport, DeliveryTruck } from "@carbon/react/icons";
import { useStockIssuing } from "./stock-home-issuing.resource";

const StockHomeIssuingCard = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const { items, isLoading } = useStockIssuing({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  if (isLoading) return <></>;

  if (items.length === 0) {
    return (
      <>
        <p className={styles.content}>
          {t("issuingNull", "No issued to display")}
        </p>
      </>
    );
  }

  const itemsToDisplay = items.map((item, index) => {
    // Assuming you are using 'stockOperationItems' from each 'item'
    const stockItems = item?.stockOperationItems || [];

    // Assuming you are using some properties from 'stock' in your code
    const formattedStockItems = stockItems.map((stock, stockIndex) => ({
      status: item?.status,
      sourceName: item?.sourceName,
      destinationName: item?.destinationName,
      stockItemName: stock?.stockItemName,
      stockItemPackagingUOMName: stock?.stockItemPackagingUOMName,
      quantity: stock?.quantity,
      key: `${index}-${stockIndex}`, // Unique key for React
    }));

    return formattedStockItems;
  });

  const flattenedItemsToDisplay = itemsToDisplay.flat();

  return (
    <>
      {items.map((item, index) =>
        item?.stockOperationItems.map((stock) => (
          <div className={styles.card} key={index}>
            <div className={styles.colorLineGreen} />
            <div className={styles.icon}>
              <DocumentImport size={40} color={"#198038"} />
            </div>
            <div className={styles.cardText}>
              <p>
                {item?.status} · {item?.sourceName} · {item?.destinationName}
              </p>
              <p>
                <strong>{stock?.stockItemName}</strong>{" "}
                {stock?.stockItemPackagingUOMName}, {stock?.quantity}
              </p>
            </div>
          </div>
        ))
      )}
      <Button
        onClick={() => {
          navigate({
            to: `${window.getOpenmrsSpaBase()}stock-management/requisitions`,
          });
        }}
        kind="ghost"
      >
        View All
      </Button>
    </>
  );
};

export default StockHomeIssuingCard;
