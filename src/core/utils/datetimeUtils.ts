import dayjs from "dayjs";

export const formatDisplayDate = (
  date: Date | null | undefined,
  format?: string
) => {
  return date ? dayjs(date).format(format ?? "DD-MMM-YYYY") : "";
};
