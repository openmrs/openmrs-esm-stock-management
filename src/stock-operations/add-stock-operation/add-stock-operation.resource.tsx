import { useEffect, useState } from 'react';
import { initializeNewStockOperation } from './add-stock-operation.utils';
import { AddStockOperationProps, InitializeResult } from './types';

export const useInitializeStockOperations = (props: AddStockOperationProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [result, setResult] = useState<InitializeResult>();

  useEffect(() => {
    setIsLoading(true);
    initializeNewStockOperation(props.operation, props.model, props.operations)
      .then((data) => {
        setResult(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
      });
  }, [props.model, props.operation, props.operations]);

  return {
    isLoading,
    isError,
    result,
  };
};
