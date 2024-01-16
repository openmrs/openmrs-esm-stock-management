import React, { createContext, useContext, useState } from "react";

type StockOperationShape = {
  formContext: Record<string, unknown>;
  setFormContext: (formValue) => void;
};

const StockOperationContext = createContext<StockOperationShape>(null);

export const useStockOperationContext = () => useContext(StockOperationContext);

export const StockOperation: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formContext, setFormContext] = useState<StockOperationShape>(null);
  const value = { formContext, setFormContext };
  return (
    <StockOperationContext.Provider value={value}>
      {children}
    </StockOperationContext.Provider>
  );
};
