export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-[34px] shrink-0 rounded-pill transition-colors duration-[180ms] ease-out focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-accent" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute top-[3px] h-3.5 w-3.5 rounded-pill bg-stone-0 shadow-xs transition-[left] duration-[180ms] ease-out ${
          checked ? "left-[17px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
