import { z } from "zod";

export const reportSchema = z.object({
  startDate: z.coerce.date().refine((date) => date !== undefined, {
    message: "Start Date is required",
  }),
  endDate: z.coerce.date().refine((date) => date !== undefined, {
    message: "End Date is required",
  }),
  location: z.string({ required_error: "Location Required" }).min(1, {
    message: "Location Required",
  }),
  reportName: z.string({ required_error: "Report Name Required" }).min(1, {
    message: "Report Name Required",
  }),
  stockReportItemCategory: z.string().optional(),
  mostLeastMoving: z.string().optional(),
  mostLeastMovingName: z.string().optional(),
  stockItemUuid: z.string().optional(),
  stockItemName: z.string().optional(),
  patientUuid: z.string().optional(),
  patientName: z.string().optional(),
  locationUuid: z.string().optional(),
  childLocations: z.boolean().optional(),
  stockSourceUuid: z.string().optional(),
  stockSource: z.string().optional(),
  stockSourceDestinationUuid: z.string().optional(),
  stockSourceDestination: z.string().optional(),
  inventoryGroupBy: z.string().optional(),
  inventoryGroupByName: z.string().optional(),
  stockItemCategoryConceptUuid: z.string().optional(),
  reportSystemName: z.string().optional(),
  stockItemCategory: z.string().optional(),
  maxReorderLevelRatio: z.number().optional(),
  fullFillment: z.string().array().optional(),
  limit: z.string().optional(),
  date: z.date().optional(),
});

export type StockReportSchema = z.infer<typeof reportSchema>;
