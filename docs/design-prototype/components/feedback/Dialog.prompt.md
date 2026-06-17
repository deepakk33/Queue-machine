Confirmation modal for destructive or important actions (Clear all data, Delete prospect, Stop run). Controlled via `open`.

```jsx
<Dialog open={confirming} title="Clear all data?" destructive
  confirmLabel="Clear all data" onConfirm={wipe} onCancel={() => setConfirming(false)}>
  This removes every prospect and cannot be undone.
</Dialog>
```

Pass `destructive` for the red confirm button. Scrim click and Cancel both call `onCancel`.
