import * as React from 'react';

/** Compact on/off toggle for settings (auto-retry, etc.). */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** Optional inline label to the right of the track. */
  label?: string;
  /** Optional secondary line under the label. */
  description?: string;
  id?: string;
  style?: React.CSSProperties;
}

export function Switch(props: SwitchProps): JSX.Element;
