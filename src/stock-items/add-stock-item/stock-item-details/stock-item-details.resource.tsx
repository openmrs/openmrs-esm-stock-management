export interface RadioOption {
  label: string;
  value: boolean | string;
}

export const radioOptions: RadioOption[] = [
  { label: "Drug", value: true },
  { label: "Other", value: false },
];

export const expirationOptions: RadioOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];
