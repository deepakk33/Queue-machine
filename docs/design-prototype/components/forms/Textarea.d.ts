import * as React from 'react';

/** Multi-line field for notes, the prompt template, and the message composer. */
export interface TextareaProps {
  label?: string;
  hint?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  /** @default 4 */
  rows?: number;
  /** Soft cap — turns the counter and border red when exceeded. */
  maxLength?: number;
  /** Show a live character counter in the label row. @default false */
  showCount?: boolean;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export function Textarea(props: TextareaProps): JSX.Element;
