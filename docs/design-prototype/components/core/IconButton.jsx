import React from 'react';

/**
 * IconButton — a square, icon-only control for toolbars and row actions.
 * Variants: ghost (default, transparent), solid (white + border),
 * accent (blue), danger (red text). Sizes sm / md.
 */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  label,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const dim = size === 'sm' ? 26 : 32;

  const variants = {
    ghost:  { color: 'var(--text-muted)', bg: 'transparent', border: 'transparent', hoverBg: 'var(--surface-hover)', hoverColor: 'var(--text-body)' },
    solid:  { color: 'var(--text-body)', bg: 'var(--surface-card)', border: 'var(--border-default)', hoverBg: 'var(--surface-hover)', hoverColor: 'var(--text-strong)' },
    accent: { color: 'var(--accent-fg)', bg: 'var(--accent)', border: 'transparent', hoverBg: 'var(--accent-hover)', hoverColor: 'var(--accent-fg)' },
    danger: { color: 'var(--red-600)', bg: 'transparent', border: 'transparent', hoverBg: 'var(--red-50)', hoverColor: 'var(--red-700)' },
  };
  const v = variants[variant] || variants.ghost;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        flexShrink: 0,
        color: hover ? v.hoverColor : v.color,
        background: hover ? v.hoverBg : v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transform: pressed && !disabled ? 'scale(0.92)' : 'scale(1)',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
