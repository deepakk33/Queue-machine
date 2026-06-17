import * as React from 'react';

/** Square icon-only control for toolbars and prospect-row actions. */
export interface IconButtonProps {
  /** @default "ghost" */
  variant?: 'ghost' | 'solid' | 'accent' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Accessible label — also the tooltip. Required for icon-only controls. */
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** The icon node (e.g. a Lucide glyph). */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function IconButton(props: IconButtonProps): JSX.Element;
