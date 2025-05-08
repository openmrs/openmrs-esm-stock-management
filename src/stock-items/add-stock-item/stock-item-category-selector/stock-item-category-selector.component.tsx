import React, { type ReactNode } from 'react';
import { type Control, Controller, type FieldValues } from 'react-hook-form';
import { type Concept } from '../../../core/api/types/concept/Concept';
import { ComboBox, TextInputSkeleton } from '@carbon/react';
import { useConcept } from '../../../stock-lookups/stock-lookups.resource';
import { type ConfigObject } from '../../../config-schema';
import { useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface StockItemCategorySelectorProps<T> {
  categoryUuid?: string;
  onCategoryUuidChange?: (unit: Concept) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  itemType?: string;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const StockItemCategorySelector = <T,>(props: StockItemCategorySelectorProps<T>) => {
  const { t } = useTranslation();

  const { stockItemCategoryUUID } = useConfig<ConfigObject>();
  const {
    items: { answers: categories },
    isLoading,
  } = useConcept(stockItemCategoryUUID);

  const filteredCategories = props.itemType ? categories?.filter((c) => c.display === props?.itemType) : categories;

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={'md'}
          items={filteredCategories || []}
          onChange={(data: { selectedItem: Concept }) => {
            props.onCategoryUuidChange?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          initialSelectedItem={categories?.find((p) => p.uuid === props.categoryUuid) || {}}
          itemToString={(item?: Concept) => (item && item?.display ? `${t(item?.display)}` : '')}
          shouldFilterItem={() => true}
          value={t(categories?.find((p) => p.uuid === value)?.display) ?? ''}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default StockItemCategorySelector;
