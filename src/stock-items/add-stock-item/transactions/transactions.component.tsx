import React from "react";
import { useTranslation } from "react-i18next";
import addStockStyles from "../add-stock-item.scss";

interface TransactionsProps {
  onSubmit?: () => void;
}

const Transactions: React.FC<TransactionsProps> = () => {
  const { t } = useTranslation();

  return (
    <div className={addStockStyles.formContainer}>
      Transactions Coming soon ...
    </div>
  );
};

export default Transactions;
