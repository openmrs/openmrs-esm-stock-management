import React from "react";
import { useTranslation } from "react-i18next";
import { useLayoutType } from "@openmrs/esm-framework";
import StockHomeInventoryCard from "./stock-home-inventory-card.component";
import StockHomeReceivingCard from "./stock-home-receiving-card.component";
import StockHomeIssuingCard from "./stock-home-issuing-card.component";
import { Layer, Tile } from "@carbon/react";
import styles from "./stock-home-detail-card.scss";

const StockHomeDetailCards = () => {
  const isTablet = useLayoutType() === "tablet";
  const { t } = useTranslation();

  return (
    <div className={styles.cardContainer}>
      <div className={styles.tilesContainer}>
        <Layer>
          <Tile>
            <div
              className={
                isTablet ? styles.tabletHeading : styles.desktopHeading
              }
            >
              <h4>{t("Inventory Alerts")}</h4>
            </div>
            <StockHomeInventoryCard />
          </Tile>
        </Layer>
      </div>
      <div className={styles.tilesContainer}>
        <Layer>
          <Tile>
            <div
              className={
                isTablet ? styles.tabletHeading : styles.desktopHeading
              }
            >
              <h4>{t("Receiving")}</h4>
            </div>
            <StockHomeReceivingCard />
          </Tile>
        </Layer>
      </div>
      <div className={styles.tilesContainer}>
        <Layer>
          <Tile>
            <div
              className={
                isTablet ? styles.tabletHeading : styles.desktopHeading
              }
            >
              <h4>{t("Issuing")}</h4>
            </div>
            <StockHomeIssuingCard />
          </Tile>
        </Layer>
      </div>
    </div>
  );
};

export default StockHomeDetailCards;
