// Zustand store for settings. Backed by db/settings (single "default" row).
import { create } from "zustand";
import type { Settings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import * as settingsDb from "../db/settings";

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  save: (changes: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    const settings = await settingsDb.getSettings();
    set({ settings, loaded: true });
  },

  save: async (changes) => {
    const next = await settingsDb.updateSettings(changes);
    set({ settings: next });
  },
}));
