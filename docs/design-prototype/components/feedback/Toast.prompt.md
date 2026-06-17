Dark transient confirmation — most often the "Context copied to clipboard" toast after Copy Context, or a save confirmation. Presentational: you control visibility/timeout and positioning.

```jsx
<Toast variant="success" icon={<ClipboardCheck size={15} />}>
  Context copied to clipboard
</Toast>
```

Variants `success | error | info` tint the leading glyph. Pass `onDismiss` for a × button.
