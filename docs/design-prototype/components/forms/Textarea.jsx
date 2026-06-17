import React from 'react';

/**
 * Textarea — multi-line field for notes and the message composer.
 * Optional character counter (useful for the ~500-char InMail limit).
 */
export function Textarea({
  label,
  hint,
  value = '',
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  showCount = false,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId();
  const fieldId = id || reactId;
  const over = maxLength != null && value.length > maxLength;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...style }}>
      {label ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label htmlFor={fieldId} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)' }}>
            {label}
          </label>
          {showCount ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: over ? 'var(--red-600)' : 'var(--text-subtle)' }}>
              {value.length}{maxLength != null ? `/${maxLength}` : ''}
            </span>
          ) : null}
        </div>
      ) : null}
      <textarea
        id={fieldId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', resize: 'vertical', minHeight: 64,
          padding: '8px 10px',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-snug)',
          color: 'var(--text-strong)',
          background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
          border: `1px solid ${over ? 'var(--red-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: focus && !over ? 'var(--shadow-focus)' : 'var(--shadow-xs)',
          outline: 'none',
          transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        }}
        {...rest}
      />
      {hint ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span> : null}
    </div>
  );
}
