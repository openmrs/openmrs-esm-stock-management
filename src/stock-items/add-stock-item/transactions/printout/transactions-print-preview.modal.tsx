import React, { useRef } from 'react';
import TransactionsPrintout from './transactions-printout.component';
import { ModalBody, ModalHeader, ModalFooter, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
type Props = {
  onClose?: () => void;
  title?: string;
  columns: any;
  data: any;
};

const TransactionsPrintPreview: React.FC<Props> = ({ onClose, title, columns, data }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });
  return (
    <>
      <ModalHeader closeModal={onClose} title={t('printbincard', 'Print Bin Card')} />
      <ModalBody>
        <div ref={ref}>
          <TransactionsPrintout title={title} columns={columns} data={data} />
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

export default TransactionsPrintPreview;
