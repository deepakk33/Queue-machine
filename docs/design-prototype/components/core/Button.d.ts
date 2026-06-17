import * as React from 'react';

/**
 * The primary action control for the DM Queue side panel.
 *
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost / danger button" viewport="700x150"
 */
export interface ButtonProps {
  /** Visual weight. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to the container width (common in the narrow panel). @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  /** Leading icon node (e.g. a Lucide <Play/>). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconTrailing?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
