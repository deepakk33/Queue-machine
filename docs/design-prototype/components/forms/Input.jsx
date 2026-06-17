import React from 'react';

/**
 * Input — single-line text field with optional leading icon and label.
 * Hairline border, blue focus ring. Sized to --control-md by default.
 */
export function Input({
  label,
  hint,
  error,
  icon = null,
  size = 'md',
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId();
  const inputId = id || reactId;
  const height = size === 'sm' ? 'var(--control-sm)' : size === 'lg' ? 'var(--control-lg)' : 'var(--control-md)';
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...style }}>
      {label ? (
        <label htmlFor={inputId} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)' }}>
          {label}
        </label>
      ) : null}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        height, padding: '0 10px',
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-sm)',
        boxShadow: focus && !error ? 'var(--shadow-focus)' : 'var(--shadow-xs)',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
      }}>
        {icon ? <span style={{ display: 'inline-flex', color: 'var(--text-subtle)', flexShrink: 0 }}>{icon}</span> : null}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-strong)',
          }}
          {...rest}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--red-600)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
