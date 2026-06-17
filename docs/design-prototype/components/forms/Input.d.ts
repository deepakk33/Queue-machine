import * as React from 'react';

/** Single-line text field with optional label, leading icon, hint and error. */
export interface InputProps {
  label?: string;
  hint?: string;
  /** When set, the field reads as invalid (red border) and shows this message. */
  error?: string;
  icon?: React.ReactNode;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** @default "text" */
  type?: string;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
