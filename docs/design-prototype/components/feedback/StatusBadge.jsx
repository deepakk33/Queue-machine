import React from 'react';

const STATUS = {
  pending: { bg: 'var(--status-pending-bg)', fg: 'var(--status-pending-fg)', dot: 'var(--status-pending-dot)', label: 'pending' },
  sending: { bg: 'var(--status-sending-bg)', fg: 'var(--status-sending-fg)', dot: 'var(--status-sending-dot)', label: 'sending' },
  sent:    { bg: 'var(--status-sent-bg)',    fg: 'var(--status-sent-fg)',    dot: 'var(--status-sent-dot)',    label: 'sent' },
  failed:  { bg: 'var(--status-failed-bg)',  fg: 'var(--status-failed-fg)',  dot: 'var(--status-failed-dot)',  label: 'failed' },
  skipped: { bg: 'var(--status-skipped-bg)', fg: 'var(--status-skipped-fg)', dot: 'var(--status-skipped-dot)', label: 'skipped' },
};

/**
 * StatusBadge — the color-coded pill that runs through the whole UI.
 * The "sending" state pulses its dot. Use `count` for filter chips.
 */
export function StatusBadge({ status = 'pending', count, label, style }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 9px 3px 7px',
      background: s.bg, color: s.fg,
      borderRadius: 'var(--radius-pill)',
      fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
      lineHeight: 1, whiteSpace: 'nowrap', ...style,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0,
        animation: status === 'sending' ? 'dmq-pulse 1.4s var(--ease-in-out) infinite' : 'none',
      }} />
      {label || s.label}
      {count != null ? (
        <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}>{count}</span>
      ) : null}
      <style>{`@keyframes dmq-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}`}</style>
    </span>
  );
}
