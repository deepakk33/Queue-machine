The color-coded status pill used on every prospect row, in filters, and in the summary. The `sending` variant pulses its dot to signal "live".

```jsx
<StatusBadge status="sent" />
<StatusBadge status="failed" />
<StatusBadge status="pending" count={7} label="pending" />  // filter chip
```

Maps 1:1 to the `ProspectStatus` enum: pending · sending · sent · failed · skipped. Colors come from the `--status-*` tokens.
