import React from "react";
import { useTranslation } from "react-i18next";
import { InlineLoading } from "@carbon/react";
import { ErrorState } from "@openmrs/esm-framework";
import styles from "./stock-home.scss";
import MetricsCard from "../core/components/card/metrics-card-component";
import useStockList from "./useStockList";

import { StockOperationFilter } from "../stock-operations/stock-operations.resource";
import { useDisposalList } from "./useDisposalList";
import { ResourceRepresentation } from "../core/api/api";
import { useStockInventoryItems } from "./stock-home-inventory-items.resource";
import { useStockInventory } from "./stock-home-inventory-expiry.resource";

const StockManagementMetrics: React.FC = (filter: StockOperationFilter) => {
  const { t } = useTranslation();

  const { stockList: allStocks, isLoading, error } = useStockList();
  const { items: expiryItems, isLoading: inventoryLoading } =useStockInventory();
  const { items: stockItems } = useStockInventoryItems();
  console.log("stockItems", stockItems);
  console.log("allStocks", JSON.stringify(allStocks[0]));
  console.log("expiryItems", JSON.stringify(expiryItems[0]));


  const currentDate = new Date();
  const mergedArray = allStocks.map((stock) => {
    const matchingBatch = expiryItems.find(
      (batch) => batch.stockItemUuid === stock.uuid
    );
    return {
      ...stock,
      expiration: matchingBatch ? matchingBatch.expiration : null,
    };
  });
  console.log("mergedArray", mergedArray);

 const expiringStocks = mergedArray.filter((stock) => stock.hasExpiration);
  const stocksExpiringIn180Days = expiringStocks.filter((stock) => {
    const expirationDate = new Date(stock.expiration).getTime(); // Convert to number
    const differenceInDays = Math.ceil(
      (expirationDate - currentDate.getTime()) / (1000 * 60 * 60 * 24) // Convert to number
    );
    return differenceInDays <= 180 && differenceInDays >= 0;
  });

  const { items } = useDisposalList({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });

  if (isLoading) {
    return (
      <InlineLoading
        role="progressbar"
        description={t("loading", "Loading...")}
      />
    );
  }
  if (error) {
    return <ErrorState headerTitle={t("errorStockMetric")} error={error} />;
  }

  const sevenDaysExpiryStocks = allStocks.filter(
    (stock) => stock.hasExpiration && stock.ExpiryNotice <= 7
  );
  const thirtyDaysExpiryStocks = allStocks.filter(
    (stock) => stock.hasExpiration && stock.ExpiryNotice <= 30
  );

  const filteredItems =
    items &&
    items.filter(
      (item) =>
        item.reasonName === "Drug not available due to expired medication"
    );
  const filteredItemsPoorquality =
    items && items.filter((item) => item.reasonName === "Poor Quality");

  return (
    <>
      <div className={styles.cardContainer}>
        <MetricsCard
          label={t("stocks", "Expiring stock")}
          value={stocksExpiringIn180Days?.length || 0}
          headerLabel={t("expiringStock", "Expiring Stock")}
          view="items"
          count={{
            expiry6months: stocksExpiringIn180Days,
          }}
        />
        <MetricsCard
          label={t("outofstock", "Out of Stock")}
          value={allStocks?.length}
          headerLabel={t("highestServiceVolume", "Out of Stock ")}
          view="items"
          outofstockCount={{
            itemsbelowmin: sevenDaysExpiryStocks,
            itemsabovemax: thirtyDaysExpiryStocks,
          }}
        />
        <MetricsCard
          label={t("disposedstock", "Disposed Stock")}
          value={items?.length || 0}
          headerLabel={t("providersAvailableToday", "Disposed Stock ")}
          view="items"
          disposedCount={{
            expired: filteredItems,
            poorquality: filteredItemsPoorquality,
          }}
        />
      </div>
    </>
  );
};
export default StockManagementMetrics;
