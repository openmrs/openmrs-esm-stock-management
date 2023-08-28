import React from "react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { InitializeResult } from "./types";

interface StockOperationSubmissionProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
}

const StockOperationSubmission: React.FC<
  StockOperationSubmissionProps
> = () => {
  const { t } = useTranslation();

  return <p>Submission</p>;
};

export default StockOperationSubmission;
