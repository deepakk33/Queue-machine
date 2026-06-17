// Loads settings on mount and exposes the settings store.
import { useEffect } from "react";
import { useSettingsStore } from "../../store/settings-store";

export function useSettings() {
  const store = useSettingsStore();
  useEffect(() => {
    if (!store.loaded) void store.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return store;
}
