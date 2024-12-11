import { DefaultWorkspaceProps } from '@openmrs/esm-framework';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StockItemFormData } from './stock-item.resource';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockItemDetailsSchema } from '../../../stock-items/validationSchema';
import { Form } from '@carbon/react';
import styles from './stock-item-form.scss';
import { Stack } from '@carbon/react';
import { Column } from '@carbon/react';
import { DatePicker } from '@carbon/react';
import { ButtonSet } from '@carbon/react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface StockItemFormProps extends DefaultWorkspaceProps {
  id: string;
}
const StockItemForm: React.FC<StockItemFormProps> = ({ closeWorkspace, id }) => {
  const form = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemDetailsSchema),
    defaultValues: {},
  });
  const { t } = useTranslation();

  const onSubmit = (data: StockItemFormData) => {
    // Implementation of adding or updating itsms in items table
  };
  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <Stack gap={4} className={styles.grid}></Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isValid}
        >
          {t('submit', 'Submit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StockItemForm;
