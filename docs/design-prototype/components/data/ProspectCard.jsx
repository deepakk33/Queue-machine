import React from 'react';
import { StatusBadge } from '../feedback/StatusBadge.jsx';

/**
 * ProspectCard — a single row in the queue. Shows name, title/company,
 * status badge and a message preview (or muted "No message"). Hover
 * lifts the card and reveals row actions passed via `actions`.
 */
export function ProspectCard({
  name,
  designation,
  company,
  message,
  status = 'pending',
  failureReason,
  selected = false,
  onClick,
  actions = null,
  style,
}) {
  const [hover, setHover] = React.useState(false);
  const subtitle = [designation, company].filter(Boolean).join(' · ');

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 7,
        padding: '11px 12px',
        background: 'var(--surface-card)',
        border: `1px solid ${selected ? 'var(--border-focus)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: hover ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--text-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-strong)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{name}</div>
          {subtitle ? (
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{subtitle}</div>
          ) : null}
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{
        fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-snug)',
        color: message ? 'var(--text-body)' : 'var(--text-subtle)',
        fontStyle: message ? 'normal' : 'italic',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {message || 'No message'}
      </div>

      {status === 'failed' && failureReason ? (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red-600)', display: 'flex', gap: 5 }}>
          <span aria-hidden="true">⚠</span>{failureReason}
        </div>
      ) : null}

      {actions && (hover || selected) ? (
        <div style={{ display: 'flex', gap: 4, marginTop: 2 }} onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
