import { z } from 'zod';

export const stockItemSchema = z.object({});
export type StockItemFormData = z.infer<typeof stockItemSchema>;
