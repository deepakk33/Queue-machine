import React from 'react';

/**
 * Button — the primary action control.
 * Variants: primary (solid blue), secondary (white + border),
 * ghost (transparent), danger (solid red). Press shrinks; hover
 * darkens one step. Sized sm / md / lg to the control-height tokens.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  icon = null,
  iconTrailing = null,
  onClick,
  children,
  style,
  ...rest
}) {
  const [pressed, setPressed] = React.useState(false);

  const sizes = {
    sm: { height: 'var(--control-sm)', padding: '0 10px', font: 'var(--text-xs)', gap: '5px' },
    md: { height: 'var(--control-md)', padding: '0 14px', font: 'var(--text-sm)', gap: '6px' },
    lg: { height: 'var(--control-lg)', padding: '0 18px', font: 'var(--text-base)', gap: '7px' },
  };

  const variants = {
    primary: {
      background: 'var(--accent)', color: 'var(--accent-fg)',
      border: '1px solid transparent', hover: 'var(--accent-hover)', active: 'var(--accent-active)',
    },
    secondary: {
      background: 'var(--surface-card)', color: 'var(--text-body)',
      border: '1px solid var(--border-default)', hover: 'var(--surface-hover)', active: 'var(--surface-active)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-body)',
      border: '1px solid transparent', hover: 'var(--surface-hover)', active: 'var(--surface-active)',
    },
    danger: {
      background: 'var(--red-500)', color: 'var(--slate-0)',
      border: '1px solid transparent', hover: 'var(--red-600)', active: 'var(--red-700)',
    },
  };

  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        fontFamily: 'var(--font-sans)',
        fontSize: s.font,
        fontWeight: 'var(--weight-semibold)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: v.color,
        background: disabled ? v.background : (pressed ? v.active : hover ? v.hover : v.background),
        border: v.border,
        borderRadius: 'var(--radius-sm)',
        boxShadow: variant === 'secondary' ? 'var(--shadow-xs)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {icon ? <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span> : null}
      {children}
      {iconTrailing ? <span style={{ display: 'inline-flex', flexShrink: 0 }}>{iconTrailing}</span> : null}
    </button>
  );
}
