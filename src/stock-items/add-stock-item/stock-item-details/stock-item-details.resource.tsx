export interface RadioDrugOption {
  label: string;
  value: boolean;
}

export interface RadioExpirationOption {
  label: string;
  value: string;
}

export const radioOptions: RadioDrugOption[] = [
  { label: "Drug", value: true },
  { label: "Other", value: false },
];

export const expirationOptions: RadioExpirationOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];
