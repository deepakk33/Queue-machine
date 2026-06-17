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
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
      {message}
    </div>
  );
}
