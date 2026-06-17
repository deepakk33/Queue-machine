// Brand lockup from docs/design-prototype/assets/wordmark.html:
// dusty-purple rounded square with three stacked bars + title/subtitle.
export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 flex-col justify-center gap-1 rounded-md bg-accent px-2">
        <i className="h-[3px] w-[18px] rounded-xs bg-stone-0" />
        <i className="h-[3px] w-[18px] rounded-xs bg-stone-0 opacity-70" />
        <i className="h-[3px] w-3 rounded-xs bg-stone-0 opacity-40" />
      </div>
      <div className="flex flex-col">
        <span className="font-display text-md font-medium leading-none text-stone-900">
          DM&nbsp;Queue
        </span>
        <span className="mono text-2xs text-stone-500">Sales Navigator</span>
      </div>
    </div>
  );
}
