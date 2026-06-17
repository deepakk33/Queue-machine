import React from 'react';

/**
 * Dialog — a centered confirmation modal over a scrim. Used for
 * destructive confirms (Clear all data, Delete prospect).
 * Controlled via `open`; renders nothing when closed.
 */
export function Dialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'rgba(20, 26, 35, 0.45)',
        animation: 'dmq-fade var(--dur-base) var(--ease-out)',
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 320,
          background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          animation: 'dmq-pop var(--dur-base) var(--ease-out)',
        }}
      >
        <div style={{ padding: '18px 18px 14px' }}>
          {title ? (
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)', marginBottom: 6 }}>
              {title}
            </h2>
          ) : null}
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
            {children}
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end',
          padding: '12px 18px', background: 'var(--surface-sunken)',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button type="button" onClick={onCancel} style={{
            height: 'var(--control-md)', padding: '0 14px',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            color: 'var(--text-body)', background: 'var(--surface-card)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm} style={{
            height: 'var(--control-md)', padding: '0 14px',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            color: 'var(--slate-0)',
            background: destructive ? 'var(--red-500)' : 'var(--accent)',
            border: '1px solid transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}>{confirmLabel}</button>
        </div>
      </div>
      <style>{`
        @keyframes dmq-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dmq-pop { from { opacity: 0; transform: translateY(6px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
