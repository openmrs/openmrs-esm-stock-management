import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Layer,
  Tile,
  Button,
} from "@carbon/react";
import {
  isDesktop,
  useLayoutType
} from "@openmrs/esm-framework";
import styles from "./stock-home-detail-card.scss";
import { Delivery, DeliveryTruck } from "@carbon/react/icons";
import { ResourceRepresentation } from "../core/api/api";
import { useStockReceiving } from "./stock-home-receiving.resource";

interface StockHomeReceivingCardProps {
  title: string;
}
const StockHomeReceivingCard: React.FC<StockHomeReceivingCardProps> = ({
  title,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const {
    items,
    isLoading,
  } = useStockReceiving({
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
            {t("receivedNull", "No received to display")}
          </p>
          <Button onClick={() => console.log("testing CLick")} kind="ghost">
            {t("receivedView", "View All")}
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
                <div className={styles.colorLineBlue} />
                <div className={styles.icon}>
                  <Delivery size={40} color={"#0F62FE"} />
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
            {t("receivedView", "View All")}
          </Button>
        </Tile>
      </Layer>
    </div>
  );
};

export default StockHomeReceivingCard;
