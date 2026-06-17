Compact toggle for boolean settings. Pass `label` (and optional `description`) for the settings rows, or use bare for inline.

```jsx
<Switch checked={autoRetry} onChange={setAutoRetry}
  label="Auto-retry failed sends"
  description="Re-queue a failed prospect until max retries." />
```

Track turns blue when on; knob slides 180ms.
