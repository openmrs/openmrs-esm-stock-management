import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../../core/api/api";
import { formatDisplayDate } from "../../../core/utils/datetimeUtils";
import { DataTableSkeleton, Tile } from "@carbon/react";
import DataList from "../../../core/components/table/table.component";
import styles from "../../stock-items-table.scss";
import { useStockItemQuantitiesHook } from "./quantities.resource";

interface StockQuantitiesProps {
  onSubmit?: () => void;
  stockItemUuid: string;
}

const StockQuantities: React.FC<StockQuantitiesProps> = ({ stockItemUuid }) => {
  const { isLoading, items, totalCount, setCurrentPage, setStockItemUuid } =
    useStockItemQuantitiesHook(ResourceRepresentation.Default);
  const { t } = useTranslation();

  useEffect(() => {
    setStockItemUuid(stockItemUuid);
  }, [stockItemUuid, setStockItemUuid]);

  const tableHeaders = useMemo(
    () => [
      {
        key: "location",
        header: t("location", "Location"),
      },
      {
        key: "quantity",
        header: t("quantity", "Quantity"),
      },
      {
        key: "packaging",
        header: t("packagingUnit", "Packaging Unit"),
      },
    ],
    []
  );

  const tableRows = useMemo(() => {
    return items?.map((row, index) => ({
      ...row,
      id: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      key: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      uuid: `${row.partyUuid}${row.stockBatchUuid}${index}`,
      expires: formatDisplayDate(row?.expiration),
      location: row?.partyName,
      quantity: row?.quantity?.toLocaleString() ?? "",
      batch: row.batchNumber ?? "",
      packaging: row.quantityUoM ?? "",
    }));
  }, [items]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length > 0) {
    return (
      <DataList
        columns={tableHeaders}
        data={tableRows}
        totalItems={totalCount}
        goToPage={setCurrentPage}
        hasToolbar={false}
      />
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>
          {t("quantityToDisplay", "No quantity to display")}
        </p>
      </Tile>
    </div>
  );
};

export default StockQuantities;
