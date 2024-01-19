import React from "react";
import { useTranslation } from "react-i18next";
import { InlineLoading } from "@carbon/react";
import { ErrorState, formatDate, parseDate } from "@openmrs/esm-framework";
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

  const { items: expiryItems, isLoading: inventoryLoading } =
    useStockInventory();
  const { items: stockItems } = useStockInventoryItems();

  const currentDate: any = new Date();
  let mergedArray: any[] = expiryItems.map((batch) => {
    const matchingItem = stockItems.find(
      (item2) => batch?.stockItemUuid === item2.uuid
    );
    return { ...batch, ...matchingItem };
  });
  mergedArray = mergedArray.filter((item) => item.hasExpiration);
  const filteredData = mergedArray.filter((item) => {
    const expiryNotice = item.expiryNotice || 0;
    const expirationDate: any = new Date(item.expiration);
    const differenceInDays = Math.ceil(
      (expirationDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    return differenceInDays <= expiryNotice || differenceInDays < 0;
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
          value={filteredData?.length || 0}
          headerLabel={t("expiringStock", "Expiring Stock")}
          view="items"
          count={{
            expiry7days: sevenDaysExpiryStocks,
            expiry30days: thirtyDaysExpiryStocks,
          }}
        />
        <MetricsCard
          label={t("outofstock", "Out of Stock")}
          value={allStocks.length}
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
