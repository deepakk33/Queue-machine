Single-line text field for the prospect form (name, profile URL, company…). Pass `label`, optional `icon`, and `error` to show validation state.

```jsx
<Input label="Full name" placeholder="Dana Reed" value={name} onChange={e => setName(e.target.value)} />
<Input label="Profile URL" icon={<Link size={14} />} error="Required" />
```

Hairline border; focus shows a blue ring. Sizes `sm | md | lg`.
