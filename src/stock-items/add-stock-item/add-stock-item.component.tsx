import React, { useState } from "react";
import { Column, Grid, ProgressIndicator, ProgressStep } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { useLocations } from "@openmrs/esm-framework";
import StockItemDetails from "./stock-item-details/stock-item-details.component";
import rootStyles from "../../root.scss";

interface AddStockItemProps {
  state?: string;
}

const AddStockItem: React.FC<AddStockItemProps> = () => {
  const { t } = useTranslation();

  const locations = useLocations();

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <Grid fullWith className={rootStyles.noSpacing}>
      {/*<Row>*/}
      <Column sm={4} md={4} lg={4} className={rootStyles.noSpacing}>
        <ProgressIndicator
          currentIndex={currentIndex}
          vertical
          onChange={(e: number) => setCurrentIndex(e)}
        >
          <ProgressStep label="Stock Item Details" />
          <ProgressStep label="Packaging Units" />
          <ProgressStep label="Transactions" />
          <ProgressStep label="Batch Information" />
          <ProgressStep label="Quantities" />
          <ProgressStep label="Stock Rules" />
        </ProgressIndicator>
      </Column>
      <Column sm={12} md={12} lg={12} className={rootStyles.noSpacing}>
        <StockItemDetails />
      </Column>
      {/*</Row>*/}
    </Grid>
  );
};

export default AddStockItem;
