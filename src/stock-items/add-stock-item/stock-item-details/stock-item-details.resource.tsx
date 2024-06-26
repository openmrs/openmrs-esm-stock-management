export interface RadioOption {
  label: string;
  value: boolean;
}

export const radioOptions: RadioOption[] = [
  { label: "Pharmaceuticals", value: true },
  { label: "Non Pharmaceuticals", value: false },
];

export const expirationOptions: RadioOption[] = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];
