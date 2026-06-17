import * as React from 'react';

/**
 * Color-coded status pill — the heartbeat of the queue UI.
 *
 * @startingPoint section="Feedback" subtitle="The five queue status pills" viewport="700x190"
 */
export interface StatusBadgeProps {
  /** @default "pending" */
  status?: 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
  /** Optional trailing count — used on filter chips ("sent 9"). */
  count?: number;
  /** Override the visible text (defaults to the status word). */
  label?: string;
  style?: React.CSSProperties;
}

export function StatusBadge(props: StatusBadgeProps): JSX.Element;
