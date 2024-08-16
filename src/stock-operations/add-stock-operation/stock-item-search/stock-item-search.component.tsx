import React, { useEffect, useState } from "react";
import { Search, Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@openmrs/esm-framework";
import { useStockItems } from "../../stock-item-selector/stock-item-selector.resource";
import { useFormContext, type UseFieldArrayReturn } from "react-hook-form";
import { StockOperationItemDTO } from "../../../core/api/types/stockOperation/StockOperationItemDTO";
import { getStockOperationUniqueId } from "../../stock-operation.utils";
import styles from "./stock-item-search.scss";
import { ClickableTile } from "@carbon/react";

type StockItemSearchProps = UseFieldArrayReturn<
  {
    stockItems: StockOperationItemDTO[];
  },
  "stockItems",
  "id"
> & {};

const StockItemSearch: React.FC<StockItemSearchProps> = ({
  append,
  fields,
}) => {
  const { t } = useTranslation();
  const { isLoading, stockItemsList, setSearchString } = useStockItems({});
  const [searchTerm, setSearchTerm] = useState("");
  const { setValue, getValues } = useFormContext();
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    if (debouncedSearchTerm?.length !== 0) {
      setSearchString(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleOnSearchResultClick = (stockItem) => {
    const itemId = `new-item-${getStockOperationUniqueId()}`;
    append({
      ...stockItem,
      uuid: itemId,
      id: itemId,
      stockItemUuid: stockItem.uuid,
      stockItemName: stockItem.commonName,
    });
    setSearchTerm("");
    setValue(`stockItems[${fields.length}].stockItemUuid`, stockItem.uuid);
  };
  return (
    <div className={styles.stockItemSearchContainer}>
      <div style={{ display: "flex" }}>
        <Search
          size="lg"
          placeholder="Find your items"
          labelText="Search"
          closeButtonLabelText="Clear search input"
          value={searchTerm}
          id="search-1"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {searchTerm && stockItemsList?.length > 0 && (
        <div className={styles.searchResults}>
          {stockItemsList?.slice(0, 10).map((stockItem) => (
            <ClickableTile
              onClick={() => handleOnSearchResultClick(stockItem)}
              key={stockItem?.uuid}
            >
              {stockItem?.commonName}
            </ClickableTile>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockItemSearch;