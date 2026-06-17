import * as React from 'react';

/** Transient dark confirmation toast (clipboard copy, save, errors). */
export interface ToastProps {
  /** @default "success" */
  variant?: 'success' | 'error' | 'info';
  /** Optional leading icon; falls back to a colored dot. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  /** When provided, shows a dismiss (×) button. */
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

export function Toast(props: ToastProps): JSX.Element;
