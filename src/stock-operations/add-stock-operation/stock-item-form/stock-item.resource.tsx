import { z } from 'zod';
import { baseStockOperationSchema } from '../validationSchema';

export const stockItemSchema = z.object(baseStockOperationSchema);
export const requisitionOperationItemSchema = stockItemSchema.omit({
  batchNo: true,
  expiration: true,
});
export const adjustmentOperationItemSchema = stockItemSchema.extend({
  quantity: z.coerce
    .number()
    .refine((value) => value !== 0, {
      message: 'Quantity cannot be zero.',
    })
    .or(z.literal(0, { invalid_type_error: 'Invalid quantity format' })),
});

export type StockItemFormData = z.infer<typeof stockItemSchema>;
export type RequisitionOperationItemFormData = z.infer<typeof requisitionOperationItemSchema>;
export type AdjustmentOperationItemFormData = z.infer<typeof adjustmentOperationItemSchema>;

export const useStockItemValidationSchema = (operationType?: string) => {
  if (operationType === 'requisition') {
    return requisitionOperationItemSchema;
  }
  if (operationType === 'adjustment') {
    return adjustmentOperationItemSchema;
  }
  return stockItemSchema;
};
