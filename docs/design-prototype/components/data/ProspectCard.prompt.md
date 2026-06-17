A single prospect row in the queue list — the app's core data card. Shows name, title · company, status badge, a 2-line message preview (muted "No message" when empty), and a failure reason when failed. Hover reveals `actions`.

```jsx
<ProspectCard
  name="Dana Reed" designation="VP Growth" company="Northbeam"
  status="failed" failureReason="Composer did not open"
  message="Hi Dana — saw Northbeam shipped…"
  actions={<>
    <IconButton label="Retry"><RotateCcw size={14} /></IconButton>
    <IconButton label="Edit"><Pencil size={14} /></IconButton>
  </>}
/>
```

Composes `StatusBadge`. Selected state tints the whole border blue.
