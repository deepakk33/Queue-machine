import * as React from 'react';

/** Centered confirmation modal over a scrim. Renders null when closed. */
export interface DialogProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  /** @default "Confirm" */
  confirmLabel?: string;
  /** @default "Cancel" */
  cancelLabel?: string;
  /** Red confirm button for destructive actions. @default false */
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function Dialog(props: DialogProps): JSX.Element | null;
