export interface RadioOption {
  label: string;
  value: boolean;
}

export const radioOptions: RadioOption[] = [
  { label: "Drug", value: true },
  { label: "Other", value: false },
];

export const expirationOptions: RadioOption[] = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];
