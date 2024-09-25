import React from 'react';

export interface DataTableRenderProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, defaultValue?: string) => void;
}
