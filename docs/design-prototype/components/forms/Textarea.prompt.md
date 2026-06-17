Multi-line field for prospect notes, the editable prompt template, and the message composer. Turn on `showCount` with `maxLength={500}` for the InMail limit.

```jsx
<Textarea label="Message" value={msg} onChange={e => setMsg(e.target.value)}
  rows={5} maxLength={500} showCount placeholder="Paste or write the message…" />
```

Counter and border turn red past `maxLength`. Resizes vertically.
