Primary action control — use for any committed action (Start sending, Save, Retry); reach for `variant="danger"` on destructive confirms and `ghost` for low-emphasis inline actions.

```jsx
<Button variant="primary" icon={<Play size={15} />} onClick={start}>
  Start sending
</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="danger" fullWidth>Clear all data</Button>
```

Variants: `primary` (solid blue, one per view), `secondary` (white + hairline border), `ghost` (transparent), `danger` (solid red). Sizes `sm | md | lg` map to the control-height tokens. Press shrinks to 0.97; disabled drops to 45% opacity. Pass `fullWidth` in the 360px panel where buttons usually span the column.
