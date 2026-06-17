import * as React from 'react';

/**
 * A single prospect row in the queue — the core data card of the app.
 *
 * @startingPoint section="Data" subtitle="Prospect queue row with status + message preview" viewport="380x150"
 */
export interface ProspectCardProps {
  name: string;
  designation?: string;
  company?: string;
  /** Composed message; renders a muted "No message" when empty. */
  message?: string;
  /** @default "pending" */
  status?: 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
  /** Shown in red when status is "failed". */
  failureReason?: string;
  selected?: boolean;
  onClick?: () => void;
  /** Row-action nodes (IconButtons) revealed on hover/selection. */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export function ProspectCard(props: ProspectCardProps): JSX.Element;
