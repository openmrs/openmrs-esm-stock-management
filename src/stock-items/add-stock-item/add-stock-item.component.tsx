import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StockItemDetails from './stock-item-details/stock-item-details.component';
import StockItemRules from './stock-item-rules/stock-item-rules.component';
import { type TabItem } from '../../core/components/tabs/types';
import PackagingUnits from './packaging-units/packaging-units.component';
import Transactions from './transactions/transactions.component';
import BatchInformation from './batch-information/batch-information.component';
import StockQuantities from './quantities/quantities.component';
import VerticalTabs from '../../core/components/tabs/vertical-tabs.component';
import { type StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import { type SaveStockItem } from '../types';
import StockReferences from './stock-item-references/stock-item-references.component';

interface AddStockItemProps {
  isEditing?: boolean;
  model?: StockItemDTO;
  onSave?: SaveStockItem;
}

const AddEditStockItem: React.FC<AddStockItemProps> = ({ isEditing, model, onSave }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };
  const tabs: TabItem[] = [
    {
      name: t('stockItemDetails', 'Stock Item Details'),
      component: (
        <StockItemDetails handleTabChange={handleTabChange} model={model} onSave={onSave} isEditing={isEditing} />
      ),
    },
    {
      name: t('packagingUnits', 'Packaging Units'),
      component: <PackagingUnits isEditing handleTabChange={handleTabChange} stockItemUuid={model.uuid} />,
      disabled: !isEditing,
    },
    {
      name: t('transactions', 'Transactions'),
      component: <Transactions stockItemUuid={model.uuid} />,
      disabled: !isEditing,
    },
    {
      name: t('batchInformation', 'Batch Information'),
      component: <BatchInformation stockItemUuid={model.uuid} />,
      disabled: !isEditing,
    },
    {
      name: t('quantities', 'Quantities'),
      component: <StockQuantities stockItemUuid={model.uuid} />,
      disabled: !isEditing,
    },
    {
      name: t('stockRules', 'Rules'),
      component: <StockItemRules stockItemUuid={model.uuid} />,
      disabled: !isEditing,
    },
    {
      name: t('references', 'References'),
      component: <StockReferences stockItemUuid={model.uuid} isEditing={isEditing} />,
      disabled: !isEditing,
    },
  ];

  return <VerticalTabs onChange={handleTabChange} tabs={tabs} selectedIndex={selectedTab} />;
};

export default AddEditStockItem;
