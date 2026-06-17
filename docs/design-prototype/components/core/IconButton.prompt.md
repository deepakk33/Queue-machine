Square, icon-only control for toolbars and per-row actions (edit, delete, open profile, retry). Always pass `label` for accessibility + tooltip.

```jsx
<IconButton label="Edit prospect" onClick={edit}><Pencil size={15} /></IconButton>
<IconButton variant="danger" label="Delete"><Trash2 size={15} /></IconButton>
<IconButton variant="accent" label="Add prospect"><Plus size={16} /></IconButton>
```

Variants: `ghost` (default), `solid`, `accent`, `danger`. Sizes `sm` (26px) / `md` (32px). Press shrinks to 0.92.
