import * as React from 'react';

export interface ProgressSegment {
  value: number;
  /** CSS color (usually a --status-*-dot token). */
  color: string;
}

/** Send-run progress bar — single fill or stacked status segments. */
export interface ProgressBarProps {
  value?: number;
  /** @default 100 */
  max?: number;
  /** When provided, renders stacked colored segments instead of a single fill. */
  segments?: ProgressSegment[] | null;
  /** Track height in px. @default 6 */
  height?: number;
  /** Show "value / max" + percent under the bar. @default false */
  showLabel?: boolean;
  style?: React.CSSProperties;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
