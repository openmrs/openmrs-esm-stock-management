import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layer, Tile, Button } from "@carbon/react";
import { useLayoutType } from "@openmrs/esm-framework";
import styles from "./stock-home-detail-card.scss";
import { DeliveryTruck, Warning } from "@carbon/react/icons";
import { ResourceRepresentation } from "../core/api/api";
import { useStockInventory } from "./stock-home-inventory.resource";

interface StockHomeDetailCardProps {
  title: string;
}
const StockHomeInventoryCard: React.FC<StockHomeDetailCardProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const { items, isLoading } = useStockInventory({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  if (isLoading) return <></>;

  if (items.length === 0) {
    return (
      <Layer className={styles.emptyStateContainer}>
        <Tile className={styles.tile}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{title}</h4>
          </div>
          <p className={styles.content}>
            {t("inventoryAlertNull", "No inventory alerts to display")}
          </p>
          <Button onClick={() => console.log("testing CLick")} kind="ghost">
            {t("inventoryAlertView", "View inventory alerts")}
          </Button>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.billHistoryContainer}>
      <Layer>
        <Tile>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{title}</h4>
          </div>
          {items.map((item, index) =>
            item?.stockOperationItems.map((stock) => (
              <div className={styles.card} key={index}>
                <div className={styles.colorLineOrange} />
                <div className={styles.icon}>
                  <Warning size={40} color={"#FF832B"} />
                </div>
                <div className={styles.cardText}>
                  <p>
                    {item?.status} · {item?.sourceName} ·{" "}
                    {item?.destinationName}
                  </p>
                  <p>
                    <strong>{stock?.stockItemName}</strong>{" "}
                    {stock?.stockItemPackagingUOMName}, {stock?.quantity}
                  </p>
                </div>
              </div>
            ))
          )}
          <Button onClick={() => console.log("testing CLick")} kind="ghost">
            {t("inventoryView", "View All")}
          </Button>
        </Tile>
      </Layer>
    </div>
  );
};

export default StockHomeInventoryCard;
