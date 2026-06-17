import { useEffect } from "react";

export function Toast({
  message,
  onDone,
  duration = 2000,
}: {
  message: string;
  onDone: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDone]);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[320px] -translate-x-1/2 animate-dmq-pop items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-xs text-stone-0 shadow-lg">
      <span className="h-[7px] w-[7px] shrink-0 rounded-pill bg-accent" />
      {message}
    </div>
  );
}
