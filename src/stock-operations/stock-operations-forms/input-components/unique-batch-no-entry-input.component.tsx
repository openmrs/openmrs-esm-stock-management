import { TextInput } from '@carbon/react';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { TextInputSkeleton } from '@carbon/react';
import { useStockItemBatchNumbers } from '../hooks/useStockItemBatchNumbers';
import { useTranslation } from 'react-i18next';

type UniqueBatchNoEntryInputProps = {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  stockItemUuid: string;
  stockOperationItemUuid: string;
};
const UniqueBatchNoEntryInput: React.FC<UniqueBatchNoEntryInputProps> = ({
  defaultValue,
  onValueChange,
  error,
  stockItemUuid,
  stockOperationItemUuid,
}) => {
  const { isLoading, stockItemBatchNos } = useStockItemBatchNumbers(stockItemUuid);
  const [value, setValue] = useState(defaultValue);
  const [_error, setError] = useState<string>();
  const { t } = useTranslation();
  const isNewItem = useMemo(() => stockOperationItemUuid.startsWith('new-item'), [stockOperationItemUuid]);
  const batchNoAlreadyUsed = useMemo(
    () => isNewItem && stockItemBatchNos?.findIndex((batchNo) => batchNo.batchNo === value) !== -1,
    [stockItemBatchNos, value, isNewItem],
  );

  useEffect(() => {
    if (defaultValue) setValue(defaultValue ?? '');
  }, [defaultValue]);

  useEffect(() => {
    if (batchNoAlreadyUsed) {
      setError(t('batchNumberAlreadyUsed', 'Batch number already used'));
    } else {
      setError(undefined);
      onValueChange?.(value);
    }
  }, [value, onValueChange, batchNoAlreadyUsed, setError, t]);

  if (isLoading) {
    return <TextInputSkeleton />;
  }
  return (
    <TextInput
      id="batchNumber"
      maxLength={50}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      value={value}
      invalidText={_error ?? error}
      invalid={Boolean(_error) || Boolean(error)}
      placeholder={t('batchNumber', 'Batch Number')}
      labelText={t('batchNumber', 'Batch Number')}
    />
  );
};

export default UniqueBatchNoEntryInput;
