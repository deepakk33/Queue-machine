// Loads the queue on mount and exposes the queue store.
import { useEffect } from "react";
import { useQueueStore } from "../../store/queue-store";

export function useQueue() {
  const store = useQueueStore();
  useEffect(() => {
    void store.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return store;
}
