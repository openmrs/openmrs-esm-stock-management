import React, { useRef } from 'react';
import TransactionsBincardPrintout from './transactions-bincard-printout.component';
import TransactionsStockcardPrintout from './transactions-stockcard-printout.component';
import { ModalBody, ModalHeader, ModalFooter, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
type Props = {
  onClose?: () => void;
  title?: string;
  columns: any;
  data: any;
};

const TransactionsStockcardPrintPreview: React.FC<Props> = ({ onClose, title, columns, data }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });
  return (
    <>
      <ModalHeader closeModal={onClose} title={t('printbincard', 'Print Stock Card')} />
      <ModalBody>
        <div ref={ref}>
          <TransactionsStockcardPrintout title={title} columns={columns} items={data} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="button" onClick={handlePrint}>
          {t('print', 'Print')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default TransactionsStockcardPrintPreview;
