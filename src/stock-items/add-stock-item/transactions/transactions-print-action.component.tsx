import React from 'react'
import {Button} from "@carbon/react"
import { Printer } from '@carbon/react/icons'
import { useTranslation } from 'react-i18next';
import { useStockItem } from '../../stock-items.resource';
import { showModal } from '@openmrs/esm-framework';

type Props = {
  itemUuid: string;
  columns: any;
  data: any;
}

const TransactionsPrintAction: React.FC<Props> = ({ columns, data, itemUuid }) => {
  const {t} = useTranslation()

  const { item: stockItem, isLoading:isStockItemLoading } = useStockItem(itemUuid);


  const handleClick = ()=>{
    // stockItem.drugName || stockItem.conceptName || ''
    const dispose = showModal('transactions-print-preview-modal', {
      onClose: ()=>dispose(),
      title:  stockItem.drugName || stockItem.conceptName || '',
      columns,
      data
    })

  }

  return (
    <Button renderIcon={Printer} iconDescription="Print" onClick={handleClick} disabled={isStockItemLoading}>{t('printBinCard', 'Print Card')}</Button>
  )
}

export default TransactionsPrintAction