import { TextInput } from '@carbon/react';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useStockItemBatchNos } from './batch-no-selector.resource';
import { TextInputSkeleton } from '@carbon/react';

type UniqueBatchNoEntryInputProps = {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  stockItemUuid: string;
};
const UniqueBatchNoEntryInput: React.FC<UniqueBatchNoEntryInputProps> = ({
  defaultValue,
  onValueChange,
  error,
  stockItemUuid,
}) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNos(stockItemUuid);
  const [value, setValue] = useState(defaultValue);
  const [_error, setError] = useState<string>();

  const batchNoAlreadyUsed = useMemo(
    () => stockItemBatchNos?.findIndex((batchNo) => batchNo.batchNo === value) !== -1,
    [stockItemBatchNos, value],
  );

  useEffect(() => {
    if (defaultValue) setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (batchNoAlreadyUsed) {
      setError('Batch number already used');
    } else {
      setError(undefined);
      onValueChange?.(value);
    }
  }, [value, onValueChange, batchNoAlreadyUsed, setError]);

  if (isLoading) return <TextInputSkeleton />;

  return (
    <TextInput
      size="sm"
      maxLength={50}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      value={value}
      invalidText={_error ?? error}
      invalid={_error ?? error}
    />
  );
};

export default UniqueBatchNoEntryInput;
