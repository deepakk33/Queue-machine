Progress indicator for an active send run. Use the simple fill for "4 of 12", or `segments` to break the bar into sent / failed / skipped.

```jsx
<ProgressBar value={4} max={12} showLabel />

<ProgressBar max={12} segments={[
  { value: 9, color: 'var(--status-sent-dot)' },
  { value: 2, color: 'var(--status-failed-dot)' },
  { value: 1, color: 'var(--status-skipped-dot)' },
]} />
```

Fill animates with `--ease-in-out`. Track uses `--surface-sunken`.
