import React from 'react';

/**
 * Switch — a compact toggle for settings (e.g. auto-retry).
 * Track turns blue when on; knob slides with a quick ease-out.
 */
export function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  style,
}) {
  const reactId = React.useId();
  const switchId = id || reactId;
  const W = 34, H = 20, KNOB = 14;

  const toggle = () => { if (!disabled && onChange) onChange(!checked); };

  const control = (
    <button
      type="button"
      role="switch"
      id={switchId}
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      style={{
        position: 'relative', width: W, height: H, flexShrink: 0, padding: 0,
        background: checked ? 'var(--accent)' : 'var(--slate-300)',
        border: 'none', borderRadius: 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-base) var(--ease-out)',
      }}
    >
      <span style={{
        position: 'absolute', top: (H - KNOB) / 2, left: checked ? W - KNOB - 3 : 3,
        width: KNOB, height: KNOB, borderRadius: '50%',
        background: 'var(--slate-0)', boxShadow: 'var(--shadow-sm)',
        transition: 'left var(--dur-base) var(--ease-out)',
      }} />
    </button>
  );

  if (!label) return <span style={style}>{control}</span>;

  return (
    <label htmlFor={switchId} style={{
      display: 'flex', alignItems: description ? 'flex-start' : 'center', gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer', ...style,
    }}>
      {control}
      <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>{label}</span>
        {description ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-snug)' }}>{description}</span> : null}
      </span>
    </label>
  );
}
