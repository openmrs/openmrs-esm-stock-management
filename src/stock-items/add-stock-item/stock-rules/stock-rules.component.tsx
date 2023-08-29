import React from "react";
import addStockStyles from "../add-stock-item.scss";

interface StockRulesProps {
  onSubmit?: () => void;
}

const StockRules: React.FC<StockRulesProps> = () => {
  return (
    <div className={addStockStyles.formContainer}>
      Stock rules Coming soon ...
    </div>
  );
};

export default StockRules;
