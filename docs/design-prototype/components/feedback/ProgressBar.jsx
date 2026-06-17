import React from 'react';

/**
 * ProgressBar — the send-run progress indicator.
 * `value` / `max` drive the fill. Optional segmented mode shows
 * sent / failed / skipped as stacked colored portions.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  segments = null,
  height = 6,
  showLabel = false,
  style,
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      <div style={{
        position: 'relative', width: '100%', height,
        background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', overflow: 'hidden',
      }}>
        {segments ? (
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {segments.map((seg, i) => (
              <span key={i} style={{
                width: `${max > 0 ? (seg.value / max) * 100 : 0}%`,
                height: '100%', background: seg.color,
                transition: 'width var(--dur-slow) var(--ease-in-out)',
              }} />
            ))}
          </div>
        ) : (
          <span style={{
            display: 'block', width: `${pct}%`, height: '100%',
            background: 'var(--accent)', borderRadius: 'var(--radius-pill)',
            transition: 'width var(--dur-slow) var(--ease-in-out)',
          }} />
        )}
      </div>
      {showLabel ? (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)',
        }}>
          <span>{value} / {max}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
    </div>
  );
}
