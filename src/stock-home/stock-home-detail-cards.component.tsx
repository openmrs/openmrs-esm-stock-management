import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isDesktop,
  useLayoutType
} from "@openmrs/esm-framework";
import StockHomeInventoryCard from "./stock-home-inventory-card.component";
import StockHomeReceivingCard from "./stock-home-receiving-card.component";
import StockHomeIssuingCard from "./stock-home-issuing-card.component";
import { Column, Grid } from "@carbon/react";
import styles from "./stock-home-detail-card.scss";

const StockHomeDetailCards = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [alerts, setAlerts] = useState([]);

  return (
    <div className={styles.cardContainer}>
      <StockHomeInventoryCard title={"Inventory Alerts"} />
      <StockHomeReceivingCard title={"Receiving"} />
      <StockHomeIssuingCard title={"Issuing"} />
    </div>
  );
};

export default StockHomeDetailCards;
