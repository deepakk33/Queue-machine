import React from 'react';

/**
 * Toast — a transient confirmation (e.g. "Context copied to clipboard").
 * Static presentational component: render it when visible, position with
 * the wrapping container. Variants info / success / error.
 */
export function Toast({ variant = 'success', icon = null, children, onDismiss, style }) {
  const accent = {
    success: 'var(--emerald-500)',
    error: 'var(--red-500)',
    info: 'var(--accent)',
  }[variant] || 'var(--emerald-500)';

  return (
    <div
      role="status"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '9px',
        maxWidth: 320, padding: '9px 12px',
        background: 'var(--slate-900)', color: 'var(--slate-0)',
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
        fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', color: accent, flexShrink: 0 }}>
        {icon || <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />}
      </span>
      <span style={{ flex: 1, lineHeight: 'var(--leading-snug)' }}>{children}</span>
      {onDismiss ? (
        <button
          type="button" onClick={onDismiss} aria-label="Dismiss"
          style={{
            display: 'inline-flex', border: 'none', background: 'transparent',
            color: 'var(--slate-400)', cursor: 'pointer', padding: 0, marginLeft: 2,
            fontSize: 'var(--text-base)', lineHeight: 1,
          }}
        >×</button>
      ) : null}
    </div>
  );
}
